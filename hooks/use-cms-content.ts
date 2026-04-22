'use client'

import { useEffect, useState, useCallback } from 'react'
import { contentService, HomepageContent, Venue, OfficeRoom, ContentDatabase } from '@/lib/content-service'

export function useHomepageContent() {
  const [content, setContent] = useState<HomepageContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchContent = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/homepage')
      if (response.ok) {
        const data = await response.json()
        setContent(data)
      } else {
        console.error('Failed to fetch homepage content')
      }
    } catch (error) {
      console.error('Error loading homepage content:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  const updateContent = useCallback(async (updates: Partial<HomepageContent>) => {
    try {
      console.log('Updating homepage content with:', updates)
      const response = await fetch('/api/homepage/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      console.log('Update response status:', response.status)
      const responseData = await response.json()
      console.log('Update response data:', responseData)
      
      if (response.ok) {
        // Refresh content after update
        await fetchContent()
        console.log('Homepage content updated successfully')
      } else {
        console.error('Failed to update homepage content:', responseData)
        throw new Error(responseData.error || responseData.details || 'Update failed')
      }
    } catch (error) {
      console.error('Error updating homepage content:', error)
      throw error
    }
      console.error('Error updating homepage content:', error)
    }
  }, [fetchContent])

  return { content, isLoading, updateContent }
}

export function useVenues() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    try {
      const data = contentService.getVenues()
      setVenues(data)
    } catch (error) {
      console.error('Error loading venues:', error)
    } finally {
      setIsLoading(false)
    }

    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail?.type === 'venues' || customEvent.detail?.type === 'all') {
        try {
          const data = contentService.getVenues()
          setVenues(data)
        } catch (error) {
          console.error('Error updating venues:', error)
        }
      }
    }

    window.addEventListener('cms-content-updated', handleUpdate)
    return () => window.removeEventListener('cms-content-updated', handleUpdate)
  }, [])

  return { venues, isLoading }
}

export function useOfficeRooms() {
  const [rooms, setRooms] = useState<OfficeRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    try {
      const data = contentService.getOfficeRooms()
      setRooms(data)
    } catch (error) {
      console.error('Error loading office rooms:', error)
    } finally {
      setIsLoading(false)
    }

    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail?.type === 'officeRooms' || customEvent.detail?.type === 'all') {
        try {
          const data = contentService.getOfficeRooms()
          setRooms(data)
        } catch (error) {
          console.error('Error updating office rooms:', error)
        }
      }
    }

    window.addEventListener('cms-content-updated', handleUpdate)
    return () => window.removeEventListener('cms-content-updated', handleUpdate)
  }, [])

  return { rooms, isLoading }
}

export function useOfficeRoomsByFloor(floor: 'ground' | 'second') {
  const [rooms, setRooms] = useState<OfficeRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    try {
      const data = contentService.getOfficeRoomsByFloor(floor)
      setRooms(data)
    } catch (error) {
      console.error('Error loading office rooms:', error)
    } finally {
      setIsLoading(false)
    }

    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail?.type === 'officeRooms' || customEvent.detail?.type === 'all') {
        try {
          const data = contentService.getOfficeRoomsByFloor(floor)
          setRooms(data)
        } catch (error) {
          console.error('Error updating office rooms:', error)
        }
      }
    }

    window.addEventListener('cms-content-updated', handleUpdate)
    return () => window.removeEventListener('cms-content-updated', handleUpdate)
  }, [floor])

  return { rooms, isLoading }
}

export function useAllContent() {
  const [content, setContent] = useState<ContentDatabase | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    try {
      const data = contentService.getAllContent()
      setContent(data)
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setIsLoading(false)
    }

    const handleUpdate = () => {
      try {
        const data = contentService.getAllContent()
        setContent(data)
      } catch (error) {
        console.error('Error updating content:', error)
      }
    }

    window.addEventListener('cms-content-updated', handleUpdate)
    return () => window.removeEventListener('cms-content-updated', handleUpdate)
  }, [])

  return { content, isLoading }
}
