import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import booksData from './data.json';

// Function to migrate books to Supabase when a user first signs up
export async function migrateUserBooks() {
  const supabase = createClientComponentClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No user found! Cannot migrate books.');
    return;
  }
  
  // Check if user already has books in their collection
  const { data: existingBooks, error: checkError } = await supabase
    .from('books')
    .select('id')
    .eq('user_id', user.id)
    .limit(1);
    
  if (checkError) {
    console.error('Error checking for existing books:', checkError);
    return;
  }
  
  // If user already has books, don't migrate again
  if (existingBooks && existingBooks.length > 0) {
    console.log('User already has books. Skipping migration.');
    return;
  }
  
  // Prepare books data with user_id
  const booksWithUserId = booksData.map(book => ({
    ...book,
    user_id: user.id,
  }));
  
  // Insert books into Supabase
  const { error: insertError } = await supabase
    .from('books')
    .insert(booksWithUserId);
    
  if (insertError) {
    console.error('Error migrating books:', insertError);
    return;
  }
  
  console.log('Successfully migrated books to Supabase!');
}
