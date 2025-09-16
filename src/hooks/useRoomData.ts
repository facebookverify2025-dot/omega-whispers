import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string | null;
  message_type: 'text' | 'file' | 'audio' | 'video' | 'image';
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  created_at: string;
  participant_id: string;
  participants: {
    user_name: string;
  };
}

interface Participant {
  id: string;
  user_name: string;
  is_online: boolean;
  session_id: string;
}

export const useRoomData = (roomCode: string, userName: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionId = useRef(crypto.randomUUID());
  const { toast } = useToast();

  // Join or create room
  useEffect(() => {
    const joinRoom = async () => {
      try {
        // Check if room exists
        let { data: room } = await supabase
          .from('rooms')
          .select('id')
          .eq('code', roomCode)
          .maybeSingle();

        // Create room if it doesn't exist
        if (!room) {
          const { data: newRoom, error } = await supabase
            .from('rooms')
            .insert({ code: roomCode })
            .select('id')
            .single();

          if (error) throw error;
          room = newRoom;
        }

        setRoomId(room.id);

        // Join as participant
        const { data: participant, error: participantError } = await supabase
          .from('participants')
          .insert({
            room_id: room.id,
            user_name: userName,
            session_id: sessionId.current,
            is_online: true
          })
          .select('id')
          .single();

        if (participantError) throw participantError;
        setParticipantId(participant.id);

        // Load existing messages
        const { data: existingMessages } = await supabase
          .from('messages')
          .select(`
            id, content, message_type, file_url, file_name, file_size, created_at, participant_id,
            participants!inner(user_name)
          `)
          .eq('room_id', room.id)
          .order('created_at', { ascending: true });

        if (existingMessages) {
          setMessages(existingMessages as Message[]);
        }

        // Load participants
        const { data: roomParticipants } = await supabase
          .from('participants')
          .select('id, user_name, is_online, session_id')
          .eq('room_id', room.id)
          .eq('is_online', true);

        if (roomParticipants) {
          setParticipants(roomParticipants);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error joining room:', error);
        toast({
          title: "خطأ",
          description: "فشل في الانضمام للغرفة",
          variant: "destructive"
        });
        setLoading(false);
      }
    };

    joinRoom();
  }, [roomCode, userName, toast]);

  // Real-time subscriptions
  useEffect(() => {
    if (!roomId) return;

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('messages-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomId}`
      }, async (payload) => {
        // Fetch the complete message with participant info
        const { data: newMessage } = await supabase
          .from('messages')
          .select(`
            id, content, message_type, file_url, file_name, file_size, created_at, participant_id,
            participants!inner(user_name)
          `)
          .eq('id', payload.new.id)
          .single();

        if (newMessage) {
          setMessages(prev => [...prev, newMessage as Message]);
        }
      })
      .subscribe();

    // Subscribe to participant changes
    const participantsChannel = supabase
      .channel('participants-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'participants',
        filter: `room_id=eq.${roomId}`
      }, () => {
        // Reload participants
        supabase
          .from('participants')
          .select('id, user_name, is_online, session_id')
          .eq('room_id', roomId)
          .eq('is_online', true)
          .then(({ data }) => {
            if (data) setParticipants(data);
          });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [roomId]);

  // Update online status periodically
  useEffect(() => {
    if (!participantId) return;

    const updateOnlineStatus = () => {
      supabase
        .from('participants')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', participantId)
        .then();
    };

    const interval = setInterval(updateOnlineStatus, 30000); // Every 30 seconds
    
    // Update on page visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateOnlineStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [participantId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (participantId) {
        supabase
          .from('participants')
          .update({ is_online: false })
          .eq('id', participantId)
          .then();
      }
    };
  }, [participantId]);

  const sendMessage = async (content: string, type: 'text' | 'file' | 'audio' | 'video' | 'image' = 'text', fileData?: { url: string; name: string; size: number }) => {
    if (!roomId || !participantId) return;

    try {
      const messageData = {
        room_id: roomId,
        participant_id: participantId,
        content: type === 'text' ? content : null,
        message_type: type,
        file_url: fileData?.url || null,
        file_name: fileData?.name || null,
        file_size: fileData?.size || null
      };

      const { error } = await supabase
        .from('messages')
        .insert(messageData);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "خطأ",
        description: "فشل في إرسال الرسالة",
        variant: "destructive"
      });
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${roomCode}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('omega-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('omega-files')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "خطأ",
        description: "فشل في رفع الملف",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    messages,
    participants,
    loading,
    sendMessage,
    uploadFile,
    currentUserName: userName,
    participantId
  };
};