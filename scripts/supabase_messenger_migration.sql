-- Add messenger_psid to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS messenger_psid text UNIQUE;

-- Create table for storing messages (optional history tracking)
CREATE TABLE IF NOT EXISTS lead_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
    sender text CHECK (sender IN ('user', 'page')),
    message_text text,
    created_at timestamptz DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_leads_messenger_psid ON leads(messenger_psid);
