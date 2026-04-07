-- Create portfolio_items table for visual portfolio feature
CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL REFERENCES wallets(wallet_address) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries by wallet
CREATE INDEX IF NOT EXISTS idx_portfolio_wallet ON portfolio_items(wallet_address);

-- Add comment for documentation
COMMENT ON TABLE portfolio_items IS 'Stores visual portfolio items for creative professionals';
COMMENT ON COLUMN portfolio_items.description IS 'Max 150 characters, optional short description';
COMMENT ON COLUMN portfolio_items.image_url IS 'Full-size image URL (max 1200px, WebP)';
COMMENT ON COLUMN portfolio_items.thumbnail_url IS 'Thumbnail image URL (64px, WebP)';
COMMENT ON COLUMN portfolio_items.display_order IS 'For future drag-and-drop reordering';
