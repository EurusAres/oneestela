'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCMS } from '@/components/cms-context'
import { CMSHomepageEditor } from '@/components/cms-homepage-editor'
import { CMSVenueEditor } from '@/components/cms-venue-editor'
import { CMSOfficeRoomEditor } from '@/components/cms-office-room-editor'
import { ImageIcon, Home, Building2 } from 'lucide-react'

export default function CMSPage() {
  const { cmsData } = useCMS()
  const [activeTab, setActiveTab] = useState('homepage')

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Content Management System</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage all website content, images, and descriptions</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="w-full overflow-x-auto">
            <TabsList className="inline-flex w-full sm:w-auto grid-cols-3">
              <TabsTrigger value="homepage" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Homepage</span>
                <span className="sm:hidden">Home</span>
              </TabsTrigger>
              <TabsTrigger value="venues" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                Venues
              </TabsTrigger>
              <TabsTrigger value="offices" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Office Spaces</span>
                <span className="sm:hidden">Offices</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="homepage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Homepage Content</CardTitle>
                <CardDescription className="text-xs md:text-sm">Edit all homepage sections including hero, about, and CTA sections</CardDescription>
              </CardHeader>
              <CardContent>
                <CMSHomepageEditor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="venues" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Event Venues</CardTitle>
                <CardDescription className="text-xs md:text-sm">Manage venue information, descriptions, images, and capacity details</CardDescription>
              </CardHeader>
              <CardContent>
                <CMSVenueEditor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Office Spaces</CardTitle>
                <CardDescription className="text-xs md:text-sm">Manage ground floor and second floor office room content and images</CardDescription>
              </CardHeader>
              <CardContent>
                <CMSOfficeRoomEditor />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
