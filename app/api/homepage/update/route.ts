import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    console.log('Homepage update POST request received at:', new Date().toISOString())
    const updates = await request.json()
    console.log('Updates received:', JSON.stringify(updates))
    
    // Validate that we have at least one field to update
    if (!updates || Object.keys(updates).length === 0) {
      console.error('No updates provided')
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      )
    }
    
    // First check if table exists and has data
    console.log('Checking if homepage_content table has data...')
    const checkResults = await executeQuery('SELECT COUNT(*) as count FROM homepage_content')
    console.log('Check results:', checkResults)
    const hasData = Array.isArray(checkResults) && (checkResults[0] as any)?.count > 0
    console.log('Has data:', hasData)
    
    // Convert camelCase to snake_case for database
    const dbUpdates: any = {}
    if (updates.heroTitle !== undefined) dbUpdates.hero_title = updates.heroTitle
    if (updates.heroDescription !== undefined) dbUpdates.hero_description = updates.heroDescription
    if (updates.heroImage !== undefined) dbUpdates.hero_image = updates.heroImage
    if (updates.aboutTitle !== undefined) dbUpdates.about_title = updates.aboutTitle
    if (updates.aboutDescription !== undefined) dbUpdates.about_description = updates.aboutDescription
    if (updates.ctaTitle !== undefined) dbUpdates.cta_title = updates.ctaTitle
    if (updates.ctaDescription !== undefined) dbUpdates.cta_description = updates.ctaDescription
    if (updates.ctaButtonText !== undefined) dbUpdates.cta_button_text = updates.ctaButtonText
    if (updates.features !== undefined) dbUpdates.features = JSON.stringify(updates.features)
    if (updates.contactLocation !== undefined) dbUpdates.contact_location = updates.contactLocation
    if (updates.contactPhone !== undefined) dbUpdates.contact_phone = updates.contactPhone
    if (updates.contactEmail !== undefined) dbUpdates.contact_email = updates.contactEmail
    if (updates.contactHours !== undefined) dbUpdates.contact_hours = updates.contactHours

    if (hasData) {
      // Update existing record
      const setClause = Object.keys(dbUpdates).map(key => `${key} = ?`).join(', ')
      const values = Object.values(dbUpdates)

      console.log('Updating existing record with query:', `UPDATE homepage_content SET ${setClause} WHERE id = 1`)
      console.log('Values:', values)
      
      await executeQuery(
        `UPDATE homepage_content SET ${setClause} WHERE id = 1`,
        values
      )
      console.log('Update successful')
    } else {
      // Insert new record
      const columns = Object.keys(dbUpdates).join(', ')
      const placeholders = Object.keys(dbUpdates).map(() => '?').join(', ')
      const values = Object.values(dbUpdates)

      console.log('Inserting new record with query:', `INSERT INTO homepage_content (${columns}) VALUES (${placeholders})`)
      console.log('Values:', values)
      
      await executeQuery(
        `INSERT INTO homepage_content (${columns}) VALUES (${placeholders})`,
        values
      )
      console.log('Insert successful')
    }

    console.log('Homepage content updated successfully')
    return NextResponse.json({ message: 'Homepage content updated successfully' })
  } catch (error) {
    console.error('Error updating homepage content:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Failed to update homepage content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}