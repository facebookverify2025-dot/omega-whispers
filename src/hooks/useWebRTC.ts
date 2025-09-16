import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface WebRTCPeer {
  id: string;
  name: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

export const useWebRTC = (roomCode: string, userName: string) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [peers, setPeers] = useState<WebRTCPeer[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const { toast } = useToast();

  // WebSocket for signaling (we'll create this as a simple state manager for now)
  const signalingChannelRef = useRef<BroadcastChannel | null>(null);

  const createPeerConnection = useCallback((peerId: string, peerName: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && signalingChannelRef.current) {
        signalingChannelRef.current.postMessage({
          type: 'ice-candidate',
          candidate: event.candidate,
          to: peerId,
          from: userName,
          roomCode
        });
      }
    };

    pc.ontrack = (event) => {
      setPeers(prev => prev.map(peer => 
        peer.id === peerId 
          ? { ...peer, stream: event.streams[0] }
          : peer
      ));
    };

    return pc;
  }, [userName, roomCode]);

  const initializeSignaling = useCallback(() => {
    if (signalingChannelRef.current) return;

    // Using BroadcastChannel for simple local signaling (in real app, use WebSocket)
    signalingChannelRef.current = new BroadcastChannel(`omega-webrtc-${roomCode}`);
    
    signalingChannelRef.current.onmessage = async (event) => {
      const { type, from, to, offer, answer, candidate } = event.data;
      
      if (to !== userName) return;

      const peer = peers.find(p => p.id === from);
      if (!peer) return;

      switch (type) {
        case 'offer':
          await peer.connection.setRemoteDescription(new RTCSessionDescription(offer));
          const answer_desc = await peer.connection.createAnswer();
          await peer.connection.setLocalDescription(answer_desc);
          
          signalingChannelRef.current?.postMessage({
            type: 'answer',
            answer: answer_desc,
            to: from,
            from: userName,
            roomCode
          });
          break;

        case 'answer':
          await peer.connection.setRemoteDescription(new RTCSessionDescription(answer));
          break;

        case 'ice-candidate':
          await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
          break;

        case 'user-joined':
          if (from !== userName) {
            const newPeer: WebRTCPeer = {
              id: from,
              name: from,
              connection: createPeerConnection(from, from)
            };
            setPeers(prev => [...prev, newPeer]);
          }
          break;

        case 'user-left':
          setPeers(prev => {
            const peer = prev.find(p => p.id === from);
            if (peer) {
              peer.connection.close();
            }
            return prev.filter(p => p.id !== from);
          });
          break;
      }
    };
  }, [roomCode, userName, peers, createPeerConnection]);

  const startCall = useCallback(async (video: boolean = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: video
      });

      localStreamRef.current = stream;
      setIsCallActive(true);
      setIsVideoEnabled(video);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      initializeSignaling();

      // Add tracks to all peer connections
      peers.forEach(peer => {
        stream.getTracks().forEach(track => {
          peer.connection.addTrack(track, stream);
        });
      });

      // Signal that user joined
      signalingChannelRef.current?.postMessage({
        type: 'user-joined',
        from: userName,
        roomCode
      });

      // Start offering to all peers
      peers.forEach(async (peer) => {
        const offer = await peer.connection.createOffer();
        await peer.connection.setLocalDescription(offer);
        
        signalingChannelRef.current?.postMessage({
          type: 'offer',
          offer,
          to: peer.id,
          from: userName,
          roomCode
        });
      });

      toast({
        title: video ? "مكالمة فيديو بدأت" : "مكالمة صوتية بدأت",
        description: "تم بدء المكالمة بنجاح"
      });
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "خطأ",
        description: "فشل في بدء المكالمة",
        variant: "destructive"
      });
    }
  }, [peers, userName, roomCode, initializeSignaling, toast]);

  const endCall = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    peers.forEach(peer => {
      peer.connection.close();
    });

    setPeers([]);
    setIsCallActive(false);
    setIsVideoEnabled(false);
    setIsMuted(false);

    signalingChannelRef.current?.postMessage({
      type: 'user-left',
      from: userName,
      roomCode
    });

    signalingChannelRef.current?.close();
    signalingChannelRef.current = null;

    toast({
      title: "انتهت المكالمة",
      description: "تم إنهاء المكالمة"
    });
  }, [peers, userName, roomCode, toast]);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  const toggleVideo = useCallback(async () => {
    if (!localStreamRef.current) return;

    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
    } else if (!isVideoEnabled) {
      // Add video track
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const newVideoTrack = videoStream.getVideoTracks()[0];
        
        localStreamRef.current.addTrack(newVideoTrack);
        
        // Add to all peer connections
        peers.forEach(peer => {
          peer.connection.addTrack(newVideoTrack, localStreamRef.current!);
        });

        setIsVideoEnabled(true);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
      } catch (error) {
        toast({
          title: "خطأ",
          description: "فشل في تفعيل الكاميرا",
          variant: "destructive"
        });
      }
    }
  }, [isVideoEnabled, peers, toast]);

  return {
    isCallActive,
    isVideoEnabled,
    isMuted,
    peers,
    localVideoRef,
    startCall,
    endCall,
    toggleMute,
    toggleVideo
  };
};