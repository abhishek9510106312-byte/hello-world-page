-- Add shipping_address column to custom_order_requests
ALTER TABLE public.custom_order_requests 
ADD COLUMN shipping_address TEXT;