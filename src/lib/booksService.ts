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
  location?: string; // legacy field
  location_id?: string; // new hierarchical location
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
  
  // Format the ISBN if provided
  const formattedIsbn = formatIsbn(book.isbn);
  
  let finalLocationId: string | undefined = book.location_id;
  
  // If location_id is temporary, fall back to legacy location field
  if (book.location_id && book.location_id.startsWith('temp-')) {
    finalLocationId = undefined;
    console.log('Temporary location detected, using legacy location field');
  }
  
  // Base book data
  const bookData = {
    title: book.title,
    isbn: formattedIsbn,
    author: book.author,
    published_date: book.published_date,
    read: book.read || false,
    location: book.location, // legacy field - will be used for temp locations
    location_id: finalLocationId, // new hierarchical location (exclude temp IDs)
    user_id: user.id
  };
  
  console.log('Attempting to insert book:', bookData);
  
  // Insert the book
  const { data, error } = await supabase
    .from('books')
    .insert(bookData)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding book:', error);
    
    // Provide more helpful error messages
    if (error.code === '23505') {
      throw new Error('A book with this ISBN already exists in your collection');
    } else if (error.code === '23502') {
      throw new Error('Missing required book information');
    } else if (error.code === '22P02') {
      throw new Error('Invalid data format');
    } else {
      throw new Error(`Failed to add book: ${error.message}`);
    }
  }
  
  return data as Book;
}

// Update a book
export async function updateBook(id: number, updates: Partial<Book>) {
  const supabase = createClientComponentClient();
  
  // Handle temporary location IDs the same way as addBook
  const processedUpdates = { ...updates };
  
  if (updates.location_id && updates.location_id.startsWith('temp-')) {
    processedUpdates.location_id = undefined;
    console.log('Temporary location detected in update, using legacy location field');
  }
  
  console.log('Attempting to update book:', processedUpdates);
  
  const { data, error } = await supabase
    .from('books')
    .update(processedUpdates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating book:', error);
    
    // Provide more helpful error messages
    if (error.code === '22P02') {
      throw new Error('Invalid data format - please check location selection');
    } else {
      throw new Error(`Failed to update book: ${error.message}`);
    }
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