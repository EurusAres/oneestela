import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Users,
  Star,
  FileText,
  CheckCircle,
  XCircle,
  Edit,
  RotateCcw,
  Shield,
  Clock,
  Lock,
  Unlock,
  Settings,
  Download,
  BarChart3,
  TrendingUp,
  DollarSign,
} from "lucide-react"

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Owner Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the One Estela Place reservation system.</p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">145</div>
              <p className="text-xs text-muted-foreground">+24 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32</div>
              <p className="text-xs text-muted-foreground">+3 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8</div>
              <p className="text-xs text-muted-foreground">+0.2 from last month</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Booking Calendar - Venue Management
            </h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="bg-transparent">
                <Settings className="h-4 w-4 mr-2" />
                Calendar Rules
              </Button>
              <Button size="sm" variant="outline" className="bg-transparent">
                <Clock className="h-4 w-4 mr-2" />
                Time Slots
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Calendar View */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">June 2025 - Venue Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2 text-center text-sm">
                    {/* Calendar Header */}
                    <div className="font-medium text-muted-foreground">Sun</div>
                    <div className="font-medium text-muted-foreground">Mon</div>
                    <div className="font-medium text-muted-foreground">Tue</div>
                    <div className="font-medium text-muted-foreground">Wed</div>
                    <div className="font-medium text-muted-foreground">Thu</div>
                    <div className="font-medium text-muted-foreground">Fri</div>
                    <div className="font-medium text-muted-foreground">Sat</div>

                    {/* Calendar Days */}
                    <div className="p-2 text-muted-foreground">1</div>
                    <div className="p-2 text-muted-foreground">2</div>
                    <div className="p-2 text-muted-foreground">3</div>
                    <div className="p-2 text-muted-foreground">4</div>
                    <div className="p-2 text-muted-foreground">5</div>
                    <div className="p-2 text-muted-foreground">6</div>
                    <div className="p-2 text-muted-foreground">7</div>

                    <div className="p-2 text-muted-foreground">8</div>
                    <div className="p-2 text-muted-foreground">9</div>
                    <div className="p-2 text-muted-foreground">10</div>
                    <div className="p-2 text-muted-foreground">11</div>
                    <div className="p-2 text-muted-foreground">12</div>
                    <div className="p-2 text-muted-foreground">13</div>
                    <div className="p-2 text-muted-foreground">14</div>

                    {/* Reserved Date - Red */}
                    <div className="p-2 bg-red-100 text-red-800 rounded font-medium cursor-pointer hover:bg-red-200">
                      15
                    </div>
                    <div className="p-2 text-muted-foreground">16</div>
                    <div className="p-2 text-muted-foreground">17</div>
                    <div className="p-2 text-muted-foreground">18</div>
                    <div className="p-2 text-muted-foreground">19</div>
                    <div className="p-2 text-muted-foreground">20</div>
                    <div className="p-2 text-muted-foreground">21</div>

                    {/* Reserved Date - Red */}
                    <div className="p-2 bg-red-100 text-red-800 rounded font-medium cursor-pointer hover:bg-red-200">
                      22
                    </div>
                    <div className="p-2 text-muted-foreground">23</div>
                    <div className="p-2 text-muted-foreground">24</div>
                    <div className="p-2 text-muted-foreground">25</div>
                    <div className="p-2 text-muted-foreground">26</div>
                    <div className="p-2 text-muted-foreground">27</div>
                    <div className="p-2 text-muted-foreground">28</div>

                    <div className="p-2 text-muted-foreground">29</div>
                    {/* Reserved Date - Red */}
                    <div className="p-2 bg-red-100 text-red-800 rounded font-medium cursor-pointer hover:bg-red-200">
                      30
                    </div>
                  </div>

                  <div className="mt-4 flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                      <span>Reserved Dates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
                      <span>Available Dates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
                      <span>Blocked by Owner</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Calendar Controls */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Venue Availability Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Date Management</h4>
                    <div className="space-y-2">
                      <Button size="sm" variant="outline" className="w-full justify-start bg-transparent">
                        <Lock className="h-4 w-4 mr-2 text-red-600" />
                        Block Selected Dates
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start bg-transparent">
                        <Unlock className="h-4 w-4 mr-2 text-green-600" />
                        Open Selected Dates
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Schedule Management</h4>
                    <div className="space-y-2">
                      <Button size="sm" variant="outline" className="w-full justify-start bg-transparent">
                        <Calendar className="h-4 w-4 mr-2" />
                        Manage Event Schedules
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start bg-transparent">
                        <Clock className="h-4 w-4 mr-2" />
                        Adjust Time Slots
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Calendar Rules</h4>
                    <div className="space-y-2">
                      <Button size="sm" variant="outline" className="w-full justify-start bg-transparent">
                        <Settings className="h-4 w-4 mr-2" />
                        Booking Rules
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start bg-transparent">
                        <Shield className="h-4 w-4 mr-2" />
                        Override Restrictions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Reservations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <div>
                        <div className="font-medium">Jun 15 - Wedding</div>
                        <div className="text-muted-foreground">Maria Santos</div>
                      </div>
                      <div className="text-red-600 font-medium">Reserved</div>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <div>
                        <div className="font-medium">Jun 22 - Corporate</div>
                        <div className="text-muted-foreground">Tech Solutions</div>
                      </div>
                      <div className="text-red-600 font-medium">Reserved</div>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <div>
                        <div className="font-medium">Jun 30 - Birthday</div>
                        <div className="text-muted-foreground">John Miller</div>
                      </div>
                      <div className="text-red-600 font-medium">Reserved</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <h2 className="mt-10 text-xl font-semibold">Recent Bookings</h2>
        <div className="rounded-md border">
          <div className="p-4">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left font-medium">Event</th>
                  <th className="pb-3 text-left font-medium">Date</th>
                  <th className="pb-3 text-left font-medium">Client</th>
                  <th className="pb-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3">Wedding Reception</td>
                  <td className="py-3">Jun 15, 2025</td>
                  <td className="py-3">Maria Santos</td>
                  <td className="py-3">
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Confirmed</span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">Corporate Seminar</td>
                  <td className="py-3">Jun 22, 2025</td>
                  <td className="py-3">Tech Solutions Inc.</td>
                  <td className="py-3">
                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">Pending</span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">Birthday Party</td>
                  <td className="py-3">Jun 30, 2025</td>
                  <td className="py-3">John Miller</td>
                  <td className="py-3">
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Confirmed</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3">Charity Gala</td>
                  <td className="py-3">Jul 05, 2025</td>
                  <td className="py-3">Hope Foundation</td>
                  <td className="py-3">
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">New</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Booking Management - Owner Controls
            </h2>
            <div className="text-sm text-muted-foreground">Final Authority Override Available</div>
          </div>

          <div className="rounded-md border">
            <div className="p-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left font-medium">Event</th>
                    <th className="pb-3 text-left font-medium">Date</th>
                    <th className="pb-3 text-left font-medium">Client</th>
                    <th className="pb-3 text-left font-medium">Status</th>
                    <th className="pb-3 text-left font-medium">Manager Decision</th>
                    <th className="pb-3 text-left font-medium">Owner Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3">Wedding Reception</td>
                    <td className="py-3">Jun 15, 2025</td>
                    <td className="py-3">Maria Santos</td>
                    <td className="py-3">
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Confirmed</span>
                    </td>
                    <td className="py-3">
                      <span className="text-sm text-green-600">Approved</span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-7 px-2 bg-transparent">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 px-2 bg-transparent">
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">Corporate Seminar</td>
                    <td className="py-3">Jun 22, 2025</td>
                    <td className="py-3">Tech Solutions Inc.</td>
                    <td className="py-3">
                      <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                        Pending Review
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-sm text-gray-500">Awaiting Decision</span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-green-600 border-green-200 hover:bg-green-50 bg-transparent"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 px-2 bg-transparent">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">Birthday Party</td>
                    <td className="py-3">Jun 30, 2025</td>
                    <td className="py-3">John Miller</td>
                    <td className="py-3">
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Confirmed</span>
                    </td>
                    <td className="py-3">
                      <span className="text-sm text-green-600">Approved</span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-7 px-2 bg-transparent">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 px-2 bg-transparent">
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">Charity Gala</td>
                    <td className="py-3">Jul 05, 2025</td>
                    <td className="py-3">Hope Foundation</td>
                    <td className="py-3">
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">Manager Denied</span>
                    </td>
                    <td className="py-3">
                      <span className="text-sm text-red-600">Denied - Conflict</span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <Button size="sm" className="h-7 px-2 bg-blue-600 hover:bg-blue-700 text-white">
                          <Shield className="h-3 w-3 mr-1" />
                          Override
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 px-2 bg-transparent">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3">Product Launch</td>
                    <td className="py-3">Jul 12, 2025</td>
                    <td className="py-3">Innovation Corp</td>
                    <td className="py-3">
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">New Request</span>
                    </td>
                    <td className="py-3">
                      <span className="text-sm text-gray-500">Pending Review</span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-green-600 border-green-200 hover:bg-green-50 bg-transparent"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 px-2 bg-transparent">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Approve Request</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span>Deny Request</span>
            </div>
            <div className="flex items-center gap-2">
              <Edit className="h-4 w-4 text-gray-600" />
              <span>Reschedule/Edit</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span>Override Manager Decision</span>
            </div>
          </div>
        </div>

        {/* Reports section with comprehensive reporting functionality */}
        <div className="mt-10 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Reports
            </h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
              <Button size="sm" variant="outline" className="bg-transparent">
                <Settings className="h-4 w-4 mr-2" />
                Report Settings
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Financial Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Financial Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium">Monthly Revenue</div>
                      <div className="text-sm text-muted-foreground">June 2025</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">₱125,000</div>
                      <div className="text-xs text-green-600">+15%</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium">Pending Payments</div>
                      <div className="text-sm text-muted-foreground">Outstanding</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">₱35,000</div>
                      <div className="text-xs text-blue-600">5 clients</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <div>
                      <div className="font-medium">Total Deposits</div>
                      <div className="text-sm text-muted-foreground">This month</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-purple-600">₱45,000</div>
                      <div className="text-xs text-purple-600">12 bookings</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button size="sm" variant="outline" className="w-full justify-start bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Download Financial Report
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start bg-transparent">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Revenue Trends
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Booking Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Booking Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium">Total Bookings</div>
                      <div className="text-sm text-muted-foreground">This month</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">24</div>
                      <div className="text-xs text-blue-600">+8 from last month</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium">Confirmed Events</div>
                      <div className="text-sm text-muted-foreground">Approved</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">18</div>
                      <div className="text-xs text-green-600">75% rate</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <div className="font-medium">Pending Requests</div>
                      <div className="text-sm text-muted-foreground">Awaiting review</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-yellow-600">4</div>
                      <div className="text-xs text-yellow-600">Needs attention</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button size="sm" variant="outline" className="w-full justify-start bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Download Booking Report
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start bg-transparent">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Booking Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Customer Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Customer Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <div>
                      <div className="font-medium">Active Customers</div>
                      <div className="text-sm text-muted-foreground">This month</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-purple-600">32</div>
                      <div className="text-xs text-purple-600">+5 new clients</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <div>
                      <div className="font-medium">Repeat Customers</div>
                      <div className="text-sm text-muted-foreground">Return rate</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-orange-600">12</div>
                      <div className="text-xs text-orange-600">38% rate</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                    <div>
                      <div className="font-medium">Customer Satisfaction</div>
                      <div className="text-sm text-muted-foreground">Average rating</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-pink-600">4.8/5</div>
                      <div className="text-xs text-pink-600">28 reviews</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button size="sm" variant="outline" className="w-full justify-start bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Download Customer Report
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start bg-transparent">
                    <Star className="h-4 w-4 mr-2" />
                    Review Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Report Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left font-medium">Report Type</th>
                      <th className="pb-3 text-left font-medium">Period</th>
                      <th className="pb-3 text-left font-medium">Key Metrics</th>
                      <th className="pb-3 text-left font-medium">Status</th>
                      <th className="pb-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3">Financial Report</td>
                      <td className="py-3">June 2025</td>
                      <td className="py-3">₱125,000 Revenue, ₱35,000 Pending</td>
                      <td className="py-3">
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Complete</span>
                      </td>
                      <td className="py-3">
                        <Button size="sm" variant="outline" className="h-7 px-2 bg-transparent">
                          <Download className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3">Booking Report</td>
                      <td className="py-3">June 2025</td>
                      <td className="py-3">24 Bookings, 75% Confirmation Rate</td>
                      <td className="py-3">
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Complete</span>
                      </td>
                      <td className="py-3">
                        <Button size="sm" variant="outline" className="h-7 px-2 bg-transparent">
                          <Download className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3">Customer Report</td>
                      <td className="py-3">June 2025</td>
                      <td className="py-3">32 Active, 4.8/5 Rating</td>
                      <td className="py-3">
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Complete</span>
                      </td>
                      <td className="py-3">
                        <Button size="sm" variant="outline" className="h-7 px-2 bg-transparent">
                          <Download className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3">Quarterly Summary</td>
                      <td className="py-3">Q2 2025</td>
                      <td className="py-3">₱350,000 Total, 68 Events</td>
                      <td className="py-3">
                        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">Generating</span>
                      </td>
                      <td className="py-3">
                        <Button size="sm" variant="outline" className="h-7 px-2 bg-transparent" disabled>
                          <Clock className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
