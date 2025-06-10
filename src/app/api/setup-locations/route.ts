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

    // Step 1: Create the locations table (if it doesn't exist)
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS locations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        parent_id UUID REFERENCES locations(id) ON DELETE RESTRICT,
        name TEXT NOT NULL,
        preset BOOLEAN NOT NULL DEFAULT false,
        deleted_at TIMESTAMPTZ,
        user_id UUID NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `

    const { error: tableError } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    if (tableError) {
      console.error('Error creating locations table:', tableError)
      return NextResponse.json({ error: 'Failed to create locations table' }, { status: 500 })
    }

    // Step 2: Create indexes
    const indexSQL = `
      CREATE UNIQUE INDEX IF NOT EXISTS idx_locations_parent_name 
        ON locations(parent_id, user_id, lower(name)) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_locations_parent ON locations(parent_id);
      CREATE INDEX IF NOT EXISTS idx_locations_preset ON locations(preset);
      CREATE INDEX IF NOT EXISTS idx_locations_user ON locations(user_id);
    `

    const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexSQL })
    if (indexError) {
      console.error('Error creating indexes:', indexError)
      return NextResponse.json({ error: 'Failed to create indexes' }, { status: 500 })
    }

    // Step 3: Add location_id column to books table (if it doesn't exist)
    const alterBooksSQL = `
      ALTER TABLE books 
      ADD COLUMN IF NOT EXISTS location_id UUID 
      REFERENCES locations(id) ON DELETE SET NULL;
    `

    const { error: alterError } = await supabase.rpc('exec_sql', { sql: alterBooksSQL })
    if (alterError) {
      console.error('Error altering books table:', alterError)
      return NextResponse.json({ error: 'Failed to alter books table' }, { status: 500 })
    }

    // Step 4: Migrate existing location data for this user
    const { data: userBooks, error: booksError } = await supabase
      .from('books')
      .select('id, location')
      .eq('user_id', user.id)
      .not('location', 'is', null)

    if (booksError) {
      console.error('Error fetching user books:', booksError)
      return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
    }

    let migratedCount = 0
    if (userBooks && userBooks.length > 0) {
      // Create a "Legacy Locations" root for this user
      const { data: legacyRoot, error: rootError } = await supabase
        .from('locations')
        .insert({
          name: 'Legacy Locations',
          preset: false,
          user_id: user.id
        })
        .select()
        .single()

      if (rootError || !legacyRoot) {
        console.error('Error creating legacy root:', rootError)
        return NextResponse.json({ error: 'Failed to create legacy root' }, { status: 500 })
      }

      // Get unique locations for this user
      const uniqueLocations = Array.from(new Set(userBooks.map(book => book.location).filter(Boolean)))
      
      // Create location entries for each unique location
      const locationInserts = uniqueLocations.map(location => ({
        name: location,
        parent_id: legacyRoot.id,
        preset: false,
        user_id: user.id
      }))

      const { data: createdLocations, error: locationError } = await supabase
        .from('locations')
        .insert(locationInserts)
        .select()

      if (locationError || !createdLocations) {
        console.error('Error creating locations:', locationError)
        return NextResponse.json({ error: 'Failed to create locations' }, { status: 500 })
      }

      // Create a map of location name to location id
      const locationMap = new Map(
        createdLocations.map(loc => [loc.name, loc.id])
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
    }

    // Step 5: Create index for books.location_id
    const bookIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_books_location_id ON books(location_id);
    `

    const { error: bookIndexError } = await supabase.rpc('exec_sql', { sql: bookIndexSQL })
    if (bookIndexError) {
      console.error('Error creating book index:', bookIndexError)
    }

    return NextResponse.json({ 
      success: true, 
      message: `Locations system set up successfully. Migrated ${migratedCount} books.`,
      migratedCount
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