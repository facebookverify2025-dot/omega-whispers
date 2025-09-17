import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  Settings, 
  Shield, 
  Zap,
  Star,
  Download,
  Upload,
  Mic,
  Camera,
  File,
  Image as ImageIcon,
  Video,
  Smile,
  Paperclip,
  Phone,
  VideoIcon,
  Calendar,
  Link
} from 'lucide-react';

interface AdvancedFeaturesProps {
  onSearch: (query: string) => void;
  onShareLocation: () => void;
  onScheduleMessage?: () => void;
  onCreatePoll?: () => void;
  onBackupChat?: () => void;
  searchQuery: string;
  typingUsers: Array<{ participant_name: string }>;
}

export const AdvancedFeatures = ({
  onSearch,
  onShareLocation,
  onScheduleMessage,
  onCreatePoll,
  onBackupChat,
  searchQuery,
  typingUsers
}: AdvancedFeaturesProps) => {
  const [showQuickActions, setShowQuickActions] = useState(false);

  const quickActions = [
    { icon: MapPin, label: 'مشاركة الموقع', action: onShareLocation, color: 'text-blue-500' },
    { icon: Calendar, label: 'رسالة مجدولة', action: onScheduleMessage, color: 'text-green-500' },
    { icon: Star, label: 'إنشاء استطلاع', action: onCreatePoll, color: 'text-yellow-500' },
    { icon: Download, label: 'نسخ احتياطي', action: onBackupChat, color: 'text-purple-500' }
  ];

  const mediaActions = [
    { icon: Camera, label: 'كاميرا', type: 'camera' },
    { icon: ImageIcon, label: 'صورة', type: 'image' },
    { icon: Video, label: 'فيديو', type: 'video' },
    { icon: Mic, label: 'صوت', type: 'audio' },
    { icon: File, label: 'ملف', type: 'file' },
    { icon: Link, label: 'رابط', type: 'link' }
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="البحث في الرسائل..."
            className="pr-10"
          />
        </div>
      </Card>

      {/* Typing Indicators */}
      {typingUsers.length > 0 && (
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {typingUsers.map((user, index) => (
                <div 
                  key={index}
                  className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center"
                >
                  <span className="text-xs font-semibold text-primary">
                    {user.participant_name.charAt(0)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-muted-foreground">
                {typingUsers.length === 1 
                  ? `${typingUsers[0].participant_name} يكتب...`
                  : `${typingUsers.length} أشخاص يكتبون...`
                }
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">الإجراءات السريعة</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQuickActions(!showQuickActions)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        
        {showQuickActions && (
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={action.action}
                className="flex items-center gap-2 h-12"
              >
                <action.icon className={`h-4 w-4 ${action.color}`} />
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
        )}
      </Card>

      {/* Media Quick Access */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">وسائط سريعة</h4>
        <div className="grid grid-cols-3 gap-2">
          {mediaActions.map((media, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-1 h-16"
            >
              <media.icon className="h-5 w-5" />
              <span className="text-xs">{media.label}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Status & Security */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">الحالة والأمان</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-success" />
              <span className="text-sm">التشفير التام</span>
            </div>
            <Badge variant="outline" className="text-success border-success">
              نشط
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm">الاتصال السريع</span>
            </div>
            <Badge variant="outline" className="text-primary border-primary">
              متصل
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">آخر نسخ احتياطي</span>
            </div>
            <span className="text-xs text-muted-foreground">
              منذ ساعتين
            </span>
          </div>
        </div>
      </Card>

      {/* Voice & Video Calls */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">المكالمات</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button className="flex items-center gap-2 gradient-primary text-primary-foreground">
            <Phone className="h-4 w-4" />
            مكالمة صوتية
          </Button>
          <Button className="flex items-center gap-2 gradient-security text-primary-foreground">
            <VideoIcon className="h-4 w-4" />
            مكالمة فيديو
          </Button>
        </div>
      </Card>

      {/* Room Stats */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">إحصائيات الغرفة</h4>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">12</div>
            <div className="text-xs text-muted-foreground">الرسائل اليوم</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent">4</div>
            <div className="text-xs text-muted-foreground">المشاركون</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-success">8</div>
            <div className="text-xs text-muted-foreground">الملفات</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-warning">2h</div>
            <div className="text-xs text-muted-foreground">وقت النشاط</div>
          </div>
        </div>
      </Card>
    </div>
  );
};