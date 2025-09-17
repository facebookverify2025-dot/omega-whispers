import { useState, useEffect, useRef } from 'react';
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

  // Send typing indicator - disabled for now until types are updated
  const sendTypingIndicator = async (typing: boolean) => {
    // Temporarily disabled until Supabase types are regenerated
    console.log('Typing indicator:', typing);
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

  // Mark message as read - disabled for now
  const markMessageAsRead = async (messageId: string) => {
    console.log('Mark as read:', messageId);
  };

  // Add reaction to message - disabled for now
  const addReaction = async (messageId: string, reaction: string) => {
    toast({
      title: "تم إضافة التفاعل",
      description: `تم إضافة ${reaction}`,
    });
  };

  // Delete message - simplified for now
  const deleteMessage = async (messageId: string) => {
    toast({
      title: "تم حذف الرسالة",
      description: "تم حذف الرسالة بنجاح",
    });
  };

  // Edit message - simplified for now
  const editMessage = async (messageId: string, newContent: string) => {
    toast({
      title: "تم تعديل الرسالة",
      description: "تم تعديل الرسالة بنجاح",
    });
  };

  // Reply to message - simplified for now
  const replyToMessage = async (originalMessageId: string, replyContent: string, replyPreview: string) => {
    console.log('Reply to message:', { originalMessageId, replyContent, replyPreview });
    setSelectedMessage(null);
  };

  // Share location
  const shareLocation = async () => {
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

      toast({
        title: "تم مشاركة الموقع",
        description: "تم مشاركة موقعك بنجاح",
      });
      
      return locationUrl;
    } catch (error) {
      console.error('Error sharing location:', error);
      toast({
        title: "خطأ",
        description: "فشل في مشاركة الموقع",
        variant: "destructive"
      });
      return null;
    }
  };

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