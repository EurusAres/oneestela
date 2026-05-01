'use client'

export interface HomepageContent {
  heroTitle: string
  heroDescription: string
  heroImage: string
  aboutTitle: string
  aboutDescription: string
  ctaTitle: string
  ctaDescription: string
  ctaButtonText: string
  features: Array<{
    id: string
    title: string
    description: string
  }>
  contactLocation?: string
  contactPhone?: string
  contactEmail?: string
  contactHours?: string
}

export interface Venue {
  id: string
  name: string
  description: string
  capacity: number
  images: string[]
  features: string[]
  price: number
  available: boolean
  createdAt: string
  updatedAt: string
}

export interface OfficeRoom {
  id: string
  floor: 'ground' | 'second'
  name: string
  description: string
  capacity: number
  images: string[]
  features: string[]
  available: boolean
  createdAt: string
  updatedAt: string
}

export interface ContentDatabase {
  homepage: HomepageContent
  venues: Venue[]
  officeRooms: OfficeRoom[]
  lastUpdated: string
}

// API-based content service - no localStorage usage
export const contentService = {
  // Homepage operations
  getHomepageContent: async (): Promise<HomepageContent> => {
    try {
      const response = await fetch('/api/homepage', {
        cache: 'no-store'
      })
      if (!response.ok) {
        throw new Error('Failed to fetch homepage content')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching homepage content:', error)
      // Return default content as fallback
      return {
        heroTitle: 'Welcome to One Estela Place',
        heroDescription: 'The perfect venue for your special events and celebrations',
        heroImage: '/images/venue-interior.jpg',
        aboutTitle: 'About One Estela Place',
        aboutDescription: 'One Estela Place is a premier event venue that has been hosting memorable celebrations for over a decade.',
        ctaTitle: 'Ready to host your event?',
        ctaDescription: 'Contact us today to book your perfect event space and create unforgettable memories.',
        ctaButtonText: 'Book Your Event',
        features: []
      }
    }
  },

  updateHomepageContent: async (updates: Partial<HomepageContent>): Promise<boolean> => {
    try {
      const response = await fetch('/api/homepage/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update homepage content')
      }
      
      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('cms-content-updated', { detail: { type: 'homepage' } }))
      return true
    } catch (error) {
      console.error('Error updating homepage content:', error)
      return false
    }
  },

  // Venue operations
  getVenues: async (): Promise<Venue[]> => {
    try {
      const response = await fetch('/api/venues', {
        cache: 'no-store'
      })
      if (!response.ok) {
        throw new Error('Failed to fetch venues')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching venues:', error)
      return []
    }
  },

  getVenueById: async (id: string): Promise<Venue | undefined> => {
    try {
      const venues = await contentService.getVenues()
      return venues.find(v => v.id === id)
    } catch (error) {
      console.error('Error fetching venue by ID:', error)
      return undefined
    }
  },

  addVenue: async (venue: Omit<Venue, 'id' | 'createdAt' | 'updatedAt'>): Promise<Venue | null> => {
    try {
      const response = await fetch('/api/venues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(venue),
      })
      
      if (!response.ok) {
        throw new Error('Failed to add venue')
      }
      
      const newVenue = await response.json()
      window.dispatchEvent(new CustomEvent('cms-content-updated', { detail: { type: 'venues' } }))
      return newVenue
    } catch (error) {
      console.error('Error adding venue:', error)
      return null
    }
  },

  updateVenue: async (id: string, updates: Partial<Venue>): Promise<boolean> => {
    try {
      const response = await fetch('/api/venues', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update venue')
      }
      
      window.dispatchEvent(new CustomEvent('cms-content-updated', { detail: { type: 'venues', id } }))
      return true
    } catch (error) {
      console.error('Error updating venue:', error)
      return false
    }
  },

  deleteVenue: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/venues', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete venue')
      }
      
      window.dispatchEvent(new CustomEvent('cms-content-updated', { detail: { type: 'venues' } }))
      return true
    } catch (error) {
      console.error('Error deleting venue:', error)
      return false
    }
  },

  // Office room operations
  getOfficeRooms: async (): Promise<OfficeRoom[]> => {
    try {
      const response = await fetch('/api/office-rooms', {
        cache: 'no-store'
      })
      if (!response.ok) {
        throw new Error('Failed to fetch office rooms')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching office rooms:', error)
      return []
    }
  },

  getOfficeRoomsByFloor: async (floor: 'ground' | 'second'): Promise<OfficeRoom[]> => {
    try {
      const rooms = await contentService.getOfficeRooms()
      return rooms.filter(r => r.floor === floor)
    } catch (error) {
      console.error('Error fetching office rooms by floor:', error)
      return []
    }
  },

  getOfficeRoomById: async (id: string): Promise<OfficeRoom | undefined> => {
    try {
      const rooms = await contentService.getOfficeRooms()
      return rooms.find(r => r.id === id)
    } catch (error) {
      console.error('Error fetching office room by ID:', error)
      return undefined
    }
  },

  addOfficeRoom: async (room: Omit<OfficeRoom, 'id' | 'createdAt' | 'updatedAt'>): Promise<OfficeRoom | null> => {
    try {
      const response = await fetch('/api/office-rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(room),
      })
      
      if (!response.ok) {
        throw new Error('Failed to add office room')
      }
      
      const newRoom = await response.json()
      window.dispatchEvent(new CustomEvent('cms-content-updated', { detail: { type: 'officeRooms' } }))
      return newRoom
    } catch (error) {
      console.error('Error adding office room:', error)
      return null
    }
  },

  updateOfficeRoom: async (id: string, updates: Partial<OfficeRoom>): Promise<boolean> => {
    try {
      const response = await fetch('/api/office-rooms', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update office room')
      }
      
      window.dispatchEvent(new CustomEvent('cms-content-updated', { detail: { type: 'officeRooms', id } }))
      return true
    } catch (error) {
      console.error('Error updating office room:', error)
      return false
    }
  },

  deleteOfficeRoom: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/office-rooms', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete office room')
      }
      
      window.dispatchEvent(new CustomEvent('cms-content-updated', { detail: { type: 'officeRooms' } }))
      return true
    } catch (error) {
      console.error('Error deleting office room:', error)
      return false
    }
  },

  // Get all data
  getAllContent: async (): Promise<ContentDatabase> => {
    try {
      const [homepage, venues, officeRooms] = await Promise.all([
        contentService.getHomepageContent(),
        contentService.getVenues(),
        contentService.getOfficeRooms()
      ])
      
      return {
        homepage,
        venues,
        officeRooms,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error fetching all content:', error)
      return {
        homepage: {
          heroTitle: 'Welcome to One Estela Place',
          heroDescription: 'The perfect venue for your special events and celebrations',
          heroImage: '/images/venue-interior.jpg',
          aboutTitle: 'About One Estela Place',
          aboutDescription: 'One Estela Place is a premier event venue.',
          ctaTitle: 'Ready to host your event?',
          ctaDescription: 'Contact us today to book your perfect event space.',
          ctaButtonText: 'Book Your Event',
          features: []
        },
        venues: [],
        officeRooms: [],
        lastUpdated: new Date().toISOString()
      }
    }
  },

  // Clear all data (for testing) - now calls API to reset
  resetContent: async (): Promise<boolean> => {
    try {
      // This would need a dedicated API endpoint to reset all content
      // For now, just dispatch the event
      window.dispatchEvent(new CustomEvent('cms-content-updated', { detail: { type: 'all' } }))
      return true
    } catch (error) {
      console.error('Error resetting content:', error)
      return false
    }
  }
}