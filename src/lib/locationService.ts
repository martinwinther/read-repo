import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Location type definition
export interface Location {
  id: string
  parent_id: string | null
  name: string
  preset: boolean
  deleted_at?: string
  user_id: string
}

// Location with hierarchy information
export interface LocationWithPath {
  id: string
  parent_id: string | null
  name: string
  preset: boolean
  full_path: string
  level: number
  children?: LocationWithPath[]
}

// Predefined location presets
export const LOCATION_PRESETS = [
  { path: ['Living Room', 'Bookshelf', 'Top Shelf'] },
  { path: ['Living Room', 'Bookshelf', 'Middle Shelf'] },
  { path: ['Living Room', 'Bookshelf', 'Bottom Shelf'] },
  { path: ['Bedroom', 'Nightstand'] },
  { path: ['Home Office', 'Bookshelf'] },
  { path: ['Study', 'Floor-to-Ceiling Shelf'] },
  { path: ['Basement', 'Box A'] },
  { path: ['Basement', 'Box B'] },
  { path: ['Attic', 'Crate 1'] },
  { path: ['Kitchen', 'Cookbook Shelf'] },
]

/**
 * Get all locations for the current user in a hierarchical structure
 */
export async function getUserLocations(): Promise<LocationWithPath[]> {
  const supabase = createClientComponentClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('name')

  if (error) {
    console.error('Error fetching locations:', error)
    throw error
  }

  return buildLocationHierarchy(data || [])
}

/**
 * Get root locations (rooms) for dropdowns
 */
export async function getRootLocations(): Promise<Location[]> {
  const supabase = createClientComponentClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('user_id', user.id)
    .is('parent_id', null)
    .is('deleted_at', null)
    .order('name')

  if (error) {
    console.error('Error fetching root locations:', error)
    throw error
  }

  return data || []
}

/**
 * Get child locations for a parent
 */
export async function getChildLocations(parentId: string): Promise<Location[]> {
  const supabase = createClientComponentClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('user_id', user.id)
    .eq('parent_id', parentId)
    .is('deleted_at', null)
    .order('name')

  if (error) {
    console.error('Error fetching child locations:', error)
    throw error
  }

  return data || []
}

/**
 * Create a new location
 */
export async function createLocation(
  name: string, 
  parentId: string | null = null, 
  preset: boolean = false
): Promise<Location> {
  const supabase = createClientComponentClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('locations')
    .insert({
      name: name.trim(),
      parent_id: parentId,
      preset,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating location:', error)
    throw error
  }

  return data
}

/**
 * Create preset locations for a user
 */
export async function createPresetLocations(): Promise<void> {
  const supabase = createClientComponentClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  for (const preset of LOCATION_PRESETS) {
    let parentId: string | null = null
    
    for (let i = 0; i < preset.path.length; i++) {
      const name = preset.path[i]
      
      // Check if location already exists
      const { data: existing }: { data: { id: string } | null } = await supabase
        .from('locations')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', name)
        .eq('parent_id', parentId)
        .is('deleted_at', null)
        .single()

      if (existing) {
        parentId = existing.id
        continue
      }

      // Create new location
      const { data: newLocation, error }: { data: Location | null, error: any } = await supabase
        .from('locations')
        .insert({
          name,
          parent_id: parentId,
          preset: true,
          user_id: user.id
        })
        .select()
        .single()

      if (error || !newLocation) {
        console.error('Error creating preset location:', error)
        throw error || new Error('Failed to create location')
      }

      parentId = newLocation.id
    }
  }
}

/**
 * Update a location
 */
export async function updateLocation(id: string, updates: Partial<Location>): Promise<Location> {
  const supabase = createClientComponentClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('locations')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating location:', error)
    throw error
  }

  return data
}

/**
 * Soft delete a location
 */
export async function deleteLocation(id: string): Promise<void> {
  const supabase = createClientComponentClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Check for dependencies first
  const { data: children } = await supabase
    .from('locations')
    .select('id')
    .eq('parent_id', id)
    .is('deleted_at', null)

  const { data: books } = await supabase
    .from('books')
    .select('id')
    .eq('location_id', id)

  if (children && children.length > 0) {
    throw new Error('Cannot delete location with child locations')
  }

  if (books && books.length > 0) {
    throw new Error('Cannot delete location with books assigned to it')
  }

  const { error } = await supabase
    .from('locations')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting location:', error)
    throw error
  }
}

/**
 * Find similar locations using fuzzy matching
 */
export async function findSimilarLocations(
  candidate: string, 
  parentId: string | null = null
): Promise<Array<Location & { similarity: number }>> {
  const supabase = createClientComponentClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // For now, use simple client-side similarity
  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .eq('user_id', user.id)
    .eq('parent_id', parentId)
    .is('deleted_at', null)

  if (!locations) return []

  return locations
    .map(location => ({
      ...location,
      similarity: calculateSimilarity(candidate.toLowerCase(), location.name.toLowerCase())
    }))
    .filter(location => location.similarity > 0.4)
    .sort((a, b) => b.similarity - a.similarity)
}

/**
 * Get the full path for a location
 */
export async function getLocationPath(locationId: string): Promise<string> {
  const supabase = createClientComponentClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const path: string[] = []
  let currentId: string | null = locationId

  while (currentId) {
    const { data: location }: { data: { name: string, parent_id: string | null } | null } = await supabase
      .from('locations')
      .select('name, parent_id')
      .eq('id', currentId)
      .eq('user_id', user.id)
      .single()

    if (!location) break

    path.unshift(location.name)
    currentId = location.parent_id
  }

  return path.join(' › ')
}

/**
 * Build hierarchical structure from flat location data
 */
function buildLocationHierarchy(locations: Location[]): LocationWithPath[] {
  const locationMap = new Map<string, LocationWithPath>()
  const rootLocations: LocationWithPath[] = []

  // First pass: create map with path information
  locations.forEach(location => {
    locationMap.set(location.id, {
      ...location,
      full_path: location.name,
      level: 0,
      children: []
    })
  })

  // Second pass: build hierarchy and calculate paths
  locations.forEach(location => {
    const locationWithPath = locationMap.get(location.id)!
    
    if (location.parent_id) {
      const parent = locationMap.get(location.parent_id)
      if (parent) {
        parent.children!.push(locationWithPath)
        locationWithPath.full_path = `${parent.full_path} › ${location.name}`
        locationWithPath.level = parent.level + 1
      }
    } else {
      rootLocations.push(locationWithPath)
    }
  })

  return rootLocations
}

/**
 * Simple similarity calculation (Levenshtein distance based)
 */
function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 1
  if (a.length === 0 || b.length === 0) return 0

  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null))

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      )
    }
  }

  const maxLength = Math.max(a.length, b.length)
  return 1 - matrix[b.length][a.length] / maxLength
} 