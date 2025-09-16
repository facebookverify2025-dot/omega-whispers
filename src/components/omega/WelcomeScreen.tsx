import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Lock, Users, MessageCircle, Key } from "lucide-react";

interface WelcomeScreenProps {
  onCreateRoom: (roomCode: string, userName: string) => void;
  onJoinRoom: (roomCode: string, userName: string) => void;
}

export const WelcomeScreen = ({ onCreateRoom, onJoinRoom }: WelcomeScreenProps) => {
  const [userName, setUserName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateRoomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateRoom = async () => {
    if (!userName.trim()) return;
    
    setIsLoading(true);
    const newRoomCode = generateRoomCode();
    
    // Simulate network delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onCreateRoom(newRoomCode, userName.trim());
    setIsLoading(false);
  };

  const handleJoinRoom = async () => {
    if (!userName.trim() || !roomCode.trim()) return;
    
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    onJoinRoom(roomCode.trim().toUpperCase(), userName.trim());
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-background">
      <div className="w-full max-w-md animate-encrypt-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full gradient-security glow-security">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Omega
          </h1>
          <p className="text-muted-foreground">
            دردشة سرية ومشفرة بالكامل
          </p>
        </div>

        {/* Main Card */}
        <Card className="gradient-card border-border/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              دخول آمن
            </CardTitle>
            <CardDescription>
              أنشئ غرفة جديدة أو انضم لموجودة
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="create" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  إنشاء غرفة
                </TabsTrigger>
                <TabsTrigger value="join" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  انضمام
                </TabsTrigger>
              </TabsList>

              <div className="space-y-4 mb-6">
                <Input
                  type="text"
                  placeholder="اسمك في الغرفة"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="text-right bg-secondary/50 border-border/50"
                  maxLength={20}
                />
              </div>

              <TabsContent value="create" className="space-y-4">
                <div className="text-center p-4 rounded-lg bg-secondary/30 border border-border/30">
                  <MessageCircle className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    سيتم إنشاء كود فريد للغرفة تلقائياً
                  </p>
                </div>
                <Button 
                  onClick={handleCreateRoom}
                  disabled={!userName.trim() || isLoading}
                  className="w-full gradient-primary text-primary-foreground font-medium"
                >
                  {isLoading ? "جاري الإنشاء..." : "إنشاء غرفة جديدة"}
                </Button>
              </TabsContent>

              <TabsContent value="join" className="space-y-4">
                <Input
                  type="text"
                  placeholder="كود الغرفة (6 أحرف)"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="text-center bg-secondary/50 border-border/50 font-mono text-lg tracking-wider"
                  maxLength={6}
                />
                <Button 
                  onClick={handleJoinRoom}
                  disabled={!userName.trim() || !roomCode.trim() || roomCode.length !== 6 || isLoading}
                  className="w-full bg-accent text-accent-foreground font-medium hover:bg-accent/90"
                >
                  {isLoading ? "جاري الانضمام..." : "انضمام للغرفة"}
                </Button>
              </TabsContent>
            </Tabs>

            {/* Security Notice */}
            <div className="mt-6 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-primary">
                  جميع الرسائل مشفّرة تشفيراً تاماً وآمناً
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          <p>Omega v1.0 - تطبيق دردشة سري</p>
        </div>
      </div>
    </div>
  );
};