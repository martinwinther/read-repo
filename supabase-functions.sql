-- Function to add a column if it doesn't exist
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
  p_table text,
  p_column text,
  p_type text
) RETURNS void AS $$
DECLARE
  column_exists boolean;
BEGIN
  -- Check if the column already exists
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = p_table
    AND column_name = p_column
  ) INTO column_exists;
  
  -- If the column doesn't exist, add it
  IF NOT column_exists THEN
    EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', p_table, p_column, p_type);
  END IF;
END;
$$ LANGUAGE plpgsql; 