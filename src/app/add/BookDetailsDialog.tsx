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
          <Badge key={index} variant="secondary" className="text-xs">{category}</Badge>
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
      <DialogContent className="max-w-md sm:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg sm:text-xl leading-tight">{book.volumeInfo.title}</DialogTitle>
          {book.volumeInfo.subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{book.volumeInfo.subtitle}</p>
          )}
        </DialogHeader>
        
        <div className="space-y-4 pb-4">
          {/* Book Cover - Centered on mobile, left-aligned on desktop */}
          <div className="flex justify-center sm:justify-start">
            <Image
              src={getCoverImage()}
              alt={book.volumeInfo.title}
              width={120}
              height={180}
              className="rounded-lg shadow-md object-contain sm:w-32 sm:h-48"
            />
          </div>
          
          {/* Book Details - Stacked layout */}
          <div className="space-y-3">
            {/* Authors */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Author(s)</h4>
              <p className="text-sm">{book.volumeInfo.authors?.join(', ') || 'Unknown'}</p>
            </div>
            
            {/* Publisher & Date */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Publisher</h4>
              <p className="text-sm">
                {book.volumeInfo.publisher || 'Unknown'} 
                {book.volumeInfo.publishedDate ? ` (${book.volumeInfo.publishedDate})` : ''}
              </p>
            </div>
            
            {/* ISBN */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">ISBN</h4>
              <p className="text-sm font-mono bg-muted px-2 py-1 rounded text-xs">{getISBN()}</p>
            </div>
            
            {/* Page Count */}
            {book.volumeInfo.pageCount && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Pages</h4>
                <p className="text-sm">{book.volumeInfo.pageCount}</p>
              </div>
            )}
            
            {/* Language */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Language</h4>
              <p className="text-sm">{book.volumeInfo.language === 'en' ? 'English' : book.volumeInfo.language}</p>
            </div>
            
            {/* Categories */}
            {book.volumeInfo.categories && book.volumeInfo.categories.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Categories</h4>
                {renderCategories()}
              </div>
            )}
          </div>
          
          {/* Description */}
          {book.volumeInfo.description && (
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Description</h4>
              <div 
                className="text-sm leading-relaxed max-h-32 overflow-y-auto bg-muted/30 p-3 rounded-lg"
                dangerouslySetInnerHTML={{ __html: book.volumeInfo.description }}
              />
            </div>
          )}
        </div>
        
        <DialogFooter className="pt-4 border-t flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="order-3 sm:order-1">
            Close
          </Button>
          <Button 
            variant="outline" 
            onClick={openGoogleBooks}
            className="order-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:hover:bg-blue-900 dark:border-blue-800"
          >
            View on Google Books
          </Button>
          <Button onClick={() => {
            onAddClick(book);
            onOpenChange(false);
          }} className="order-1 sm:order-3">
            Add to Collection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 