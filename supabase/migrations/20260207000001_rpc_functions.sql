-- Increment collection item count
CREATE OR REPLACE FUNCTION increment_collection_count(collection_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.collections
  SET item_count = item_count + 1
  WHERE id = collection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement collection item count
CREATE OR REPLACE FUNCTION decrement_collection_count(collection_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.collections
  SET item_count = GREATEST(item_count - 1, 0)
  WHERE id = collection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
