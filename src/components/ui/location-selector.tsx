'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'
import { Badge } from './badge'
import { Plus, MapPin, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import {
  getRootLocations,
  getChildLocations,
  createLocation,
  findSimilarLocations,
  getLocationPath,
  type Location,
  type LocationWithPath
} from '@/lib/locationService'

interface LocationSelectorProps {
  value?: string // location_id
  onChange: (locationId: string, locationPath: string) => void
  placeholder?: string
  className?: string
}

export function LocationSelector({ 
  value, 
  onChange, 
  placeholder = "Select or create a location",
  className 
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLocationPath, setCurrentLocationPath] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  // Load current location path when value changes
  useEffect(() => {
    if (value) {
      getLocationPath(value)
        .then(path => setCurrentLocationPath(path))
        .catch(err => console.error('Error loading location path:', err))
    } else {
      setCurrentLocationPath('')
    }
  }, [value])

  const handleLocationSelect = useCallback((locationId: string, locationPath: string) => {
    onChange(locationId, locationPath)
    setCurrentLocationPath(locationPath)
    setIsOpen(false)
    toast.success(`Location set to: ${locationPath}`)
  }, [onChange])

  return (
    <div className={className}>
      <Label>Location</Label>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <MapPin className="mr-2 h-4 w-4" />
            {currentLocationPath || placeholder}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Choose Book Location</DialogTitle>
          </DialogHeader>
          <LocationPicker onSelect={handleLocationSelect} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface LocationPickerProps {
  onSelect: (locationId: string, locationPath: string) => void
}

function LocationPicker({ onSelect }: LocationPickerProps) {
  const [step, setStep] = useState<'room' | 'location' | 'sublocation'>('room')
  const [selectedRoom, setSelectedRoom] = useState<Location | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [roomOptions, setRoomOptions] = useState<Location[]>([])
  const [locationOptions, setLocationOptions] = useState<Location[]>([])
  const [sublocationOptions, setSublocationOptions] = useState<Location[]>([])
  const [customInput, setCustomInput] = useState('')
  const [suggestions, setSuggestions] = useState<Array<Location & { similarity: number }>>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load room options on mount
  useEffect(() => {
    loadRooms()
  }, [])

  const loadRooms = async () => {
    try {
      setIsLoading(true)
      const rooms = await getRootLocations()
      if (rooms && rooms.length > 0) {
        setRoomOptions(rooms)
      } else {
        // No rooms found, use defaults
        setRoomOptions([
          { id: 'temp-1', name: 'Living Room', parent_id: null, preset: true, user_id: '', deleted_at: undefined },
          { id: 'temp-2', name: 'Bedroom', parent_id: null, preset: true, user_id: '', deleted_at: undefined },
          { id: 'temp-3', name: 'Home Office', parent_id: null, preset: true, user_id: '', deleted_at: undefined },
          { id: 'temp-4', name: 'Study', parent_id: null, preset: true, user_id: '', deleted_at: undefined }
        ])
        toast.info('Using default room options - you can create custom locations')
      }
    } catch (error) {
      console.error('Error loading rooms:', error)
      // Provide default options if database setup is not complete
      setRoomOptions([
        { id: 'temp-1', name: 'Living Room', parent_id: null, preset: true, user_id: '', deleted_at: undefined },
        { id: 'temp-2', name: 'Bedroom', parent_id: null, preset: true, user_id: '', deleted_at: undefined },
        { id: 'temp-3', name: 'Home Office', parent_id: null, preset: true, user_id: '', deleted_at: undefined },
        { id: 'temp-4', name: 'Study', parent_id: null, preset: true, user_id: '', deleted_at: undefined }
      ])
      toast.warning('Location system not fully set up - using temporary options')
    } finally {
      setIsLoading(false)
    }
  }

  const loadLocationOptions = async (roomId: string) => {
    try {
      setIsLoading(true)
      const locations = await getChildLocations(roomId)
      if (locations && locations.length > 0) {
        setLocationOptions(locations)
      } else {
        // Provide common default locations based on room type
        const room = roomOptions.find(r => r.id === roomId)
        const roomName = room?.name.toLowerCase() || ''
        
        let defaultLocations: any[] = []
        
        if (roomName.includes('living')) {
          defaultLocations = [
            { id: `${roomId}-1`, name: 'Bookshelf', parent_id: roomId, preset: true, user_id: '', deleted_at: undefined },
            { id: `${roomId}-2`, name: 'Coffee Table', parent_id: roomId, preset: true, user_id: '', deleted_at: undefined },
            { id: `${roomId}-3`, name: 'Side Table', parent_id: roomId, preset: true, user_id: '', deleted_at: undefined }
          ]
        } else if (roomName.includes('bedroom')) {
          defaultLocations = [
            { id: `${roomId}-1`, name: 'Nightstand', parent_id: roomId, preset: true, user_id: '', deleted_at: undefined },
            { id: `${roomId}-2`, name: 'Dresser', parent_id: roomId, preset: true, user_id: '', deleted_at: undefined },
            { id: `${roomId}-3`, name: 'Bookshelf', parent_id: roomId, preset: true, user_id: '', deleted_at: undefined }
          ]
        } else if (roomName.includes('office') || roomName.includes('study')) {
          defaultLocations = [
            { id: `${roomId}-1`, name: 'Bookshelf', parent_id: roomId, preset: true, user_id: '', deleted_at: undefined },
            { id: `${roomId}-2`, name: 'Desk', parent_id: roomId, preset: true, user_id: '', deleted_at: undefined },
            { id: `${roomId}-3`, name: 'Filing Cabinet', parent_id: roomId, preset: true, user_id: '', deleted_at: undefined }
          ]
        } else {
          defaultLocations = [
            { id: `${roomId}-1`, name: 'Shelf', parent_id: roomId, preset: true, user_id: '', deleted_at: undefined },
            { id: `${roomId}-2`, name: 'Table', parent_id: roomId, preset: true, user_id: '', deleted_at: undefined }
          ]
        }
        
        setLocationOptions(defaultLocations)
      }
    } catch (error) {
      console.error('Error loading locations:', error)
      // Set empty for now, user can create custom locations
      setLocationOptions([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadSublocationOptions = async (locationId: string) => {
    try {
      setIsLoading(true)
      const sublocations = await getChildLocations(locationId)
      if (sublocations && sublocations.length > 0) {
        setSublocationOptions(sublocations)
      } else {
        // Provide common default sublocations based on location type
        const location = locationOptions.find(l => l.id === locationId)
        const locationName = location?.name.toLowerCase() || ''
        
        let defaultSublocations: any[] = []
        
        if (locationName.includes('bookshelf') || locationName.includes('shelf')) {
          defaultSublocations = [
            { id: `${locationId}-1`, name: 'Top Shelf', parent_id: locationId, preset: true, user_id: '', deleted_at: undefined },
            { id: `${locationId}-2`, name: 'Middle Shelf', parent_id: locationId, preset: true, user_id: '', deleted_at: undefined },
            { id: `${locationId}-3`, name: 'Bottom Shelf', parent_id: locationId, preset: true, user_id: '', deleted_at: undefined }
          ]
        } else if (locationName.includes('desk')) {
          defaultSublocations = [
            { id: `${locationId}-1`, name: 'Drawer', parent_id: locationId, preset: true, user_id: '', deleted_at: undefined },
            { id: `${locationId}-2`, name: 'Desktop', parent_id: locationId, preset: true, user_id: '', deleted_at: undefined }
          ]
        } else if (locationName.includes('table')) {
          defaultSublocations = [
            { id: `${locationId}-1`, name: 'On Top', parent_id: locationId, preset: true, user_id: '', deleted_at: undefined },
            { id: `${locationId}-2`, name: 'Underneath', parent_id: locationId, preset: true, user_id: '', deleted_at: undefined }
          ]
        }
        // For other locations, we can leave empty (no sublocation required)
        
        setSublocationOptions(defaultSublocations)
      }
    } catch (error) {
      console.error('Error loading sublocations:', error)
      // Set empty for now, user can create custom locations
      setSublocationOptions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoomSelect = async (room: Location) => {
    setSelectedRoom(room)
    await loadLocationOptions(room.id)
    setStep('location')
  }

  const handleLocationSelect = async (location: Location) => {
    setSelectedLocation(location)
    await loadSublocationOptions(location.id)
    
    // Always go to sublocation step first, let user decide
    setStep('sublocation')
  }

  const handleSublocationSelect = async (sublocation: Location) => {
    // Build path manually for temporary locations
    if (sublocation.id.startsWith('temp-')) {
      const path = `${selectedRoom?.name} › ${selectedLocation?.name} › ${sublocation.name}`
      onSelect(sublocation.id, path)
    } else {
      const path = await getLocationPath(sublocation.id)
      onSelect(sublocation.id, path)
    }
  }

  const handleCustomInputChange = async (value: string) => {
    setCustomInput(value)
    
    if (value.length > 2) {
      try {
        const parentId = step === 'room' ? null : 
                        step === 'location' ? selectedRoom?.id :
                        selectedLocation?.id
        
        const similar = await findSimilarLocations(value, parentId || null)
        setSuggestions(similar)
      } catch (error) {
        console.error('Error finding similar locations:', error)
      }
    } else {
      setSuggestions([])
    }
  }

  const handleCreateCustomLocation = async () => {
    if (!customInput.trim()) return

    try {
      setIsLoading(true)
      const parentId = step === 'room' ? null : 
                     step === 'location' ? selectedRoom?.id :
                     selectedLocation?.id

      // Check if parent is temporary, if so create a temporary path
      if (parentId && parentId.startsWith('temp-')) {
        const tempId = `temp-${Date.now()}`
        let fallbackPath = customInput.trim()
        
        if (step === 'location' && selectedRoom) {
          fallbackPath = `${selectedRoom.name} › ${customInput.trim()}`
        } else if (step === 'sublocation' && selectedRoom && selectedLocation) {
          fallbackPath = `${selectedRoom.name} › ${selectedLocation.name} › ${customInput.trim()}`
        }
        
        onSelect(tempId, fallbackPath)
        toast.info(`Created temporary location: ${fallbackPath}`)
        return
      }

      const newLocation = await createLocation(customInput.trim(), parentId || null)
      const path = await getLocationPath(newLocation.id)
      
      onSelect(newLocation.id, path)
      toast.success(`Created new location: ${path}`)
    } catch (error) {
      console.error('Error creating location:', error)
      // Fallback: use the custom input as legacy location
      const tempId = `temp-${Date.now()}`
      let fallbackPath = customInput.trim()
      
      if (step === 'location' && selectedRoom) {
        fallbackPath = `${selectedRoom.name} › ${customInput.trim()}`
      } else if (step === 'sublocation' && selectedRoom && selectedLocation) {
        fallbackPath = `${selectedRoom.name} › ${selectedLocation.name} › ${customInput.trim()}`
      }
      
      onSelect(tempId, fallbackPath)
      toast.warning(`Using temporary location: ${fallbackPath}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentOptions = () => {
    switch (step) {
      case 'room': return roomOptions
      case 'location': return locationOptions
      case 'sublocation': return sublocationOptions
      default: return []
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 'room': return 'Choose a Room'
      case 'location': return `Choose Location in ${selectedRoom?.name}`
      case 'sublocation': return `Choose Specific Spot in ${selectedLocation?.name}`
      default: return 'Choose Location'
    }
  }

  const getStepHandler = () => {
    switch (step) {
      case 'room': return handleRoomSelect
      case 'location': return handleLocationSelect
      case 'sublocation': return handleSublocationSelect
      default: return () => {}
    }
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted-foreground">
        <span className={step === 'room' ? 'font-medium text-foreground' : ''}>
          Room
        </span>
        {selectedRoom && (
          <>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className={step === 'location' ? 'font-medium text-foreground' : ''}>
              Location
            </span>
          </>
        )}
        {selectedLocation && (
          <>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className={step === 'sublocation' ? 'font-medium text-foreground' : ''}>
              Specific Spot
            </span>
          </>
        )}
      </div>

      {/* Current selection */}
      {selectedRoom && (
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {selectedRoom.name}
          </Badge>
          {selectedLocation && (
            <Badge variant="secondary">
              {selectedLocation.name}
            </Badge>
          )}
        </div>
      )}

      <div>
        <Label>{getStepTitle()}</Label>
        
        {/* Existing options */}
        <div className="grid gap-2 mt-2 max-h-48 overflow-y-auto">
          {/* Option to select parent location */}
          {step === 'location' && selectedRoom && (
            <Button
              variant="default"
              className="justify-start h-auto p-3 border-primary"
              onClick={async () => {
                const path = selectedRoom.name
                onSelect(selectedRoom.id, path)
              }}
            >
              <div className="text-left">
                <div className="font-medium">📍 Use &quot;{selectedRoom.name}&quot;</div>
                <div className="text-xs text-muted-foreground">Select just the room</div>
              </div>
            </Button>
          )}
          
          {/* Option to select parent location when viewing sublocations */}
          {step === 'sublocation' && selectedLocation && (
            <Button
              variant="default"
              className="justify-start h-auto p-3 border-primary"
              onClick={async () => {
                const path = `${selectedRoom?.name} › ${selectedLocation.name}`
                onSelect(selectedLocation.id, path)
              }}
            >
              <div className="text-left">
                <div className="font-medium">📍 Use &quot;{selectedLocation.name}&quot;</div>
                <div className="text-xs text-muted-foreground">Select this location without going deeper</div>
              </div>
            </Button>
          )}
          
          {getCurrentOptions().map((option) => (
            <Button
              key={option.id}
              variant="outline"
              className="justify-start h-auto p-3"
              onClick={() => getStepHandler()(option)}
            >
              <div className="text-left">
                <div className="font-medium">{option.name}</div>
                {option.preset && (
                  <Badge variant="outline" className="text-xs mt-1">
                    Preset
                  </Badge>
                )}
              </div>
            </Button>
          ))}
        </div>

        {/* Custom input */}
        <div className="mt-4 space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder={`Or create new ${step}...`}
              value={customInput}
              onChange={(e) => handleCustomInputChange(e.target.value)}
            />
            <Button 
              onClick={handleCreateCustomLocation}
              disabled={!customInput.trim() || isLoading}
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Create
            </Button>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Did you mean:
              </Label>
              {suggestions.slice(0, 3).map((suggestion) => (
                <Button
                  key={suggestion.id}
                  variant="ghost"
                  size="sm"
                  className="h-auto p-2 justify-start text-left"
                  onClick={() => getStepHandler()(suggestion)}
                >
                  <div>
                    <div className="font-medium">{suggestion.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(suggestion.similarity * 100)}% match
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Back button */}
      {step !== 'room' && (
        <Button
          variant="outline"
          onClick={() => {
            if (step === 'sublocation') {
              setStep('location')
              setSelectedLocation(null)
            } else if (step === 'location') {
              setStep('room')
              setSelectedRoom(null)
            }
          }}
        >
          Back
        </Button>
      )}
    </div>
  )
} 