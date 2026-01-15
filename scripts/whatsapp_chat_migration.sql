-- 1. Update 'leads' table for Session Management
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS last_interaction_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Update 'lead_messages' table for Message Tracking
ALTER TABLE lead_messages 
ADD COLUMN IF NOT EXISTS wa_message_id TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent', -- sent, delivered, read, failed
ADD COLUMN IF NOT EXISTS direction TEXT DEFAULT 'outbound', -- inbound (User->You), outbound (You->User)
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text'; -- text, template, image, reaction

-- 3. Create Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_lead_messages_wa_id ON lead_messages(wa_message_id);

-- 4. [REMOVED] Enable Realtime
-- The previous error showed this table is ALREADY in supabase_realtime.
-- So we don't need to run 'ALTER PUBLICATION ...' again.
