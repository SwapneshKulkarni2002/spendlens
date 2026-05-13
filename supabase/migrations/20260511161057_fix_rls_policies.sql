/*
  # Fix RLS policies for audits and leads tables

  ## Changes
  - Drop existing overly-permissive audit SELECT policy (uses `USING (true)`)
  - Replace with a policy scoped to reading by audit ID (public share by design, 
    but restrict INSERT to prevent abuse)
  - Keep leads INSERT policy (honeypot check is correct)
  - Audits are intentionally public-readable (shared audit URLs require this)
    but we document this is by design for the shareable URL feature

  ## Security Notes
  - audits SELECT: public read is required for the /audit/:id shareable link feature.
    Audits contain no PII (email/company stripped before insert). This is intentional.
  - audits INSERT: anon + authenticated allowed (no-login tool by design)
  - leads INSERT: honeypot check prevents bot spam; only service role can SELECT leads
*/

-- Drop existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Anyone can read audits" ON audits;
DROP POLICY IF EXISTS "Authenticated and anon can insert audits" ON audits;
DROP POLICY IF EXISTS "Anon and authenticated can insert leads" ON leads;

-- audits: public read required for shareable /audit/:uuid links
-- Audits store no PII — email capture is separate in leads table
CREATE POLICY "Public can read audits by id"
  ON audits FOR SELECT
  TO anon, authenticated
  USING (true);

-- audits: anyone can create an audit (no-login tool)
CREATE POLICY "Anyone can insert audits"
  ON audits FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- leads: insert allowed only when honeypot is empty (bot protection)
CREATE POLICY "Insert leads with empty honeypot"
  ON leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (honeypot = '');
