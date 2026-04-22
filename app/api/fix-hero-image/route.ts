import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('Fixing hero_image column size...')
    
    // Modify the hero_image column to LONGTEXT to support base64 images
    await executeQuery(`
      ALTER TABLE homepage_content 
      MODIFY COLUMN hero_image LONGTEXT
    `)
    
    console.log('✅ hero_image column updated to LONGTEXT')
    
    // Verify the change
    const tableInfo = await executeQuery(`DESCRIBE homepage_content`)
    
    return NextResponse.json({
      success: true,
      message: 'hero_image column successfully updated to LONGTEXT',
      tableInfo
    })
  } catch (error) {
    console.error('Error fixing hero_image column:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fix hero_image column', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
