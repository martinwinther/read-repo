import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check if the user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Setting up location system for user:', user.id)

    // Check if locations table exists by trying to query it
    let tableExists = false
    try {
      const { error } = await supabase
        .from('locations')
        .select('id')
        .limit(1)
      
      tableExists = !error
    } catch (e) {
      tableExists = false
    }

    if (!tableExists) {
      console.log('Locations table does not exist - manual database setup required')
      return NextResponse.json({ 
        error: 'Database setup required',
        message: 'Please run the setup-database.sql script in your Supabase dashboard first'
      }, { status: 400 })
    }

    // Check if location_id column exists in books table
    let locationColumnExists = false
    try {
      const { data: books } = await supabase
        .from('books')
        .select('location_id')
        .limit(1)
      
      locationColumnExists = true
    } catch (e) {
      locationColumnExists = false
    }

    if (!locationColumnExists) {
      console.log('location_id column does not exist in books table')
      return NextResponse.json({ 
        error: 'Books table not updated',
        message: 'Please run the setup-database.sql script to add location_id column'
      }, { status: 400 })
    }

    // Check if user already has locations set up
    const { data: existingLocations } = await supabase
      .from('locations')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    let setupMessage = ''

    // Create preset locations if user doesn't have any
    if (!existingLocations || existingLocations.length === 0) {
      console.log('Creating preset locations for user')
      
      // Call the preset creation function
      const { error: presetError } = await supabase.rpc('create_preset_locations_for_user', {
        user_uuid: user.id
      })

      if (presetError) {
        console.error('Error creating preset locations:', presetError)
        return NextResponse.json({ 
          error: 'Failed to create preset locations',
          details: presetError.message
        }, { status: 500 })
      }

      setupMessage += 'Preset locations created. '
    } else {
      setupMessage += 'Preset locations already exist. '
    }

    // Migrate existing location data for this user
    const { data: userBooks, error: booksError } = await supabase
      .from('books')
      .select('id, location')
      .eq('user_id', user.id)
      .not('location', 'is', null)
      .is('location_id', null) // Only migrate books that haven't been migrated yet

    if (booksError) {
      console.error('Error fetching user books:', booksError)
      return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
    }

    let migratedCount = 0
    if (userBooks && userBooks.length > 0) {
      console.log(`Migrating ${userBooks.length} books with legacy locations`)

      // Check if "Legacy Locations" root already exists
      let { data: legacyRoot } = await supabase
        .from('locations')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', 'Legacy Locations')
        .is('parent_id', null)
        .single()

      // Create "Legacy Locations" root if it doesn't exist
      if (!legacyRoot) {
        const { data: newLegacyRoot, error: rootError } = await supabase
          .from('locations')
          .insert({
            name: 'Legacy Locations',
            preset: false,
            user_id: user.id
          })
          .select()
          .single()

        if (rootError || !newLegacyRoot) {
          console.error('Error creating legacy root:', rootError)
          return NextResponse.json({ error: 'Failed to create legacy root' }, { status: 500 })
        }

        legacyRoot = newLegacyRoot
      }

      if (!legacyRoot) {
        console.error('Failed to get or create legacy root location')
        return NextResponse.json({ error: 'Failed to setup legacy locations' }, { status: 500 })
      }

      // Get unique locations for this user
      const uniqueLocations = Array.from(new Set(userBooks.map(book => book.location).filter(Boolean)))
      
      // Get existing legacy locations to avoid duplicates
      const { data: existingLegacyLocations } = await supabase
        .from('locations')
        .select('id, name')
        .eq('parent_id', legacyRoot.id)
        .eq('user_id', user.id)

      const existingLocationNames = new Set(existingLegacyLocations?.map(loc => loc.name) || [])
      
      // Create location entries for new unique locations
      const newLocationNames = uniqueLocations.filter(name => !existingLocationNames.has(name))
      
      if (newLocationNames.length > 0) {
        const locationInserts = newLocationNames.map(location => ({
          name: location,
          parent_id: legacyRoot.id,
          preset: false,
          user_id: user.id
        }))

        const { data: createdLocations, error: locationError } = await supabase
          .from('locations')
          .insert(locationInserts)
          .select()

        if (locationError) {
          console.error('Error creating locations:', locationError)
          return NextResponse.json({ error: 'Failed to create locations' }, { status: 500 })
        }

        existingLegacyLocations?.push(...(createdLocations || []))
      }

      // Create a map of location name to location id
      const locationMap = new Map(
        existingLegacyLocations?.map(loc => [loc.name, loc.id]) || []
      )

      // Update books with location_id
      for (const book of userBooks) {
        if (book.location) {
          const locationId = locationMap.get(book.location)
          if (locationId) {
            const { error: updateError } = await supabase
              .from('books')
              .update({ location_id: locationId })
              .eq('id', book.id)

            if (!updateError) {
              migratedCount++
            }
          }
        }
      }

      setupMessage += `Migrated ${migratedCount} books to hierarchical locations.`
    } else {
      setupMessage += 'No legacy books to migrate.'
    }

    return NextResponse.json({ 
      success: true, 
      message: setupMessage,
      migratedCount,
      user_id: user.id
    })

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to execute raw SQL (you'll need to create this RPC in Supabase)
export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to set up locations system',
    instructions: `
      This endpoint sets up the hierarchical locations system:
      1. Creates locations table
      2. Adds indexes for performance
      3. Adds location_id column to books table
      4. Migrates existing location data
      5. Creates book index for location_id
    `
  })
} 