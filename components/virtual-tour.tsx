"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Navigation,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Wifi,
  Monitor,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PanoramicViewer } from "@/components/panoramic-viewer"

interface VirtualTourProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface TourAngle {
  id: string
  name: string
  image: string
  thumbnail: string
}

interface TourArea {
  id: string
  name: string
  description: string
  capacity?: string
  amenities?: string[]
  angles: TourAngle[]
  category: "event" | "office"
  floor?: "ground" | "second"
}

export function VirtualTour({ open, onOpenChange }: VirtualTourProps) {
  const { toast } = useToast()
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0)
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showTourAreas, setShowTourAreas] = useState(true)
  const [activeTab, setActiveTab] = useState("event-venues")
  const [tourAreas, setTourAreas] = useState<TourArea[]>([])
  const [loading, setLoading] = useState(true)
  const tourRef = useRef<HTMLDivElement>(null)

  // Fetch venues and office spaces from CMS
  useEffect(() => {
    const fetchTourData = async () => {
      try {
        setLoading(true)
        
        // Fetch venues and office rooms in parallel
        const [venuesRes, roomsRes] = await Promise.all([
          fetch('/api/venues'),
          fetch('/api/office-rooms?includeAll=true')
        ])

        const venuesData = await venuesRes.json()
        const roomsData = await roomsRes.json()

        const areas: TourArea[] = []

        // Transform venues into tour areas
        if (venuesData.venues && Array.isArray(venuesData.venues)) {
          venuesData.venues.forEach((venue: any) => {
            const angles: TourAngle[] = []
            
            // Add regular image as first angle if available
            if (venue.image_url) {
              angles.push({
                id: `${venue.id}-main`,
                name: 'Main View',
                image: venue.image_url,
                thumbnail: venue.image_url,
              })
            }
            
            // Add 360° image as second angle if available
            if (venue.image_360_url) {
              angles.push({
                id: `${venue.id}-360`,
                name: '360° Panoramic View',
                image: venue.image_360_url,
                thumbnail: venue.image_360_url,
              })
            }

            // If no images, add a placeholder
            if (angles.length === 0) {
              angles.push({
                id: `${venue.id}-placeholder`,
                name: 'Main View',
                image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1400&h=700&fit=crop',
                thumbnail: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=150&h=90&fit=crop',
              })
            }

            areas.push({
              id: `venue-${venue.id}`,
              name: venue.name,
              description: venue.description || 'Experience this beautiful event venue',
              capacity: venue.capacity ? `Up to ${venue.capacity} guests` : undefined,
              amenities: venue.amenities ? JSON.parse(venue.amenities) : [],
              category: 'event',
              angles,
            })
          })
        }

        // Transform office rooms into tour areas
        if (roomsData.rooms && Array.isArray(roomsData.rooms)) {
          roomsData.rooms.forEach((room: any) => {
            const angles: TourAngle[] = []
            
            // Add regular image as first angle if available
            if (room.image_url) {
              angles.push({
                id: `${room.id}-main`,
                name: 'Main View',
                image: room.image_url,
                thumbnail: room.image_url,
              })
            }
            
            // Add 360° image as second angle if available
            if (room.image_360_url) {
              angles.push({
                id: `${room.id}-360`,
                name: '360° Panoramic View',
                image: room.image_360_url,
                thumbnail: room.image_360_url,
              })
            }

            // If no images, add a placeholder
            if (angles.length === 0) {
              angles.push({
                id: `${room.id}-placeholder`,
                name: 'Main View',
                image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&h=700&fit=crop',
                thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&h=90&fit=crop',
              })
            }

            // Determine floor based on room name or ID
            let floor: 'ground' | 'second' | undefined = undefined
            const roomNumber = parseInt(room.name.match(/\d+/)?.[0] || '0')
            if (roomNumber >= 1 && roomNumber <= 8) {
              floor = 'ground'
            } else if (roomNumber >= 9 && roomNumber <= 16) {
              floor = 'second'
            }

            areas.push({
              id: `room-${room.id}`,
              name: room.name,
              description: room.description || 'Modern office space with premium amenities',
              capacity: room.capacity ? `${room.capacity} workstations` : undefined,
              amenities: room.amenities ? JSON.parse(room.amenities) : [],
              category: 'office',
              floor,
              angles,
            })
          })
        }

        setTourAreas(areas)
      } catch (error) {
        console.error('Error fetching tour data:', error)
        toast({
          title: 'Error loading tour',
          description: 'Failed to load virtual tour data. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    if (open) {
      fetchTourData()
    }
  }, [open, toast])

  const currentArea = tourAreas[currentAreaIndex]
  const currentAngle = currentArea?.angles[currentAngleIndex]

  // Filter areas by category
  const eventVenues = tourAreas.filter((area) => area.category === "event")
  const groundFloorOffices = tourAreas.filter((area) => area.category === "office" && area.floor === "ground")
  const secondFloorOffices = tourAreas.filter((area) => area.category === "office" && area.floor === "second")
  const otherOffices = tourAreas.filter((area) => area.category === "office" && !area.floor)

  // Handle mouse/touch dragging for panoramic panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - dragStart.x
    const newPanX = panX + deltaX * 0.5
    setPanX(Math.max(Math.min(newPanX, 300), -300)) // Limit panning range
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - dragStart.x
    const newPanX = panX + deltaX * 0.5
    setPanX(Math.max(Math.min(newPanX, 300), -300))
    setDragStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.2, 0.5))
  }

  const resetView = () => {
    setPanX(0)
    setZoom(1)
  }

  const nextAngle = () => {
    if (!currentArea) return
    setCurrentAngleIndex((prev) => (prev + 1) % currentArea.angles.length)
    resetView()
  }

  const prevAngle = () => {
    if (!currentArea) return
    setCurrentAngleIndex((prev) => (prev - 1 + currentArea.angles.length) % currentArea.angles.length)
    resetView()
  }

  const switchArea = (areaIndex: number) => {
    setCurrentAreaIndex(areaIndex)
    setCurrentAngleIndex(0)
    resetView()
  }

  const switchAngle = (angleIndex: number) => {
    setCurrentAngleIndex(angleIndex)
    resetView()
  }

  const toggleTourAreas = () => {
    setShowTourAreas(!showTourAreas)
  }

  const closeTour = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <div className="relative h-[80vh] overflow-hidden rounded-lg">
          {/* Loading State */}
          {loading && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="text-center text-white">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
                <p className="text-lg font-medium">Loading Virtual Tour...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && tourAreas.length === 0 && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center p-8">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Tour Areas Available</h3>
                <p className="text-gray-600 mb-4">
                  Virtual tour content is being prepared. Please check back soon!
                </p>
                <Button onClick={() => onOpenChange(false)}>Close</Button>
              </div>
            </div>
          )}

          {/* Tour Content - Only show if we have data */}
          {!loading && tourAreas.length > 0 && currentArea && currentAngle && (
            <>
              {/* Tour Header */}
              <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent p-4">
                <DialogHeader className="text-white">
                  <DialogTitle className="flex items-center justify-between">
                    <span>Virtual Tour - {currentArea.name}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        {currentAngle.name}
                      </Badge>
                      {currentArea.capacity && (
                        <Badge variant="secondary" className="bg-blue-600/80 text-white">
                          <Users className="w-3 h-3 mr-1" />
                          {currentArea.capacity}
                        </Badge>
                      )}
                    </div>
                  </DialogTitle>
                  <DialogDescription className="text-white/90">{currentArea.description}</DialogDescription>
                </DialogHeader>
              </div>

              {/* Close Tour Button - Transparent */}
              <div className="absolute top-4 right-4 z-30">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={closeTour}
                  className="bg-black/30 hover:bg-black/50 text-white rounded-full h-8 w-8 p-0"
                  title="Close Virtual Tour"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Panoramic View */}
              {currentAngle.name.includes('360°') ? (
                <PanoramicViewer 
                  imageUrl={currentAngle.image}
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <div
                  ref={tourRef}
                  className="relative w-full h-full cursor-grab active:cursor-grabbing select-none"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{
                    backgroundImage: `url(${currentAngle.image})`,
                    backgroundSize: `${150 * zoom}% ${100 * zoom}%`,
                    backgroundPosition: `${panX}px center`,
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  {/* Navigation Instructions */}
                  <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                    <div className="flex items-center space-x-2">
                      <Navigation className="w-4 h-4" />
                      <span>Drag to pan • Use controls to zoom • Switch views using thumbnails</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tour Areas Toggle Button */}
              <div className="absolute top-20 right-4 z-20">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={toggleTourAreas}
                  className="bg-white/90 hover:bg-white mb-2"
                  title={showTourAreas ? "Hide Tour Areas" : "Show Tour Areas"}
                >
                  {showTourAreas ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </Button>
              </div>

              {/* Enhanced Tour Areas Panel with Tab Switcher */}
              {showTourAreas && (
                <div className="absolute top-32 right-4 z-20 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border max-w-sm w-80">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="p-4 pb-0">
                      <h4 className="font-semibold text-sm mb-3 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Tour Areas
                      </h4>
                      <TabsList className="grid w-full grid-cols-2 mb-3">
                        <TabsTrigger value="event-venues" className="text-xs">
                          Event Venues
                        </TabsTrigger>
                        <TabsTrigger value="office-spaces" className="text-xs">
                          Office Spaces
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ maxHeight: 'calc(90vh - 300px)' }}>
                      <TabsContent value="event-venues" className="mt-0 px-4 pb-4">
                        <div className="space-y-1">
                          {eventVenues.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">No event venues available</p>
                          ) : (
                            eventVenues.map((area) => {
                              const globalIndex = tourAreas.findIndex((a) => a.id === area.id)
                              return (
                                <button
                                  key={area.id}
                                  onClick={() => switchArea(globalIndex)}
                                  className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-all border ${
                                    globalIndex === currentAreaIndex
                                      ? "bg-blue-600 text-white font-medium border-blue-600 shadow-md"
                                      : "hover:bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-300"
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="font-medium">{area.name}</div>
                                      {area.capacity && (
                                        <div
                                          className={`text-xs mt-1 flex items-center ${
                                            globalIndex === currentAreaIndex ? "text-blue-100" : "text-gray-500"
                                          }`}
                                        >
                                          <Users className="w-3 h-3 mr-1" />
                                          {area.capacity}
                                        </div>
                                      )}
                                    </div>
                                    {globalIndex === currentAreaIndex && (
                                      <div className="w-2 h-2 bg-white rounded-full animate-pulse ml-2 mt-1" />
                                    )}
                                  </div>
                                </button>
                              )
                            })
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="office-spaces" className="mt-0 px-4 pb-4">
                        <div className="space-y-4">
                          {/* Ground Floor Section */}
                          {groundFloorOffices.length > 0 && (
                            <div>
                              <h5 className="font-medium text-xs text-gray-600 mb-2 flex items-center">
                                <Monitor className="w-3 h-3 mr-1" />
                                Ground Floor (Rooms 1-8)
                              </h5>
                              <div className="space-y-1">
                                {groundFloorOffices.map((area) => {
                                  const globalIndex = tourAreas.findIndex((a) => a.id === area.id)
                                  return (
                                    <button
                                      key={area.id}
                                      onClick={() => switchArea(globalIndex)}
                                      className={`w-full text-left px-3 py-2 rounded text-xs transition-all border ${
                                        globalIndex === currentAreaIndex
                                          ? "bg-blue-600 text-white font-medium border-blue-600"
                                          : "hover:bg-gray-100 text-gray-700 border-gray-200"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <div className="font-medium">{area.name}</div>
                                          {area.capacity && (
                                            <div
                                              className={`text-xs mt-0.5 flex items-center ${
                                                globalIndex === currentAreaIndex ? "text-blue-100" : "text-gray-500"
                                              }`}
                                            >
                                              <Wifi className="w-2 h-2 mr-1" />
                                              {area.capacity}
                                            </div>
                                          )}
                                        </div>
                                        {globalIndex === currentAreaIndex && (
                                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                        )}
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {/* Second Floor Section */}
                          {secondFloorOffices.length > 0 && (
                            <div>
                              <h5 className="font-medium text-xs text-gray-600 mb-2 flex items-center">
                                <Monitor className="w-3 h-3 mr-1" />
                                Second Floor (Rooms 9-16)
                              </h5>
                              <div className="space-y-1">
                                {secondFloorOffices.map((area) => {
                                  const globalIndex = tourAreas.findIndex((a) => a.id === area.id)
                                  return (
                                    <button
                                      key={area.id}
                                      onClick={() => switchArea(globalIndex)}
                                      className={`w-full text-left px-3 py-2 rounded text-xs transition-all border ${
                                        globalIndex === currentAreaIndex
                                          ? "bg-blue-600 text-white font-medium border-blue-600"
                                          : "hover:bg-gray-100 text-gray-700 border-gray-200"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <div className="font-medium">{area.name}</div>
                                          {area.capacity && (
                                            <div
                                              className={`text-xs mt-0.5 flex items-center ${
                                                globalIndex === currentAreaIndex ? "text-blue-100" : "text-gray-500"
                                              }`}
                                            >
                                              <Wifi className="w-2 h-2 mr-1" />
                                              {area.capacity}
                                            </div>
                                          )}
                                        </div>
                                        {globalIndex === currentAreaIndex && (
                                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                        )}
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {/* Other Office Spaces */}
                          {otherOffices.length > 0 && (
                            <div>
                              <h5 className="font-medium text-xs text-gray-600 mb-2 flex items-center">
                                <Monitor className="w-3 h-3 mr-1" />
                                Office Spaces
                              </h5>
                              <div className="space-y-1">
                                {otherOffices.map((area) => {
                                  const globalIndex = tourAreas.findIndex((a) => a.id === area.id)
                                  return (
                                    <button
                                      key={area.id}
                                      onClick={() => switchArea(globalIndex)}
                                      className={`w-full text-left px-3 py-2 rounded text-xs transition-all border ${
                                        globalIndex === currentAreaIndex
                                          ? "bg-blue-600 text-white font-medium border-blue-600"
                                          : "hover:bg-gray-100 text-gray-700 border-gray-200"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <div className="font-medium">{area.name}</div>
                                          {area.capacity && (
                                            <div
                                              className={`text-xs mt-0.5 flex items-center ${
                                                globalIndex === currentAreaIndex ? "text-blue-100" : "text-gray-500"
                                              }`}
                                            >
                                              <Wifi className="w-2 h-2 mr-1" />
                                              {area.capacity}
                                            </div>
                                          )}
                                        </div>
                                        {globalIndex === currentAreaIndex && (
                                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                        )}
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {groundFloorOffices.length === 0 && secondFloorOffices.length === 0 && otherOffices.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">No office spaces available</p>
                          )}
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              )}

              {/* Angle Thumbnails - Outside the toggle panel */}
              {currentArea.angles.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center">
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2 flex space-x-2 overflow-x-auto">
                    {currentArea.angles.map((angle, angleIndex) => (
                      <button
                        key={angle.id}
                        onClick={() => switchAngle(angleIndex)}
                        className={`relative flex-shrink-0 rounded-md overflow-hidden transition-all ${
                          angleIndex === currentAngleIndex
                            ? "ring-2 ring-blue-400 scale-110"
                            : "opacity-70 hover:opacity-100 hover:scale-105"
                        }`}
                        title={angle.name}
                      >
                        <img
                          src={angle.thumbnail || "/placeholder.svg"}
                          alt={angle.name}
                          className="w-16 h-10 object-cover"
                        />
                        {angleIndex === currentAngleIndex && (
                          <div className="absolute top-1 right-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Enhanced Tour Info Footer */}
        {!loading && tourAreas.length > 0 && currentArea && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">
                  Experience our venue with panoramic views from different angles
                </p>
                {currentArea.amenities && currentArea.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {currentArea.amenities.slice(0, 4).map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {currentArea.amenities.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{currentArea.amenities.length - 4} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <div className="flex space-x-2 ml-4">
                <Button variant="outline" onClick={closeTour}>
                  Close Tour
                </Button>
                <Button
                  onClick={() => {
                    closeTour()
                    toast({
                      title: "Ready to book?",
                      description: `Sign in to reserve ${currentArea.name} for your event!`,
                    })
                  }}
                >
                  Sign In to Book
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
