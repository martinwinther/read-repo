import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if the user is an admin or has permissions
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Add the google_books_url column if it doesn't exist
    const { error } = await supabase.rpc('add_column_if_not_exists', {
      p_table: 'books',
      p_column: 'google_books_url',
      p_type: 'text'
    });
    
    if (error) {
      console.error('Migration error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Generate URLs for existing books
    const { data: books, error: fetchError } = await supabase
      .from('books')
      .select('id, isbn')
      .is('google_books_url', null)
      .not('isbn', 'is', null);
      
    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    
    // Update each book with a Google Books URL
    const updates = books?.map(book => {
      if (!book.isbn) return null;
      
      const cleanIsbn = book.isbn.replace(/-/g, '');
      const googleBooksUrl = `https://books.google.com/books?isbn=${cleanIsbn}`;
      
      return supabase
        .from('books')
        .update({ google_books_url: googleBooksUrl })
        .eq('id', book.id);
    }).filter(Boolean);
    
    if (updates && updates.length > 0) {
      await Promise.all(updates);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Migration completed. Updated ${updates?.length || 0} books with Google Books URLs.` 
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = 'edge'; 