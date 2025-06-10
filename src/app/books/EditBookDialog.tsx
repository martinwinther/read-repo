'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { updateBook } from '@/lib/booksService'
import { toast } from 'sonner'
import { formatIsbn } from '@/lib/utils'
import { LocationSelector } from '@/components/ui/location-selector'

interface Book {
  id: number
  title: string
  isbn?: string
  author?: string
  published_date?: string
  purchased_date?: string
  purchase_location?: string
  read: boolean
  reader?: string
  location?: string // legacy field
  location_id?: string // new hierarchical location
  user_id: string
}

interface EditBookDialogProps {
  book: Book | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onBookUpdated: () => void
}

export function EditBookDialog({ book, open, onOpenChange, onBookUpdated }: EditBookDialogProps) {
  const [formData, setFormData] = useState<Partial<Book>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when book changes
  useEffect(() => {
    if (book) {
      setFormData({ ...book })
    }
  }, [book])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, read: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!book) return
    
    setIsSubmitting(true)
    
    try {
      // Format the ISBN if it's being updated
      const updatedData = {
        ...formData,
        isbn: formatIsbn(formData.isbn)
      };
      
      await updateBook(book.id, updatedData)
      toast.success('Book updated successfully')
      onOpenChange(false)
      onBookUpdated()
    } catch (error) {
      console.error('Error updating book:', error)
      toast.error('Failed to update book')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!book) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Book</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form Fields - Simple stacked layout for mobile */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                required
                placeholder="Enter book title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="author" className="text-sm font-medium">Author</Label>
              <Input
                id="author"
                name="author"
                value={formData.author || ''}
                onChange={handleChange}
                placeholder="Enter author name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="isbn" className="text-sm font-medium">ISBN</Label>
              <Input
                id="isbn"
                name="isbn"
                value={formData.isbn || ''}
                onChange={handleChange}
                placeholder="Enter ISBN"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="published_date" className="text-sm font-medium">Published Date</Label>
                <Input
                  id="published_date"
                  name="published_date"
                  type="date"
                  value={formData.published_date?.substring(0, 10) || ''}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purchased_date" className="text-sm font-medium">Purchased Date</Label>
                <Input
                  id="purchased_date"
                  name="purchased_date"
                  type="date"
                  value={formData.purchased_date?.substring(0, 10) || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="purchase_location" className="text-sm font-medium">Purchase Location</Label>
              <Input
                id="purchase_location"
                name="purchase_location"
                value={formData.purchase_location || ''}
                onChange={handleChange}
                placeholder="Where did you buy this book?"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reader" className="text-sm font-medium">Reader</Label>
              <Input
                id="reader"
                name="reader"
                value={formData.reader || ''}
                onChange={handleChange}
                placeholder="Who is reading this book?"
              />
            </div>
            
            <div className="space-y-2">
              <LocationSelector
                value={formData.location_id || ''}
                onChange={(locationId, locationPath) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    location_id: locationId,
                    // Keep legacy location for backward compatibility
                    location: locationPath
                  }))
                }}
                placeholder="Choose where this book is located"
              />
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
              <Checkbox 
                id="read" 
                checked={formData.read || false} 
                onCheckedChange={handleCheckboxChange} 
              />
              <Label htmlFor="read" className="text-sm font-medium cursor-pointer">
                Mark as read
              </Label>
            </div>
          </div>
          
          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}