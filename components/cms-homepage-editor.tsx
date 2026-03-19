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

const updateHomepageContent = () => {}; // Declare the variable here or fix the import

export function CMSHomepageEditor() {
  const { homepage, updateHomepage } = useCMS()
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
        } else if (field === 'aboutImage') {
          updateHomepage({ aboutImage: imageUrl })
        } else if (field === 'ctaImage') {
          updateHomepage({ ctaImage: imageUrl })
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    }
  }

  const startEditing = (field: string) => {
    setEditingSection(field)
  }

  const saveEdit = (field: keyof typeof homepage) => {
    const value = inputRef.current?.value || textareaRef.current?.value || ''
    
    if (field === 'heroTitle') updateHomepage({ heroTitle: value })
    else if (field === 'heroDescription') updateHomepage({ heroDescription: value })
    else if (field === 'ctaTitle') updateHomepage({ ctaTitle: value })
    else if (field === 'ctaDescription') updateHomepage({ ctaDescription: value })
    else if (field === 'ctaButtonText') updateHomepage({ ctaButtonText: value })
    else if (field === 'aboutTitle') updateHomepage({ aboutTitle: value })
    else if (field === 'aboutDescription') updateHomepage({ aboutDescription: value })
    else if (field === 'contactLocation') updateHomepage({ contactLocation: value })
    else if (field === 'contactPhone') updateHomepage({ contactPhone: value })
    else if (field === 'contactEmail') updateHomepage({ contactEmail: value })
    else if (field === 'contactHours') updateHomepage({ contactHours: value })
    
    setEditingSection(null)
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
          <CardTitle className="text-base flex items-center justify-between">
            <span>{title}</span>
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
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {image !== undefined && (
            <div className="space-y-2">
              {image ? (
                <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                  <img src={image} alt="Section image" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">No image uploaded</p>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <label className="flex-1">
                  <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent" asChild>
                    <span>
                      <Upload className="h-4 w-4" />
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
                      else if (field === 'aboutImage') updateHomepage({ aboutImage: '' })
                      else if (field === 'ctaImage') updateHomepage({ ctaImage: '' })
                    }}
                  >
                    <X className="h-4 w-4" />
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
                />
              ) : (
                <Textarea
                  ref={textareaRef}
                  placeholder="Enter description"
                  defaultValue={getCurrentValue()}
                />
              )}
              <div className="flex gap-2">
                <Button size="sm" onClick={() => saveEdit(field)}>
                  Save Changes
                </Button>
                <Button size="sm" variant="outline" onClick={cancelEdit}>
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
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="hero">Hero Section</TabsTrigger>
        <TabsTrigger value="about">About Section</TabsTrigger>
        <TabsTrigger value="cta">CTA Section</TabsTrigger>
        <TabsTrigger value="contact">Contact Info</TabsTrigger>
      </TabsList>

      <div className="space-y-4 mt-6">
        <TabsContent value="hero">
          <div className="space-y-4">
            <SectionEditor title="Head Title" field="heroTitle" />
            <SectionEditor title="Title Description" field="heroDescription" />
            <SectionEditor title="Head Image" field="heroImage" image={homepage?.heroImage} />
          </div>
        </TabsContent>

        <TabsContent value="about">
          <div className="space-y-4">
            <SectionEditor title="About Title" field="aboutTitle" />
            <SectionEditor title="About Description" field="aboutDescription" />
          </div>
        </TabsContent>

        <TabsContent value="cta">
          <div className="space-y-4">
            <SectionEditor title="CTA Title" field="ctaTitle" />
            <SectionEditor title="CTA Description" field="ctaDescription" />
            <SectionEditor title="CTA Button Text" field="ctaButtonText" />
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

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Features ({(homepage?.features || []).length})</h4>
            <div className="space-y-2">
              {(homepage?.features || []).map((feature) => (
                <div key={feature.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-sm">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
            {(!homepage?.features || homepage.features.length === 0) && (
              <p className="text-sm text-muted-foreground">No features added yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Tabs>
  )
}
