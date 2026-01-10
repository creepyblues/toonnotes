-- Account Deletion Requests Table
-- Stores user requests for account deletion (Play Store compliance)
-- Processed manually by admins

CREATE TABLE public.account_deletion_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id)
);

-- Create index for faster status queries
CREATE INDEX idx_account_deletion_requests_status ON public.account_deletion_requests(status);
CREATE INDEX idx_account_deletion_requests_email ON public.account_deletion_requests(email);

-- Enable Row Level Security
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit a deletion request (public form)
CREATE POLICY "Anyone can submit deletion request"
  ON public.account_deletion_requests FOR INSERT
  WITH CHECK (true);

-- Only admins can view deletion requests
CREATE POLICY "Admins can view deletion requests"
  ON public.account_deletion_requests FOR SELECT
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Only admins can update deletion requests
CREATE POLICY "Admins can update deletion requests"
  ON public.account_deletion_requests FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Add comment for documentation
COMMENT ON TABLE public.account_deletion_requests IS 'Stores account deletion requests submitted via web form for manual processing';
