-- Create storage bucket for video testimonials
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('video-testimonials', 'video-testimonials', true, 52428800, ARRAY['video/mp4', 'video/webm', 'video/quicktime']);

-- Create table for video testimonial metadata
CREATE TABLE public.video_testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  customer_name TEXT,
  experience_type TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_testimonials ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved testimonials
CREATE POLICY "Anyone can view approved testimonials"
ON public.video_testimonials
FOR SELECT
USING (is_approved = true);

-- Admins can manage all testimonials
CREATE POLICY "Admins can manage all testimonials"
ON public.video_testimonials
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can upload testimonials
CREATE POLICY "Authenticated users can upload testimonials"
ON public.video_testimonials
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND uploaded_by = auth.uid());

-- Storage policies for video testimonials bucket
CREATE POLICY "Anyone can view video testimonials"
ON storage.objects
FOR SELECT
USING (bucket_id = 'video-testimonials');

CREATE POLICY "Authenticated users can upload videos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'video-testimonials' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete videos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'video-testimonials' AND has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_video_testimonials_updated_at
BEFORE UPDATE ON public.video_testimonials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();