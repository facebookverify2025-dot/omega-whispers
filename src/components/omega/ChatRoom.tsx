import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Lock, 
  Shield, 
  Copy, 
  LogOut, 
  Users, 
  Mic,
  Paperclip,
  Phone,
  Video,
  Download,
  Play,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRoomData } from "@/hooks/useRoomData";
import { FileUploadZone } from "./FileUploadZone";
import { AudioRecorder } from "./AudioRecorder";
import { CallControls } from "./CallControls";

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

interface ChatRoomProps {
  roomCode: string;
  userName: string;
  onLeaveRoom: () => void;
}

export const ChatRoom = ({ roomCode, userName, onLeaveRoom }: ChatRoomProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showCallControls, setShowCallControls] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const {
    messages,
    participants,
    loading,
    sendMessage,
    uploadFile,
    currentUserName,
    participantId
  } = useRoomData(roomCode, userName);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    await sendMessage(newMessage.trim());
    setNewMessage("");
  };

  const handleFileUpload = async (file: File, type: 'file' | 'image' | 'video' | 'audio') => {
    try {
      const fileUrl = await uploadFile(file);
      if (fileUrl) {
        await sendMessage('', type, {
          url: fileUrl,
          name: file.name,
          size: file.size
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleAudioReady = async (audioBlob: Blob) => {
    const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, {
      type: 'audio/webm'
    });
    await handleFileUpload(audioFile, 'audio');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast({
      title: "تم النسخ",
      description: "تم نسخ كود الغرفة",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ar-EG', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center gradient-background">
        <div className="text-center">
          <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4 animate-pulse">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground">جاري الاتصال بالغرفة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col gradient-background">
      {/* Header */}
      <div className="gradient-card border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/20">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">الغرفة {roomCode}</h2>
                <Lock className="h-4 w-4 text-primary animate-pulse-security" />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{participants.length} مستخدم</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyRoomCode}
              className="text-muted-foreground hover:text-primary"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCallControls(!showCallControls)}
              className="text-muted-foreground hover:text-accent"
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCallControls(!showCallControls)}
              className="text-muted-foreground hover:text-accent"
            >
              <Video className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLeaveRoom}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Call Controls */}
      {showCallControls && (
        <div className="gradient-card border-b border-border/50 p-4">
          <CallControls roomCode={roomCode} userName={userName} />
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">مرحباً في غرفة آمنة</h3>
            <p className="text-sm text-muted-foreground">
              جميع الرسائل مشفّرة تشفيراً تاماً
            </p>
          </div>
        )}

        {messages.map((message) => {
          const isOwn = message.participants.user_name === currentUserName;
          const senderName = message.participants.user_name;
          
          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 animate-encrypt-in ${
                isOwn ? 'flex-row-reverse' : ''
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {getInitials(senderName)}
                </AvatarFallback>
              </Avatar>
              
              <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground">
                    {senderName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(message.created_at)}
                  </span>
                </div>
                
                <Card className={`p-3 max-w-xs ${
                  isOwn 
                    ? 'gradient-primary text-primary-foreground' 
                    : 'bg-secondary/50'
                }`}>
                  {/* Text message */}
                  {message.message_type === 'text' && (
                    <p className="text-sm break-words">{message.content}</p>
                  )}
                  
                  {/* Image message */}
                  {message.message_type === 'image' && message.file_url && (
                    <div className="space-y-2">
                      <img 
                        src={message.file_url} 
                        alt={message.file_name || 'صورة'}
                        className="max-w-full h-auto rounded-lg"
                        style={{ maxHeight: '200px' }}
                      />
                      {message.file_name && (
                        <p className="text-xs opacity-75">{message.file_name}</p>
                      )}
                    </div>
                  )}
                  
                  {/* Video message */}
                  {message.message_type === 'video' && message.file_url && (
                    <div className="space-y-2">
                      <video 
                        src={message.file_url} 
                        controls
                        className="max-w-full h-auto rounded-lg"
                        style={{ maxHeight: '200px' }}
                      />
                      <div className="flex items-center gap-2 text-xs opacity-75">
                        <Video className="h-3 w-3" />
                        <span>{message.file_name}</span>
                        {message.file_size && (
                          <span>({formatFileSize(message.file_size)})</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Audio message */}
                  {message.message_type === 'audio' && message.file_url && (
                    <div className="space-y-2">
                      <audio 
                        src={message.file_url} 
                        controls
                        className="w-full"
                      />
                      <div className="flex items-center gap-2 text-xs opacity-75">
                        <Mic className="h-3 w-3" />
                        <span>رسالة صوتية</span>
                        {message.file_size && (
                          <span>({formatFileSize(message.file_size)})</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* File message */}
                  {message.message_type === 'file' && message.file_url && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {message.file_name}
                          </p>
                          {message.file_size && (
                            <p className="text-xs opacity-75">
                              {formatFileSize(message.file_size)}
                            </p>
                          )}
                        </div>
                      </div>
                      <a
                        href={message.file_url}
                        download={message.file_name}
                        className="inline-flex items-center gap-1 text-xs hover:underline"
                      >
                        <Download className="h-3 w-3" />
                        تحميل
                      </a>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          );
        })}


        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="gradient-card border-t border-border/50 p-4 space-y-3">
        {/* Security Status */}
        <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-success/10 border border-success/20">
          <Lock className="h-3 w-3 text-success" />
          <span className="text-xs text-success">اتصال مشفّر نشط</span>
        </div>

        {/* File Upload Zone */}
        {showFileUpload && (
          <FileUploadZone 
            onFileUpload={handleFileUpload}
            disabled={loading}
          />
        )}

        {/* Message Input */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFileUpload(!showFileUpload)}
            className="text-muted-foreground hover:text-primary"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <AudioRecorder 
            onAudioReady={handleAudioReady}
            disabled={loading}
          />

          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب رسالتك..."
            className="flex-1 text-right bg-secondary/50 border-border/50"
            maxLength={1000}
          />

          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || loading}
            size="sm"
            className="gradient-primary text-primary-foreground"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};