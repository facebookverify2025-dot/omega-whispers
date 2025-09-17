-- Add new columns to messages table for advanced features
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reply_to_message_id UUID REFERENCES public.messages(id),
ADD COLUMN IF NOT EXISTS reply_preview TEXT;

-- Create typing indicators table
CREATE TABLE IF NOT EXISTS public.typing_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  is_typing BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, participant_id)
);

-- Create message status table for read receipts
CREATE TABLE IF NOT EXISTS public.message_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  is_sent BOOLEAN DEFAULT TRUE,
  is_delivered BOOLEAN DEFAULT FALSE,
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(message_id, participant_id)
);

-- Create message reactions table
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, participant_id, reaction)
);

-- Create message replies table
CREATE TABLE IF NOT EXISTS public.message_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  reply_to_message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  reply_preview TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_replies ENABLE ROW LEVEL SECURITY;

-- Create policies for typing_indicators
CREATE POLICY "Anyone can view typing indicators" 
ON public.typing_indicators 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create typing indicators" 
ON public.typing_indicators 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update typing indicators" 
ON public.typing_indicators 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete typing indicators" 
ON public.typing_indicators 
FOR DELETE 
USING (true);

-- Create policies for message_status
CREATE POLICY "Anyone can view message status" 
ON public.message_status 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create message status" 
ON public.message_status 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update message status" 
ON public.message_status 
FOR UPDATE 
USING (true);

-- Create policies for message_reactions
CREATE POLICY "Anyone can view message reactions" 
ON public.message_reactions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create message reactions" 
ON public.message_reactions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update message reactions" 
ON public.message_reactions 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete message reactions" 
ON public.message_reactions 
FOR DELETE 
USING (true);

-- Create policies for message_replies
CREATE POLICY "Anyone can view message replies" 
ON public.message_replies 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create message replies" 
ON public.message_replies 
FOR INSERT 
WITH CHECK (true);

-- Add realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_status;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_replies;