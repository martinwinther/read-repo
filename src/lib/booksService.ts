import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { formatIsbn } from './utils';

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

// Add a new book with retry logic
export async function addBook(book: Omit<Book, 'id' | 'user_id'>) {
  const supabase = createClientComponentClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('You must be logged in to add a book');
  }
  
  // Format the ISBN if provided
  const formattedIsbn = formatIsbn(book.isbn);
  
  // Base book data
  const bookData = {
    title: book.title,
    isbn: formattedIsbn,
    author: book.author,
    published_date: book.published_date,
    read: book.read || false,
    location: book.location,
    user_id: user.id
  };
  
  // Try using the .insert() method without an ID first
  let result = await supabase
    .from('books')
    .insert(bookData)
    .select()
    .single();
  
  // If we still get a duplicate key error, use a different approach
  if (result.error && result.error.code === '23505') {
    console.log('Trying alternative insertion method...');
    
    // Use raw SQL to insert with a generated ID
    const { data, error } = await supabase.rpc('add_book_with_generated_id', {
      p_title: book.title,
      p_isbn: formattedIsbn,
      p_author: book.author,
      p_published_date: book.published_date,
      p_read: book.read || false,
      p_location: book.location,
      p_user_id: user.id
    });
    
    if (error) {
      console.error('Error adding book with generated ID:', error);
      throw error;
    }
    
    return data as Book;
  }
  
  if (result.error) {
    console.error('Error adding book:', result.error);
    throw result.error;
  }
  
  return result.data as Book;
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