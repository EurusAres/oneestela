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
import { useRouter } from "next/navigation"

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
  const router = useRouter()

  const s = stats?.summary
  const bookingDelta = pctChange(stats?.thisMonth.bookings ?? 0, stats?.lastMonth.bookings ?? 0)
  const salesDelta = pctChange(stats?.thisMonth.revenue ?? 0, stats?.lastMonth.revenue ?? 0)

  const handleStatusUpdate = async (id: string, status: "confirmed" | "cancelled") => {
    await updateBookingStatus(id, status)
    generateReports()
    toast({ title: `Booking ${status}`, description: `Booking #${id} has been ${status}.` })
  }

  const handleCardClick = (type: string) => {
    switch (type) {
      case 'confirmed':
      case 'pending':
      case 'cancelled':
        router.push(`/dashboard/bookings?status=${type}`)
        break
      case 'messages':
        router.push('/dashboard/chat')
        break
      default:
        break
    }
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
            <p className="text-sm md:text-base text-muted-foreground">Real-time overview of One Estela Place</p>
            {stats && (
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            )}
          </div>
          <Button onClick={generateReports} disabled={isLoading} variant="outline" className="w-full sm:w-auto">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{s?.totalBookings ?? 0}</div>
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
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">₱{(s?.totalRevenue ?? 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {salesDelta >= 0
                  ? <TrendingUp className="h-3 w-3 text-green-500" />
                  : <TrendingDown className="h-3 w-3 text-red-500" />}
                <span className={salesDelta >= 0 ? "text-green-600" : "text-red-600"}>
                  {salesDelta >= 0 ? "+" : ""}{salesDelta}%
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
              <div className="text-xl md:text-2xl font-bold">{stats?.thisMonth.bookings ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">₱{(stats?.thisMonth.revenue ?? 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status Summary Row */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card 
            className="border-green-200 bg-green-50 cursor-pointer hover:bg-green-100 transition-colors"
            onClick={() => handleCardClick('confirmed')}
          >
            <CardContent className="pt-4 flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-700">{s?.confirmed ?? 0}</div>
                <div className="text-sm text-green-600">Confirmed</div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className="border-yellow-200 bg-yellow-50 cursor-pointer hover:bg-yellow-100 transition-colors"
            onClick={() => handleCardClick('pending')}
          >
            <CardContent className="pt-4 flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-700">{s?.pending ?? 0}</div>
                <div className="text-sm text-yellow-600">Pending</div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className="border-red-200 bg-red-50 cursor-pointer hover:bg-red-100 transition-colors"
            onClick={() => handleCardClick('cancelled')}
          >
            <CardContent className="pt-4 flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-700">{s?.cancelled ?? 0}</div>
                <div className="text-sm text-red-600">Cancelled</div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className="border-blue-200 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => handleCardClick('messages')}
          >
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
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Calendar className="h-4 w-4" /> Monthly Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[250px] sm:h-[300px] md:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.monthlyBookings ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} width={40} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <TrendingUp className="h-4 w-4" /> Monthly Sales (₱)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[250px] sm:h-[300px] md:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.monthlyRevenue ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} width={40} />
                    <Tooltip formatter={(v) => [`₱${Number(v).toLocaleString()}`, "Sales"]} />
                    <Area type="monotone" dataKey="amount" stroke="#22c55e" fill="#22c55e" fillOpacity={0.4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings by Room */}
        {(stats?.bookingsByRoom?.length ?? 0) > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Bookings by Room</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[200px] sm:h-[250px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.bookingsByRoom ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="area" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 10 }} width={45} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <FileText className="h-5 w-5" /> Recent Customer Bookings
                </CardTitle>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Showing {stats?.recentBookings?.length ?? 0} most recent bookings from customers
                </p>
              </div>
              {stats?.recentBookings && stats.recentBookings.length > 0 && (
                <div className="text-right">
                  <div className="text-xl md:text-2xl font-bold">{stats.recentBookings.length}</div>
                  <div className="text-xs text-muted-foreground">Total shown</div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto w-full rounded-lg border">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Room</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Check-in Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Guests</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
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
                        <td className="px-4 py-3 text-muted-foreground font-mono text-sm">#{b.id}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm">{b.client_name || "—"}</div>
                          {b.client_email && (
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {b.client_email}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm">{b.room_name || "—"}</div>
                          {b.room_capacity && (
                            <div className="text-xs text-muted-foreground">Capacity: {b.room_capacity}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {b.check_in_date ? (
                            <div>
                              <div className="text-sm">{new Date(b.check_in_date).toLocaleDateString('en-US', { 
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
                        <td className="px-4 py-3 text-center text-sm">
                          {b.number_of_guests || "—"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-700 text-sm">
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
