import { useState, useRef } from 'react';
import { Mic, Square, Play, Pause, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AudioRecorderProps {
  onAudioReady: (audioBlob: Blob) => void;
  disabled?: boolean;
}

export const AudioRecorder = ({ onAudioReady, disabled }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "خطأ",
        description: "فشل في بدء التسجيل",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playAudio = () => {
    if (audioURL && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
      setAudioURL(null);
    }
    setIsPlaying(false);
    setRecordingTime(0);
  };

  const sendRecording = () => {
    if (audioURL) {
      // Convert audio URL to Blob
      fetch(audioURL)
        .then(res => res.blob())
        .then(blob => {
          onAudioReady(blob);
          deleteRecording(); // Clear after sending
        });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (audioURL) {
    return (
      <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg">
        <audio
          ref={audioRef}
          src={audioURL}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={isPlaying ? pauseAudio : playAudio}
          className="h-8 w-8 p-0"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        
        <div className="flex-1 text-sm">
          <div className="flex justify-between">
            <span>تسجيل صوتي</span>
            <span className="text-muted-foreground">{formatTime(recordingTime)}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1 mt-1">
            <div className="bg-primary h-1 rounded-full w-1/3"></div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={deleteRecording}
          className="h-8 w-8 p-0 text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        
        <Button
          size="sm"
          onClick={sendRecording}
          className="gradient-primary text-primary-foreground"
        >
          إرسال
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isRecording ? "destructive" : "ghost"}
        size="sm"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        className={`h-8 w-8 p-0 ${isRecording ? 'animate-pulse' : ''}`}
      >
        {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
      
      {isRecording && (
        <div className="text-sm text-destructive font-mono">
          {formatTime(recordingTime)}
        </div>
      )}
    </div>
  );
};