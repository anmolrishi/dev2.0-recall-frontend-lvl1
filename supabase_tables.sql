-- Add dialingCredits column to the auth.users table
ALTER TABLE auth.users ADD COLUMN dialing_credits INTEGER DEFAULT 0;

-- Create an index for better query performance
CREATE INDEX idx_users_dialing_credits ON auth.users(dialing_credits);

-- Create a function to update dialing credits
CREATE OR REPLACE FUNCTION update_dialing_credits(user_id UUID, credits INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE auth.users
  SET dialing_credits = dialing_credits + credits
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;