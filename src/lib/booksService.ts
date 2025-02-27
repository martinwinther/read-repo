import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Define book type
export interface Book {
  id: number;
  title: string;
  isbn?: string;
  author?: string;
  published_date?: string;
  purchased_date?: string;
  purchase_location?: string;
  read: boolean;
  reader?: string;
  location?: string;
  user_id: string;
}

// Get all books for the current user
export async function getUserBooks() {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('id');
    
  if (error) {
    console.error('Error fetching books:', error);
    return [];
  }
  
  return data as Book[];
}

// Add a new book
export async function addBook(book: Omit<Book, 'id' | 'user_id'>) {
  const supabase = createClientComponentClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('You must be logged in to add a book');
  }
  
  const { data, error } = await supabase
    .from('books')
    .insert({
      ...book,
      user_id: user.id
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error adding book:', error);
    throw error;
  }
  
  return data as Book;
}

// Update a book
export async function updateBook(id: number, updates: Partial<Book>) {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase
    .from('books')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating book:', error);
    throw error;
  }
  
  return data as Book;
}

// Delete a book
export async function deleteBook(id: number) {
  const supabase = createClientComponentClient();
  
  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
  
  return true;
}