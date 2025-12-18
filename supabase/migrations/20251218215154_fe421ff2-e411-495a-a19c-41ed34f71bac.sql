-- Add column to track emails sent for custom orders
ALTER TABLE public.custom_order_requests 
ADD COLUMN IF NOT EXISTS emails_sent JSONB DEFAULT '[]'::jsonb;

-- This will store an array of objects like: [{"type": "payment_request", "sent_at": "2025-01-01T12:00:00Z"}, ...]