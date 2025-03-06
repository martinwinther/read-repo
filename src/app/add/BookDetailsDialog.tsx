'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Book as GoogleBook } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface BookDetailsDialogProps {
  book: GoogleBook | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddClick: (book: GoogleBook) => void
}

export function BookDetailsDialog({ book, open, onOpenChange, onAddClick }: BookDetailsDialogProps) {
  if (!book) return null

  // Get higher resolution cover image if available
  const getCoverImage = () => {
    if (!book.volumeInfo.imageLinks) return '/placeholder.png'
    
    // Try to get the largest available image
    return book.volumeInfo.imageLinks.thumbnail || 
           book.volumeInfo.imageLinks.smallThumbnail || 
           '/placeholder.png'
  }

  // Helper to format categories as badges
  const renderCategories = () => {
    if (!book.volumeInfo.categories || book.volumeInfo.categories.length === 0) {
      return null
    }

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {book.volumeInfo.categories.map((category, index) => (
          <Badge key={index} variant="secondary">{category}</Badge>
        ))}
      </div>
    )
  }

  // Helper to get and format ISBN
  const getISBN = () => {
    if (!book.volumeInfo.industryIdentifiers || book.volumeInfo.industryIdentifiers.length === 0) {
      return 'Unknown'
    }

    // Try to find ISBN-13 first, then ISBN-10, then any other identifier
    const isbn13 = book.volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_13')
    const isbn10 = book.volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_10')
    
    return isbn13?.identifier || isbn10?.identifier || book.volumeInfo.industryIdentifiers[0].identifier
  }
  
  // Generate Google Books URL
  const getGoogleBooksUrl = () => {
    const isbn = getISBN();
    if (isbn && isbn !== 'Unknown') {
      // Clean the ISBN (remove hyphens)
      const cleanIsbn = isbn.replace(/-/g, '');
      return `https://books.google.com/books?isbn=${cleanIsbn}`;
    }
    
    // If no ISBN, use the book ID
    return `https://books.google.com/books?id=${book.id}`;
  }
  
  // Open Google Books page
  const openGoogleBooks = () => {
    const url = getGoogleBooksUrl();
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{book.volumeInfo.title}</DialogTitle>
          {book.volumeInfo.subtitle && (
            <p className="text-sm text-muted-foreground">{book.volumeInfo.subtitle}</p>
          )}
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
          {/* Book Cover */}
          <div className="flex justify-center">
            <Image
              src={getCoverImage()}
              alt={book.volumeInfo.title}
              width={150}
              height={225}
              className="rounded-md shadow-md object-contain"
            />
          </div>
          
          {/* Book Details */}
          <div className="md:col-span-2 space-y-3">
            {/* Authors */}
            <div>
              <h4 className="font-semibold">Author(s):</h4>
              <p>{book.volumeInfo.authors?.join(', ') || 'Unknown'}</p>
            </div>
            
            {/* Publisher & Date */}
            <div>
              <h4 className="font-semibold">Publisher:</h4>
              <p>
                {book.volumeInfo.publisher || 'Unknown'} 
                {book.volumeInfo.publishedDate ? ` (${book.volumeInfo.publishedDate})` : ''}
              </p>
            </div>
            
            {/* ISBN */}
            <div>
              <h4 className="font-semibold">ISBN:</h4>
              <p>{getISBN()}</p>
            </div>
            
            {/* Page Count */}
            {book.volumeInfo.pageCount && (
              <div>
                <h4 className="font-semibold">Pages:</h4>
                <p>{book.volumeInfo.pageCount}</p>
              </div>
            )}
            
            {/* Categories */}
            {book.volumeInfo.categories && book.volumeInfo.categories.length > 0 && (
              <div>
                <h4 className="font-semibold">Categories:</h4>
                {renderCategories()}
              </div>
            )}
            
            {/* Language */}
            <div>
              <h4 className="font-semibold">Language:</h4>
              <p>{book.volumeInfo.language === 'en' ? 'English' : book.volumeInfo.language}</p>
            </div>
          </div>
        </div>
        
        {/* Description */}
        {book.volumeInfo.description && (
          <div className="mt-2">
            <h4 className="font-semibold">Description:</h4>
            <div 
              className="text-sm mt-1 max-h-[200px] overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: book.volumeInfo.description }}
            />
          </div>
        )}
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button 
            variant="outline" 
            onClick={openGoogleBooks}
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
          >
            View on Google Books
          </Button>
          <Button onClick={() => {
            onAddClick(book);
            onOpenChange(false);
          }}>
            Add to Collection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 