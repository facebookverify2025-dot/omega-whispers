-- Create rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create participants table  
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  session_id TEXT NOT NULL,
  is_online BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  content TEXT,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'audio', 'video', 'image')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since we don't have auth yet)
CREATE POLICY "Anyone can view rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can create rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update rooms" ON public.rooms FOR UPDATE USING (true);

CREATE POLICY "Anyone can view participants" ON public.participants FOR SELECT USING (true);
CREATE POLICY "Anyone can create participants" ON public.participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update participants" ON public.participants FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete participants" ON public.participants FOR DELETE USING (true);

CREATE POLICY "Anyone can view messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Anyone can create messages" ON public.messages FOR INSERT WITH CHECK (true);

-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public) VALUES ('omega-files', 'omega-files', true);

-- Create storage policies
CREATE POLICY "Anyone can upload files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'omega-files');
CREATE POLICY "Anyone can view files" ON storage.objects FOR SELECT USING (bucket_id = 'omega-files');
CREATE POLICY "Anyone can delete files" ON storage.objects FOR DELETE USING (bucket_id = 'omega-files');

-- Enable realtime for all tables
ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER TABLE public.participants REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create indexes for better performance
CREATE INDEX idx_rooms_code ON public.rooms(code);
CREATE INDEX idx_participants_room_id ON public.participants(room_id);
CREATE INDEX idx_participants_session_id ON public.participants(session_id);
CREATE INDEX idx_messages_room_id ON public.messages(room_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);