-- Add portfolio_images column to receipts table
ALTER TABLE receipts 
ADD COLUMN IF NOT EXISTS portfolio_images JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN receipts.portfolio_images IS 'Array of portfolio image objects with imageUrl and thumbnailUrl';
