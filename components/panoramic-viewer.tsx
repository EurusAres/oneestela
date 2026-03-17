'use client'

import { useEffect, useRef, useState } from 'react'

interface PanoramicViewerProps {
  imageUrl: string
  className?: string
}

export function PanoramicViewer({ imageUrl, className = '' }: PanoramicViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [autoRotate, setAutoRotate] = useState(true)

  useEffect(() => {
    let animationId: number

    const animate = () => {
      if (autoRotate && containerRef.current && !isDragging) {
        const container = containerRef.current
        const maxScroll = container.scrollWidth - container.clientWidth
        
        // Auto-rotate by incrementing scroll position
        container.scrollLeft += 0.5
        
        // Loop back to start when reaching the end
        if (container.scrollLeft >= maxScroll) {
          container.scrollLeft = 0
        }
      }
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [autoRotate, isDragging])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setAutoRotate(false)
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0))
    setScrollLeft(containerRef.current?.scrollLeft || 0)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    e.preventDefault()
    
    const x = e.pageX - (containerRef.current.offsetLeft || 0)
    const walk = (x - startX) * 2 // Scroll speed multiplier
    containerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    // Resume auto-rotate after 3 seconds of inactivity
    setTimeout(() => setAutoRotate(true), 3000)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
    setTimeout(() => setAutoRotate(true), 3000)
  }

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setAutoRotate(false)
    const touch = e.touches[0]
    setStartX(touch.pageX - (containerRef.current?.offsetLeft || 0))
    setScrollLeft(containerRef.current?.scrollLeft || 0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return
    
    const touch = e.touches[0]
    const x = touch.pageX - (containerRef.current.offsetLeft || 0)
    const walk = (x - startX) * 2
    containerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    setTimeout(() => setAutoRotate(true), 3000)
  }

  return (
    <div className={`relative overflow-hidden w-full h-full bg-black ${className}`}>
      <div
        ref={containerRef}
        className="flex overflow-x-hidden cursor-grab active:cursor-grabbing select-none h-full items-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* Duplicate the image multiple times for seamless looping */}
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="flex-shrink-0 h-full flex items-center"
          >
            <img
              src={imageUrl}
              alt="360° Panoramic View"
              className="h-full w-auto block"
              draggable={false}
            />
          </div>
        ))}
      </div>
      
      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded text-sm">
        Drag to explore • Auto-rotating
      </div>
      
      {/* Hide scrollbar */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}