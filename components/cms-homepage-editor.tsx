'use client'

import React from "react"

import { useState, useRef, useEffect } from 'react'
import { useCMS } from '@/components/cms-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, X, Edit2, ImageIcon } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

const updateHomepageContent = () => {}; // Declare the variable here or fix the import

export function CMSHomepageEditor() {
  const { homepage, updateHomepage } = useCMS()
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  if (!homepage) {
    return <div className="text-center py-8">Loading homepage content...</div>
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create FormData for file upload
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'hero-image')

    try {
      // Upload to server
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        const imageUrl = data.url
        
        // Update homepage with the new image URL
        if (field === 'heroImage') {
          updateHomepage({ heroImage: imageUrl })
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    }
  }

  const startEditing = (field: string) => {
    setEditingSection(field)
  }

  const saveEdit = async (field: keyof typeof homepage) => {
    const value = inputRef.current?.value || textareaRef.current?.value || ''
    
    setIsUpdating(true)
    try {
      if (field === 'heroTitle') await updateHomepage({ heroTitle: value })
      else if (field === 'heroDescription') await updateHomepage({ heroDescription: value })
      else if (field === 'ctaTitle') await updateHomepage({ ctaTitle: value })
      else if (field === 'ctaDescription') await updateHomepage({ ctaDescription: value })
      else if (field === 'ctaButtonText') await updateHomepage({ ctaButtonText: value })
      else if (field === 'aboutTitle') await updateHomepage({ aboutTitle: value })
      else if (field === 'aboutDescription') await updateHomepage({ aboutDescription: value })
      else if (field === 'contactLocation') await updateHomepage({ contactLocation: value })
      else if (field === 'contactPhone') await updateHomepage({ contactPhone: value })
      else if (field === 'contactEmail') await updateHomepage({ contactEmail: value })
      else if (field === 'contactHours') await updateHomepage({ contactHours: value })
      
      toast({
        title: "Success",
        description: "Homepage content updated successfully",
      })
      setEditingSection(null)
    } catch (error) {
      console.error('Error saving edit:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update homepage content",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const cancelEdit = () => {
    setEditingSection(null)
  }

  const SectionEditor = ({ title, field, image }: { title: string; field: keyof typeof homepage; image?: string }) => {
    const getCurrentValue = () => {
      if (field === 'heroTitle') return homepage.heroTitle
      if (field === 'heroDescription') return homepage.heroDescription
      if (field === 'ctaTitle') return homepage.ctaTitle
      if (field === 'ctaDescription') return homepage.ctaDescription
      if (field === 'ctaButtonText') return homepage.ctaButtonText
      if (field === 'aboutTitle') return homepage.aboutTitle
      if (field === 'aboutDescription') return homepage.aboutDescription
      if (field === 'contactLocation') return homepage.contactLocation
      if (field === 'contactPhone') return homepage.contactPhone
      if (field === 'contactEmail') return homepage.contactEmail
      if (field === 'contactHours') return homepage.contactHours
      return ''
    }

    const isEditing = editingSection === field
    const isTitle = field.includes('Title') || field.includes('title')

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm md:text-base flex items-center justify-between gap-2">
            <span className="truncate">{title}</span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                if (isEditing) {
                  cancelEdit()
                } else {
                  startEditing(String(field))
                }
              }}
              className="flex-shrink-0"
            >
              <Edit2 className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {image !== undefined && (
            <div className="space-y-2">
              {image ? (
                <div className="relative w-full h-32 md:h-40 bg-gray-100 rounded-lg overflow-hidden">
                  <img src={image} alt="Section image" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="relative w-full h-32 md:h-40 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <ImageIcon className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2" />
                    <p className="text-xs md:text-sm">No image uploaded</p>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <label className="flex-1">
                  <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent text-xs md:text-sm" asChild>
                    <span>
                      <Upload className="h-3 w-3 md:h-4 md:w-4" />
                      {image ? 'Replace Image' : 'Upload Image'}
                    </span>
                  </Button>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, String(field))} 
                    hidden 
                  />
                </label>
                {image && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (field === 'heroImage') updateHomepage({ heroImage: '' })
                    }}
                    className="w-full sm:w-auto text-xs md:text-sm"
                  >
                    <X className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {isEditing && image === undefined && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              {isTitle ? (
                <Input
                  ref={inputRef}
                  placeholder="Enter title"
                  defaultValue={getCurrentValue()}
                  className="text-xs md:text-sm"
                />
              ) : (
                <Textarea
                  ref={textareaRef}
                  placeholder="Enter description"
                  defaultValue={getCurrentValue()}
                  className="text-xs md:text-sm"
                />
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button size="sm" onClick={() => saveEdit(field)} disabled={isUpdating} className="w-full sm:w-auto text-xs md:text-sm">
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button size="sm" variant="outline" onClick={cancelEdit} disabled={isUpdating} className="w-full sm:w-auto text-xs md:text-sm">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="hero" className="w-full">
      <div className="w-full overflow-x-auto">
        <TabsList className="inline-flex w-full sm:w-auto">
          <TabsTrigger value="hero" className="text-xs sm:text-sm">Home Section</TabsTrigger>
          <TabsTrigger value="contact" className="text-xs sm:text-sm">Contact Info</TabsTrigger>
        </TabsList>
      </div>

      <div className="space-y-4 mt-6">
        <TabsContent value="hero">
          <div className="space-y-4">
            <SectionEditor title="Head Title" field="heroTitle" />
            <SectionEditor title="Title Description" field="heroDescription" />
            <SectionEditor title="Head Image" field="heroImage" image={homepage?.heroImage} />
          </div>
        </TabsContent>

        <TabsContent value="contact">
          <div className="space-y-4">
            <SectionEditor title="Location" field="contactLocation" />
            <SectionEditor title="Phone" field="contactPhone" />
            <SectionEditor title="Email" field="contactEmail" />
            <SectionEditor title="Business Hours" field="contactHours" />
          </div>
        </TabsContent>
      </div>

    </Tabs>
  )
}
