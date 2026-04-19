import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function GET() {
  try {
    const results = await executeQuery('SELECT * FROM homepage_content ORDER BY id DESC LIMIT 1')
    
    if (!Array.isArray(results) || results.length === 0) {
      // Return default content if table is empty or doesn't exist
      return NextResponse.json({
        heroTitle: 'Welcome to One Estela Place',
        heroDescription: 'The premier event and office space',
        heroImage: '',
        aboutTitle: 'About Us',
        aboutDescription: 'Premium venues and office spaces',
        ctaTitle: 'Ready to Book?',
        ctaDescription: 'Contact us today',
        ctaButtonText: 'Get Started',
        features: []
      })
    }

    const content = results[0] as any
    
    return NextResponse.json({
      id: content.id,
      heroTitle: content.hero_title || '',
      heroDescription: content.hero_description || '',
      heroImage: content.hero_image || '',
      aboutTitle: content.about_title || '',
      aboutDescription: content.about_description || '',
      ctaTitle: content.cta_title || '',
      ctaDescription: content.cta_description || '',
      ctaButtonText: content.cta_button_text || '',
      features: content.features ? JSON.parse(content.features) : [],
      contactLocation: content.contact_location || '123 Event Street\nDowntown District\nCity, State 12345',
      contactPhone: content.contact_phone || '(555) 123-4567',
      contactEmail: content.contact_email || 'info@oneestela.com',
      contactHours: content.contact_hours || 'Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: By appointment only'
    })
  } catch (error) {
    console.error('Error fetching homepage content:', error)
    // Return default content on error
    return NextResponse.json({
      heroTitle: 'Welcome to One Estela Place',
      heroDescription: 'The premier event and office space',
      heroImage: '',
      aboutTitle: 'About Us',
      aboutDescription: 'Premium venues and office spaces',
      ctaTitle: 'Ready to Book?',
      ctaDescription: 'Contact us today',
      ctaButtonText: 'Get Started',
      features: []
    })
  }
}

export async function PUT(request: Request) {
  try {
    const updates = await request.json()
    
    // First check if table exists and has data
    const checkResults = await executeQuery('SELECT COUNT(*) as count FROM homepage_content')
    const hasData = Array.isArray(checkResults) && (checkResults[0] as any)?.count > 0
    
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

      await executeQuery(
        `UPDATE homepage_content SET ${setClause} WHERE id = 1`,
        values
      )
    } else {
      // Insert new record
      const columns = Object.keys(dbUpdates).join(', ')
      const placeholders = Object.keys(dbUpdates).map(() => '?').join(', ')
      const values = Object.values(dbUpdates)

      await executeQuery(
        `INSERT INTO homepage_content (${columns}) VALUES (${placeholders})`,
        values
      )
    }

    return NextResponse.json({ message: 'Homepage content updated successfully' })
  } catch (error) {
    console.error('Error updating homepage content:', error)
    return NextResponse.json(
      { error: 'Failed to update homepage content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
