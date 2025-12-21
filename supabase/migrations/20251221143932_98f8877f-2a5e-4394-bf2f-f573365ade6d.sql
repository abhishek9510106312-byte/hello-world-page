-- Create corporate_inquiries table
CREATE TABLE public.corporate_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  request_type TEXT NOT NULL,
  description TEXT NOT NULL,
  timeline TEXT,
  scale TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.corporate_inquiries ENABLE ROW LEVEL SECURITY;

-- Create policy for anyone to submit inquiries
CREATE POLICY "Anyone can submit corporate inquiries"
ON public.corporate_inquiries
FOR INSERT
WITH CHECK (true);

-- Create policy for admins to view all inquiries
CREATE POLICY "Admins can view all corporate inquiries"
ON public.corporate_inquiries
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policy for admins to update inquiries
CREATE POLICY "Admins can update corporate inquiries"
ON public.corporate_inquiries
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policy for admins to delete inquiries
CREATE POLICY "Admins can delete corporate inquiries"
ON public.corporate_inquiries
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_corporate_inquiries_updated_at
BEFORE UPDATE ON public.corporate_inquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add delete policy for admin_notifications so admins can delete
CREATE POLICY "Admins can delete notifications"
ON public.admin_notifications
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add insert policy for admin_notifications via trigger/function
CREATE POLICY "System can insert notifications"
ON public.admin_notifications
FOR INSERT
WITH CHECK (true);