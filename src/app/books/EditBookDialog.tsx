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
  location?: string
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Book</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="author" className="text-right">Author</Label>
              <Input
                id="author"
                name="author"
                value={formData.author || ''}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isbn" className="text-right">ISBN</Label>
              <Input
                id="isbn"
                name="isbn"
                value={formData.isbn || ''}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="published_date" className="text-right">Published Date</Label>
              <Input
                id="published_date"
                name="published_date"
                type="date"
                value={formData.published_date?.substring(0, 10) || ''}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="purchased_date" className="text-right">Purchased Date</Label>
              <Input
                id="purchased_date"
                name="purchased_date"
                type="date"
                value={formData.purchased_date?.substring(0, 10) || ''}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="purchase_location" className="text-right">Purchase Location</Label>
              <Input
                id="purchase_location"
                name="purchase_location"
                value={formData.purchase_location || ''}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="read" className="text-right">Read</Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox 
                  id="read" 
                  checked={formData.read || false} 
                  onCheckedChange={handleCheckboxChange} 
                />
                <label htmlFor="read" className="text-sm font-medium">
                  Mark as read
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reader" className="text-right">Reader</Label>
              <Input
                id="reader"
                name="reader"
                value={formData.reader || ''}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
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