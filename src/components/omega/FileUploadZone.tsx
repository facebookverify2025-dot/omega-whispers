import { useCallback, useState } from 'react';
import { Upload, File, Image, Video, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface FileUploadZoneProps {
  onFileUpload: (file: File, type: 'file' | 'image' | 'video' | 'audio') => Promise<void>;
  disabled?: boolean;
}

export const FileUploadZone = ({ onFileUpload, disabled }: FileUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const getFileType = (file: File): 'file' | 'image' | 'video' | 'audio' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'file';
  };

  const getFileIcon = (type: 'file' | 'image' | 'video' | 'audio') => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileType = getFileType(file);
        
        // Check file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: "ملف كبير جداً",
            description: `${file.name} أكبر من 50 ميجابايت`,
            variant: "destructive"
          });
          continue;
        }

        await onFileUpload(file, fileType);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled || uploading) return;
    
    handleFileSelect(e.dataTransfer.files);
  }, [disabled, uploading]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !uploading) {
      setIsDragging(true);
    }
  }, [disabled, uploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  return (
    <div className="relative">
      <input
        type="file"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
        id="file-upload"
        disabled={disabled || uploading}
        accept="*/*"
      />
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center transition-all
          ${isDragging 
            ? 'border-primary bg-primary/10' 
            : 'border-border/50 hover:border-primary/50'
          }
          ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onClick={() => {
          if (!disabled && !uploading) {
            document.getElementById('file-upload')?.click();
          }
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <Upload className={`h-8 w-8 ${uploading ? 'animate-pulse' : ''}`} />
          <div className="text-sm">
            {uploading ? (
              <span className="text-primary">جاري الرفع...</span>
            ) : (
              <>
                <span className="font-medium">اسحب الملفات هنا أو انقر للاختيار</span>
                <br />
                <span className="text-muted-foreground">
                  صور، فيديو، ملفات صوتية، مستندات (حتى 50 ميجابايت)
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick action buttons */}
      <div className="flex gap-2 mt-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled || uploading}
          onClick={() => document.getElementById('file-upload')?.click()}
          className="flex-1"
        >
          <File className="h-4 w-4 mr-2" />
          ملفات
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled || uploading}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;
            input.onchange = (e) => handleFileSelect((e.target as HTMLInputElement).files);
            input.click();
          }}
          className="flex-1"
        >
          <Image className="h-4 w-4 mr-2" />
          صور
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled || uploading}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'video/*';
            input.multiple = true;
            input.onchange = (e) => handleFileSelect((e.target as HTMLInputElement).files);
            input.click();
          }}
          className="flex-1"
        >
          <Video className="h-4 w-4 mr-2" />
          فيديو
        </Button>
      </div>
    </div>
  );
};