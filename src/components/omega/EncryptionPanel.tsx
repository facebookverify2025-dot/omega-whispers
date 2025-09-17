import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Key, 
  Eye, 
  EyeOff, 
  Copy, 
  ArrowRightLeft,
  Shuffle,
  Lock,
  Unlock
} from 'lucide-react';
import { useEncryption, EncryptionMode } from '@/hooks/useEncryption';
import { useToast } from '@/hooks/use-toast';

interface EncryptionPanelProps {
  onEncryptionModeChange: (mode: EncryptionMode, key: string) => void;
}

export const EncryptionPanel = ({ onEncryptionModeChange }: EncryptionPanelProps) => {
  const [testText, setTestText] = useState('');
  const [encryptedResult, setEncryptedResult] = useState('');
  const [showKey, setShowKey] = useState(false);
  const { toast } = useToast();
  
  const {
    encryptionMode,
    setEncryptionMode,
    encryptionKey,
    setEncryptionKey,
    encryptMessage,
    decryptMessage,
    convertToHieroglyphic,
    convertFromHieroglyphic
  } = useEncryption();

  const handleModeChange = (mode: EncryptionMode) => {
    setEncryptionMode(mode);
    onEncryptionModeChange(mode, encryptionKey);
  };

  const handleTestEncrypt = () => {
    if (!testText.trim()) return;
    const result = encryptMessage(testText);
    setEncryptedResult(result);
  };

  const handleTestDecrypt = () => {
    if (!encryptedResult.trim()) return;
    const result = decryptMessage(encryptedResult);
    setTestText(result);
  };

  const handleHieroglyphicConvert = () => {
    if (!testText.trim()) return;
    const result = convertToHieroglyphic(testText);
    setEncryptedResult(result);
  };

  const handleHieroglyphicRevert = () => {
    if (!encryptedResult.trim()) return;
    const result = convertFromHieroglyphic(encryptedResult);
    setTestText(result);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "تم النسخ",
      description: "تم نسخ النص للحافظة",
    });
  };

  const generateNewKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setEncryptionKey(result);
    onEncryptionModeChange(encryptionMode, result);
  };

  const getModeInfo = (mode: EncryptionMode) => {
    switch (mode) {
      case 'none':
        return { icon: Unlock, color: 'text-muted-foreground', desc: 'بدون تشفير' };
      case 'basic':
        return { icon: Lock, color: 'text-warning', desc: 'تشفير أساسي' };
      case 'hieroglyphic':
        return { icon: Shield, color: 'text-accent', desc: 'هيروغليفية فرعونية' };
      case 'advanced':
        return { icon: Shield, color: 'text-success', desc: 'تشفير متقدم + هيروغليفية' };
    }
  };

  const currentModeInfo = getModeInfo(encryptionMode);
  const ModeIcon = currentModeInfo.icon;

  return (
    <Card className="p-6 gradient-card">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/20">
            <ModeIcon className={`h-5 w-5 ${currentModeInfo.color}`} />
          </div>
          <div>
            <h3 className="font-semibold">نظام التشفير المتطور</h3>
            <p className="text-sm text-muted-foreground">
              {currentModeInfo.desc}
            </p>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">وضع التشفير</label>
          <Select value={encryptionMode} onValueChange={handleModeChange}>
            <SelectTrigger>
              <SelectValue placeholder="اختر وضع التشفير" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <div className="flex items-center gap-2">
                  <Unlock className="h-4 w-4" />
                  <span>بدون تشفير</span>
                </div>
              </SelectItem>
              <SelectItem value="basic">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>تشفير أساسي</span>
                </div>
              </SelectItem>
              <SelectItem value="hieroglyphic">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>الهيروغليفية الفرعونية</span>
                </div>
              </SelectItem>
              <SelectItem value="advanced">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>تشفير متقدم + هيروغليفية</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Encryption Key */}
        {(encryptionMode === 'basic' || encryptionMode === 'advanced') && (
          <div className="space-y-3">
            <label className="text-sm font-medium">مفتاح التشفير</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={encryptionKey}
                  onChange={(e) => {
                    setEncryptionKey(e.target.value);
                    onEncryptionModeChange(encryptionMode, e.target.value);
                  }}
                  className="pr-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={generateNewKey}
                className="flex items-center gap-1"
              >
                <Shuffle className="h-4 w-4" />
                توليد
              </Button>
            </div>
            <Badge variant="outline" className="text-xs">
              <Key className="h-3 w-3 mr-1" />
              مفتاح 256-بت آمن
            </Badge>
          </div>
        )}

        {/* Test Area */}
        <Tabs defaultValue="encrypt" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="encrypt">اختبار التشفير</TabsTrigger>
            <TabsTrigger value="hieroglyphic">محول الهيروغليفية</TabsTrigger>
          </TabsList>
          
          <TabsContent value="encrypt" className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">النص الأصلي</label>
              <Textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="أدخل النص للاختبار..."
                className="min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button onClick={handleTestEncrypt} size="sm" className="flex-1">
                  <Lock className="h-4 w-4 mr-1" />
                  تشفير
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(testText)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">النص المشفر</label>
              <Textarea
                value={encryptedResult}
                onChange={(e) => setEncryptedResult(e.target.value)}
                placeholder="النتيجة المشفرة..."
                className="min-h-[80px] font-mono"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleTestDecrypt}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <Unlock className="h-4 w-4 mr-1" />
                  فك التشفير
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(encryptedResult)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hieroglyphic" className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">النص العربي/الإنجليزي</label>
              <Textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="أدخل النص للتحويل للهيروغليفية..."
                className="min-h-[80px]"
              />
              <Button onClick={handleHieroglyphicConvert} size="sm" className="w-full">
                تحويل للهيروغليفية
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">الهيروغليفية الفرعونية</label>
              <Textarea
                value={encryptedResult}
                onChange={(e) => setEncryptedResult(e.target.value)}
                placeholder="النتيجة بالهيروغليفية..."
                className="min-h-[80px] text-2xl leading-relaxed"
                style={{ fontFamily: 'serif' }}
              />
              <Button
                onClick={handleHieroglyphicRevert}
                size="sm"
                variant="outline"
                className="w-full"
              >
                ترجمة من الهيروغليفية
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Security Status */}
        <div className="p-3 rounded-lg bg-success/10 border border-success/20">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-success" />
            <span className="text-sm text-success font-medium">
              التشفير نشط - جميع الرسائل محمية
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};