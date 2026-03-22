"use client"

import type React from "react"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function ContentPage() {
  const { toast } = useToast()
  const [heroTitle, setHeroTitle] = useState("Welcome to One Estela Place")
  const [heroSubtitle, setHeroSubtitle] = useState("The perfect venue for your special events and business operational needs")
  const [aboutText, setAboutText] = useState(
    "One Estela Place is a premier event venue located in the heart of the city. With stunning architecture and versatile spaces, we provide the perfect setting for weddings, corporate events, and special celebrations.",
  )

  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Content updated",
      description: "Your changes have been saved successfully",
    })
  }

  const handleSaveImages = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Images updated",
      description: "Your images have been updated successfully",
    })
  }

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Content Management</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Edit website content and images for the public site.</p>
        </div>

        <Tabs defaultValue="content">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="content" className="text-xs md:text-sm">Text Content</TabsTrigger>
            <TabsTrigger value="images" className="text-xs md:text-sm">Images</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-4 md:mt-6">
            <Card>
              <form onSubmit={handleSaveContent}>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Edit Website Text</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Make changes to your website content here.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hero-title" className="text-xs md:text-sm">Hero Title</Label>
                    <Input id="hero-title" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="text-xs md:text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hero-subtitle" className="text-xs md:text-sm">Hero Subtitle</Label>
                    <Input id="hero-subtitle" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} className="text-xs md:text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="about-text" className="text-xs md:text-sm">About Us Text</Label>
                    <Textarea
                      id="about-text"
                      rows={5}
                      value={aboutText}
                      onChange={(e) => setAboutText(e.target.value)}
                      className="text-xs md:text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-info" className="text-xs md:text-sm">Contact Information</Label>
                    <Textarea id="contact-info" rows={3} placeholder="Enter your contact information" className="text-xs md:text-sm" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full sm:w-auto text-xs md:text-sm">Save Changes</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="mt-4 md:mt-6">
            <Card>
              <form onSubmit={handleSaveImages}>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Manage Website Images</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Upload and manage images for your website.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="hero-image" className="text-xs md:text-sm">Hero Image</Label>
                    <div className="grid gap-3 md:gap-4">
                      <div className="h-32 md:h-40 rounded-md border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-xs md:text-sm text-gray-500">Current hero image</p>
                        </div>
                      </div>
                      <Input id="hero-image" type="file" className="text-xs md:text-sm" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs md:text-sm">Gallery Images</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="relative h-20 md:h-24 rounded-md border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center"
                        >
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Image {i}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Input id="gallery-images" type="file" multiple className="text-xs md:text-sm" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full sm:w-auto text-xs md:text-sm">Save Images</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
