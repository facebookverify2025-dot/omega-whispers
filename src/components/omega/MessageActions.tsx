import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Reply, 
  Edit, 
  Trash2, 
  Copy, 
  Heart, 
  ThumbsUp, 
  Laugh, 
  Angry,
  Frown,
  Star,
  MapPin
} from 'lucide-react';

interface MessageActionsProps {
  messageId: string;
  messageContent: string;
  isOwn: boolean;
  onReply: (messageId: string, content: string, preview: string) => void;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
  onReact: (messageId: string, reaction: string) => void;
  onCopy: (content: string) => void;
}

const REACTIONS = [
  { emoji: '❤️', label: 'حب', icon: Heart },
  { emoji: '👍', label: 'إعجاب', icon: ThumbsUp },
  { emoji: '😂', label: 'ضحك', icon: Laugh },
  { emoji: '😢', label: 'حزن', icon: Frown },
  { emoji: '😡', label: 'غضب', icon: Angry },
  { emoji: '⭐', label: 'نجمة', icon: Star },
];

export const MessageActions = ({
  messageId,
  messageContent,
  isOwn,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onCopy
}: MessageActionsProps) => {
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState(messageContent);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleReply = () => {
    if (replyText.trim()) {
      const preview = messageContent.length > 50 
        ? messageContent.substring(0, 50) + '...' 
        : messageContent;
      onReply(messageId, replyText, preview);
      setReplyText('');
      setShowReplyDialog(false);
    }
  };

  const handleEdit = () => {
    if (editText.trim() && editText !== messageContent) {
      onEdit(messageId, editText);
      setShowEditDialog(false);
    }
  };

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {/* Quick Reactions */}
      <div className="flex items-center gap-1">
        {REACTIONS.slice(0, 3).map((reaction) => (
          <Button
            key={reaction.emoji}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-primary/20"
            onClick={() => onReact(messageId, reaction.emoji)}
          >
            <span className="text-sm">{reaction.emoji}</span>
          </Button>
        ))}
      </div>

      {/* More Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreVertical className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* Reply */}
          <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Reply className="h-4 w-4 mr-2" />
                رد على الرسالة
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>رد على الرسالة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">الرسالة الأصلية:</p>
                  <p className="text-sm mt-1">{messageContent}</p>
                </div>
                <Input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="اكتب ردك..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleReply();
                    }
                  }}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowReplyDialog(false)}>
                    إلغاء
                  </Button>
                  <Button onClick={handleReply} disabled={!replyText.trim()}>
                    إرسال الرد
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit (only for own messages) */}
          {isOwn && (
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Edit className="h-4 w-4 mr-2" />
                  تعديل الرسالة
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>تعديل الرسالة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="عدل الرسالة..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleEdit();
                      }
                    }}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                      إلغاء
                    </Button>
                    <Button onClick={handleEdit} disabled={!editText.trim()}>
                      حفظ التعديل
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Copy */}
          <DropdownMenuItem onClick={() => onCopy(messageContent)}>
            <Copy className="h-4 w-4 mr-2" />
            نسخ النص
          </DropdownMenuItem>

          {/* More Reactions */}
          <DropdownMenuItem asChild>
            <div className="flex items-center gap-1 p-1">
              <span className="text-sm mr-2">تفاعلات:</span>
              {REACTIONS.map((reaction) => (
                <Button
                  key={reaction.emoji}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onReact(messageId, reaction.emoji)}
                >
                  <span className="text-xs">{reaction.emoji}</span>
                </Button>
              ))}
            </div>
          </DropdownMenuItem>

          {/* Delete (only for own messages) */}
          {isOwn && (
            <DropdownMenuItem 
              onClick={() => onDelete(messageId)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              حذف الرسالة
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};