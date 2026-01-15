-- EXPIRE ALL SESSIONS
-- This sets the last_interaction_at to 25 hours ago.
-- This forces the system to treat the session as "Expired", showing the "Send Template" button in the UI.

UPDATE leads 
SET last_interaction_at = NOW() - INTERVAL '25 hours';
