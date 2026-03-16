"use client"

import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useReports } from "@/components/reports-context"
import { useBookings } from "@/components/booking-context"
import {
  Calendar, FileText, DollarSign, TrendingUp,
  TrendingDown, RefreshCw, CheckCircle, XCircle, Clock, MessageSquare,
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts"
import { useToast } from "@/hooks/use-toast"

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
  }
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${map[status] || "bg-gray-100 text-gray-800"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function DashboardPage() {
  const { stats, generateReports, isLoading } = useReports()
  const { updateBookingStatus } = useBookings()
  const { toast } = useToast()

  const s = stats?.summary
  const bookingDelta = pctChange(stats?.thisMonth.bookings ?? 0, stats?.lastMonth.bookings ?? 0)
  const revenueDelta = pctChange(stats?.thisMonth.revenue ?? 0, stats?.lastMonth.revenue ?? 0)

  const handleStatusUpdate = async (id: string, status: "confirmed" | "cancelled") => {
    await updateBookingStatus(id, status)
    generateReports()
    toast({ title: `Booking ${status}`, description: `Booking #${id} has been ${status}.` })
  }

  // Show loading state on initial load
  if (!stats && isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Real-time overview of One Estela Place</p>
            {stats && (
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            )}
          </div>
          <Button onClick={generateReports} disabled={isLoading} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s?.totalBookings ?? 0}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {bookingDelta >= 0
                  ? <TrendingUp className="h-3 w-3 text-green-500" />
                  : <TrendingDown className="h-3 w-3 text-red-500" />}
                <span className={bookingDelta >= 0 ? "text-green-600" : "text-red-600"}>
                  {bookingDelta >= 0 ? "+" : ""}{bookingDelta}%
                </span> vs last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{(s?.totalRevenue ?? 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {revenueDelta >= 0
                  ? <TrendingUp className="h-3 w-3 text-green-500" />
                  : <TrendingDown className="h-3 w-3 text-red-500" />}
                <span className={revenueDelta >= 0 ? "text-green-600" : "text-red-600"}>
                  {revenueDelta >= 0 ? "+" : ""}{revenueDelta}%
                </span> vs last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.thisMonth.bookings ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{(stats?.thisMonth.revenue ?? 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status Summary Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4 flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-700">{s?.confirmed ?? 0}</div>
                <div className="text-sm text-green-600">Confirmed</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-4 flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-700">{s?.pending ?? 0}</div>
                <div className="text-sm text-yellow-600">Pending</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4 flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-700">{s?.cancelled ?? 0}</div>
                <div className="text-sm text-red-600">Cancelled</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4 flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-700">{s?.unreadMessages ?? 0}</div>
                <div className="text-sm text-blue-600">Unread Messages</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Monthly Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={stats?.monthlyBookings ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.4} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Monthly Revenue (₱)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={stats?.monthlyRevenue ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [`₱${Number(v).toLocaleString()}`, "Revenue"]} />
                  <Area type="monotone" dataKey="amount" stroke="#22c55e" fill="#22c55e" fillOpacity={0.4} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bookings by Room */}
        {(stats?.bookingsByRoom?.length ?? 0) > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Bookings by Room</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats?.bookingsByRoom ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="area" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Recent Customer Bookings
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Showing {stats?.recentBookings?.length ?? 0} most recent bookings from customers
                </p>
              </div>
              {stats?.recentBookings && stats.recentBookings.length > 0 && (
                <div className="text-right">
                  <div className="text-2xl font-bold">{stats.recentBookings.length}</div>
                  <div className="text-xs text-muted-foreground">Total shown</div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium">ID</th>
                    <th className="px-4 py-3 text-left font-medium">Client</th>
                    <th className="px-4 py-3 text-left font-medium">Room</th>
                    <th className="px-4 py-3 text-left font-medium">Check-in Date</th>
                    <th className="px-4 py-3 text-left font-medium">Guests</th>
                    <th className="px-4 py-3 text-left font-medium">Amount</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.recentBookings ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                        No customer bookings found
                      </td>
                    </tr>
                  ) : (
                    (stats?.recentBookings ?? []).map((b: any) => (
                      <tr key={b.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground font-mono">#{b.id}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{b.client_name || "—"}</div>
                          {b.client_email && (
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {b.client_email}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{b.room_name || "—"}</div>
                          {b.room_capacity && (
                            <div className="text-xs text-muted-foreground">Capacity: {b.room_capacity}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {b.check_in_date ? (
                            <div>
                              <div>{new Date(b.check_in_date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(b.check_in_date).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {b.number_of_guests || "—"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-700">
                          {b.total_price ? `₱${Number(b.total_price).toLocaleString()}` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="px-4 py-3">
                          {b.status === "pending" && (
                            <div className="flex gap-1">
                              <Button
                                size="sm" 
                                variant="outline"
                                className="h-7 px-2 text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleStatusUpdate(b.id.toString(), "confirmed")}
                                title="Confirm booking"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm" 
                                variant="outline"
                                className="h-7 px-2 text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleStatusUpdate(b.id.toString(), "cancelled")}
                                title="Cancel booking"
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          {b.status !== "pending" && (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>


      </div>
    </MainLayout>
  )
}
