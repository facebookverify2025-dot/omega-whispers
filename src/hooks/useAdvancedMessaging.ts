import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MessageStatus {
  id: string;
  is_sent: boolean;
  is_delivered: boolean;
  is_read: boolean;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
}

export interface TypingIndicator {
  participant_id: string;
  participant_name: string;
  is_typing: boolean;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  participant_id: string;
  reaction: string;
  created_at: string;
}

export interface MessageReply {
  id: string;
  message_id: string;
  reply_to_message_id: string;
  reply_preview: string;
}

export const useAdvancedMessaging = (roomId: string, participantId: string | null) => {
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [messageStatuses, setMessageStatuses] = useState<Record<string, MessageStatus>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Send typing indicator
  const sendTypingIndicator = async (typing: boolean) => {
    if (!participantId || !roomId) return;
    
    try {
      await supabase
        .from('typing_indicators')
        .upsert({
          room_id: roomId,
          participant_id: participantId,
          is_typing: typing,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  };

  // Handle typing with debounce
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(false);
    }, 3000);
  };

  // Mark message as read
  const markMessageAsRead = async (messageId: string) => {
    if (!participantId) return;

    try {
      await supabase
        .from('message_status')
        .upsert({
          message_id: messageId,
          participant_id: participantId,
          is_read: true,
          read_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Add reaction to message
  const addReaction = async (messageId: string, reaction: string) => {
    if (!participantId) return;

    try {
      await supabase
        .from('message_reactions')
        .upsert({
          message_id: messageId,
          participant_id: participantId,
          reaction: reaction
        });

      toast({
        title: "تم إضافة التفاعل",
        description: `تم إضافة ${reaction}`,
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  // Delete message
  const deleteMessage = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({
          content: 'تم حذف هذه الرسالة',
          message_type: 'deleted'
        })
        .eq('id', messageId)
        .eq('participant_id', participantId);

      toast({
        title: "تم حذف الرسالة",
        description: "تم حذف الرسالة بنجاح",
      });
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Edit message
  const editMessage = async (messageId: string, newContent: string) => {
    try {
      await supabase
        .from('messages')
        .update({
          content: newContent,
          is_edited: true,
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('participant_id', participantId);

      toast({
        title: "تم تعديل الرسالة",
        description: "تم تعديل الرسالة بنجاح",
      });
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  // Reply to message
  const replyToMessage = async (originalMessageId: string, replyContent: string, replyPreview: string) => {
    if (!participantId || !roomId) return;

    try {
      // Create the reply message
      const { data: replyMessage, error: messageError } = await supabase
        .from('messages')
        .insert({
          room_id: roomId,
          participant_id: participantId,
          content: replyContent,
          message_type: 'text'
        })
        .select('id')
        .single();

      if (messageError) throw messageError;

      // Create the reply relationship
      await supabase
        .from('message_replies')
        .insert({
          message_id: replyMessage.id,
          reply_to_message_id: originalMessageId,
          reply_preview: replyPreview
        });

      setSelectedMessage(null);
    } catch (error) {
      console.error('Error replying to message:', error);
    }
  };

  // Share location
  const shareLocation = async () => {
    if (!participantId || !roomId) return;

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;

      await supabase
        .from('messages')
        .insert({
          room_id: roomId,
          participant_id: participantId,
          content: `الموقع: ${locationUrl}`,
          message_type: 'location',
          file_url: locationUrl
        });

      toast({
        title: "تم مشاركة الموقع",
        description: "تم مشاركة موقعك بنجاح",
      });
    } catch (error) {
      console.error('Error sharing location:', error);
      toast({
        title: "خطأ",
        description: "فشل في مشاركة الموقع",
        variant: "destructive"
      });
    }
  };

  // Subscribe to typing indicators
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel('typing-indicators')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'typing_indicators',
        filter: `room_id=eq.${roomId}`
      }, async () => {
        // Fetch current typing users
        const { data } = await supabase
          .from('typing_indicators')
          .select(`
            participant_id,
            is_typing,
            participants!inner(user_name)
          `)
          .eq('room_id', roomId)
          .eq('is_typing', true)
          .neq('participant_id', participantId || '');

        if (data) {
          setTypingUsers(data.map(item => ({
            participant_id: item.participant_id,
            participant_name: (item.participants as any).user_name,
            is_typing: item.is_typing
          })));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, participantId]);

  // Cleanup typing indicator on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (participantId && roomId) {
        sendTypingIndicator(false);
      }
    };
  }, [participantId, roomId]);

  return {
    typingUsers,
    messageStatuses,
    searchQuery,
    setSearchQuery,
    selectedMessage,
    setSelectedMessage,
    handleTyping,
    markMessageAsRead,
    addReaction,
    deleteMessage,
    editMessage,
    replyToMessage,
    shareLocation
  };
};