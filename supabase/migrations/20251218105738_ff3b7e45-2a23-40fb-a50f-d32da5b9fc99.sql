-- Create custom_order_requests table
CREATE TABLE public.custom_order_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  preferred_size TEXT NOT NULL DEFAULT 'medium',
  usage_description TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  estimated_price NUMERIC,
  estimated_delivery_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_order_requests ENABLE ROW LEVEL SECURITY;

-- Policies: Users can create requests (logged in or not for flexibility)
CREATE POLICY "Anyone can create custom order requests"
ON public.custom_order_requests
FOR INSERT
WITH CHECK (true);

-- Users can view their own requests if logged in
CREATE POLICY "Users can view own custom order requests"
ON public.custom_order_requests
FOR SELECT
USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- Admins can view all requests
CREATE POLICY "Admins can view all custom order requests"
ON public.custom_order_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update requests
CREATE POLICY "Admins can update custom order requests"
ON public.custom_order_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete requests
CREATE POLICY "Admins can delete custom order requests"
ON public.custom_order_requests
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_custom_order_requests_updated_at
BEFORE UPDATE ON public.custom_order_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();