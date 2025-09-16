import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWebRTC } from '@/hooks/useWebRTC';

interface CallControlsProps {
  roomCode: string;
  userName: string;
}

export const CallControls = ({ roomCode, userName }: CallControlsProps) => {
  const {
    isCallActive,
    isVideoEnabled,
    isMuted,
    peers,
    localVideoRef,
    startCall,
    endCall,
    toggleMute,
    toggleVideo
  } = useWebRTC(roomCode, userName);

  if (!isCallActive) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => startCall(false)}
          className="text-muted-foreground hover:text-success"
          title="اتصال صوتي"
        >
          <Phone className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => startCall(true)}
          className="text-muted-foreground hover:text-primary"
          title="اتصال فيديو"
        >
          <Video className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video area */}
      {isVideoEnabled && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto">
          {/* Local video */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              أنت
            </div>
          </div>
          
          {/* Remote videos */}
          {peers.map((peer) => (
            <div key={peer.id} className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                ref={(el) => {
                  if (el && peer.stream) {
                    el.srcObject = peer.stream;
                  }
                }}
              />
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {peer.name}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Audio indicator for voice-only calls */}
      {!isVideoEnabled && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-success">
            <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
            <span>مكالمة صوتية نشطة</span>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            {peers.length > 0 ? `متصل مع ${peers.length} شخص` : 'في انتظار المتصلين...'}
          </div>
        </div>
      )}
      
      {/* Call controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant={isMuted ? "destructive" : "secondary"}
          size="lg"
          onClick={toggleMute}
          className="rounded-full w-12 h-12 p-0"
          title={isMuted ? "إلغاء كتم الصوت" : "كتم الصوت"}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        
        <Button
          variant="destructive"
          size="lg"
          onClick={endCall}
          className="rounded-full w-12 h-12 p-0"
          title="إنهاء المكالمة"
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
        
        <Button
          variant={isVideoEnabled ? "secondary" : "outline"}
          size="lg"
          onClick={toggleVideo}
          className="rounded-full w-12 h-12 p-0"
          title={isVideoEnabled ? "إيقاف الكاميرا" : "تشغيل الكاميرا"}
        >
          {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Participants list */}
      {peers.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          المتصلون: {peers.map(p => p.name).join(', ')}
        </div>
      )}
    </div>
  );
};