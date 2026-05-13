/*
  # Create audits and leads tables

  1. New Tables
    - `audits`
      - `id` (uuid, primary key) — unique audit identifier, used in shareable URL
      - `tools_data` (jsonb) — the tool inputs (plan, seats, spend per tool)
      - `team_size` (int) — number of people on the team
      - `use_case` (text) — primary use case (coding/writing/data/research/mixed)
      - `results` (jsonb) — computed audit results per tool + totals
      - `ai_summary` (text) — AI-generated summary paragraph
      - `total_monthly_savings` (numeric) — computed total monthly savings
      - `created_at` (timestamptz)

    - `leads`
      - `id` (uuid, primary key)
      - `audit_id` (uuid, FK to audits) — which audit this lead came from
      - `email` (text, not null)
      - `company_name` (text, optional)
      - `role` (text, optional)
      - `team_size` (int, optional)
      - `honeypot` (text) — must be empty; spam protection
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on both tables
    - Audits are public read (tools/savings shown in shareable URL, no PII)
    - Anon users can insert audits (no-login tool by design)
    - Leads are write-only from anon (insert only with honeypot check)
*/

CREATE TABLE IF NOT EXISTS audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tools_data jsonb NOT NULL DEFAULT '[]',
  team_size int NOT NULL DEFAULT 1,
  use_case text NOT NULL DEFAULT 'mixed',
  results jsonb NOT NULL DEFAULT '[]',
  ai_summary text NOT NULL DEFAULT '',
  total_monthly_savings numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read audits by id"
  ON audits FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert audits"
  ON audits FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id uuid REFERENCES audits(id) ON DELETE SET NULL,
  email text NOT NULL,
  company_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  team_size int,
  honeypot text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Insert leads with empty honeypot"
  ON leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (honeypot = '');

CREATE INDEX IF NOT EXISTS audits_created_at_idx ON audits(created_at DESC);
CREATE INDEX IF NOT EXISTS leads_audit_id_idx ON leads(audit_id);
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);
