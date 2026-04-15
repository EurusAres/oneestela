"use client"

import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useReports } from "@/components/reports-context"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from "recharts"
import { Calendar, DollarSign, Users, MessageSquare, RefreshCw, Download, Star, AlertCircle, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"]

export default function ReportsPage() {
  const { stats, bookingReport, salesReport, inquiryReport, customerReport, generateReports, isLoading } = useReports()
  const { toast } = useToast()

  const handleExport = (type: string) => {
    // Format data as readable text
    let textContent = `ONE ESTELA PLACE - ${type.toUpperCase()} REPORT\n`
    textContent += `Generated: ${new Date().toLocaleString()}\n`
    textContent += `${"=".repeat(60)}\n\n`

    if (stats) {
      textContent += `SUMMARY STATISTICS\n`
      textContent += `${"-".repeat(60)}\n`
      textContent += `Total Bookings: ${stats.summary?.totalBookings ?? 0}\n`
      textContent += `  - Confirmed: ${stats.summary?.confirmed ?? 0}\n`
      textContent += `  - Pending: ${stats.summary?.pending ?? 0}\n`
      textContent += `  - Cancelled: ${stats.summary?.cancelled ?? 0}\n`
      textContent += `  - Completed: ${stats.summary?.completed ?? 0}\n\n`
      
      textContent += `Total Sales: ₱${(stats.summary?.totalRevenue ?? 0).toLocaleString()}\n`
      textContent += `Total Customers: ${stats.summary?.totalUsers ?? 0}\n`
      textContent += `Average Rating: ${stats.summary?.avgRating ?? "N/A"} ★\n`
      textContent += `Total Reviews: ${stats.summary?.totalReviews ?? 0}\n\n`

      textContent += `THIS MONTH\n`
      textContent += `${"-".repeat(60)}\n`
      textContent += `Bookings: ${stats.thisMonth?.bookings ?? 0}\n`
      textContent += `Sales: ₱${(stats.thisMonth?.revenue ?? 0).toLocaleString()}\n\n`

      textContent += `LAST MONTH\n`
      textContent += `${"-".repeat(60)}\n`
      textContent += `Bookings: ${stats.lastMonth?.bookings ?? 0}\n`
      textContent += `Sales: ₱${(stats.lastMonth?.revenue ?? 0).toLocaleString()}\n\n`

      if (stats.monthlyBookings && stats.monthlyBookings.length > 0) {
        textContent += `MONTHLY BOOKINGS\n`
        textContent += `${"-".repeat(60)}\n`
        stats.monthlyBookings.forEach((mb: any) => {
          textContent += `${mb.month}: ${mb.count} bookings\n`
        })
        textContent += `\n`
      }

      if (stats.monthlyRevenue && stats.monthlyRevenue.length > 0) {
        textContent += `MONTHLY SALES\n`
        textContent += `${"-".repeat(60)}\n`
        stats.monthlyRevenue.forEach((mr: any) => {
          textContent += `${mr.month}: ₱${Number(mr.amount).toLocaleString()}\n`
        })
        textContent += `\n`
      }
    }

    textContent += `\nEnd of Report\n`
    textContent += `${"=".repeat(60)}\n`

    const blob = new Blob([textContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${type}-report-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({ title: "Report Exported", description: `${type} report downloaded as TXT file.` })
  }

  const s = stats?.summary

  // Monthly summary: combine bookings + revenue by month
  const monthlySummary = (stats?.monthlyBookings ?? []).map((mb) => {
    const rev = (stats?.monthlyRevenue ?? []).find(r => r.month === mb.month)
    return { month: mb.month, bookings: mb.count, revenue: rev?.amount ?? 0 }
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Business Reports</h1>
            <p className="text-sm md:text-base text-muted-foreground">Live data from your venue database</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={generateReports} disabled={isLoading} className="w-full sm:w-auto">
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => handleExport("comprehensive")} className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Overview */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{s?.totalBookings ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{s?.confirmed ?? 0} confirmed</span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">₱{(s?.totalRevenue ?? 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{s?.totalUsers ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                Avg rating: <span className="text-yellow-600">{s?.avgRating ?? "—"} ★</span>
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="monthly" className="space-y-4">
          <div className="w-full overflow-x-auto">
            <TabsList className="inline-flex w-full sm:w-auto grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="monthly" className="text-xs sm:text-sm">Monthly Summary</TabsTrigger>
              <TabsTrigger value="bookings" className="text-xs sm:text-sm">Booking Report</TabsTrigger>
              <TabsTrigger value="revenue" className="text-xs sm:text-sm">Sales Report</TabsTrigger>
              <TabsTrigger value="customers" className="text-xs sm:text-sm">Customer Report</TabsTrigger>
            </TabsList>
          </div>

          {/* Monthly Summary */}
          <TabsContent value="monthly" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                  Monthly Bookings & Sales
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">Combined view of bookings and sales per month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto">
                  <ResponsiveContainer width="100%" height={320} minWidth={300}>
                    <BarChart data={monthlySummary}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v, name) => name === "revenue" ? [`₱${Number(v).toLocaleString()}`, "Sales"] : [v, "Bookings"]} />
                      <Bar yAxisId="left" dataKey="bookings" fill="#6366f1" radius={[4,4,0,0]} name="bookings" />
                      <Bar yAxisId="right" dataKey="revenue" fill="#22c55e" radius={[4,4,0,0]} name="revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="w-full overflow-x-auto rounded-md border">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium">Month</th>
                    <th className="px-4 py-3 text-left font-medium">Bookings</th>
                    <th className="px-4 py-3 text-left font-medium">Sales</th>
                    <th className="px-4 py-3 text-left font-medium">Avg per Booking</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlySummary.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No data yet</td></tr>
                  ) : monthlySummary.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{row.month}</td>
                      <td className="px-4 py-3">{row.bookings}</td>
                      <td className="px-4 py-3 text-green-600 font-medium">₱{Number(row.revenue).toLocaleString()}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.bookings > 0 ? `₱${Math.round(row.revenue / row.bookings).toLocaleString()}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-indigo-50 border-indigo-200">
                <CardContent className="pt-4">
                  <div className="text-xs md:text-sm text-indigo-600 font-medium">This Month Bookings</div>
                  <div className="text-2xl md:text-3xl font-bold text-indigo-700">{stats?.thisMonth.bookings ?? 0}</div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <div className="text-xs md:text-sm text-green-600 font-medium">This Month Sales</div>
                  <div className="text-2xl md:text-3xl font-bold text-green-700">₱{(stats?.thisMonth.revenue ?? 0).toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-yellow-50 border-yellow-200 sm:col-span-2 lg:col-span-1">
                <CardContent className="pt-4">
                  <div className="text-xs md:text-sm text-yellow-600 font-medium">Pending Bookings</div>
                  <div className="text-2xl md:text-3xl font-bold text-yellow-700">{s?.pending ?? 0}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Booking Report */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Booking Trends</CardTitle>
                  <CardDescription>Booking volume over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={bookingReport.monthlyBookings}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bookings by Room</CardTitle>
                  <CardDescription>Most booked spaces</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={bookingReport.mostBookedAreas}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="area" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6366f1" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader><CardTitle>Status Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: "Confirmed", value: s?.confirmed ?? 0, color: "bg-green-100 text-green-800" },
                      { label: "Pending", value: s?.pending ?? 0, color: "bg-yellow-100 text-yellow-800" },
                      { label: "Cancelled", value: s?.cancelled ?? 0, color: "bg-red-100 text-red-800" },
                      { label: "Completed", value: s?.completed ?? 0, color: "bg-blue-100 text-blue-800" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-sm">{item.label}</span>
                        <Badge className={item.color}>{item.value}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Occupancy by Room</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bookingReport.occupancyRate.map((area: any, i: number) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{area.area}</span>
                          <span className="text-muted-foreground">{area.rate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${area.rate}%` }} />
                        </div>
                      </div>
                    ))}
                    {bookingReport.occupancyRate.length === 0 && (
                      <p className="text-sm text-muted-foreground">No data yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Cancellations</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Cancelled</span>
                      </div>
                      <Badge variant="destructive">{bookingReport.cancellations}</Badge>
                    </div>
                    <div className="pt-2 border-t text-xs text-muted-foreground">
                      Rate: {bookingReport.totalBookings > 0
                        ? ((bookingReport.cancellations / bookingReport.totalBookings) * 100).toFixed(1)
                        : 0}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => handleExport("booking")}>
                <Download className="mr-2 h-4 w-4" /> Export Booking Report
              </Button>
            </div>
          </TabsContent>

          {/* Sales Report */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Sales Trend</CardTitle>
                  <CardDescription>Revenue growth over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={salesReport.monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v) => [`₱${Number(v).toLocaleString()}`, "Sales"]} />
                      <Line type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sales by Room</CardTitle>
                  <CardDescription>Income breakdown by space</CardDescription>
                </CardHeader>
                <CardContent>
                  {salesReport.revenueByEventType.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={salesReport.revenueByEventType}
                          cx="50%" cy="50%"
                          outerRadius={90}
                          dataKey="amount"
                          label={({ eventType, percent }) => `${eventType} ${(percent * 100).toFixed(0)}%`}
                        >
                          {salesReport.revenueByEventType.map((_: any, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => [`₱${Number(v).toLocaleString()}`, "Sales"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                      No sales data yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>Payment Status</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {salesReport.paymentStatus.map((st: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-sm font-medium">{st.status}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">₱{Number(st.amount).toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{st.count} bookings</div>
                        </div>
                      </div>
                    ))}
                    {salesReport.paymentStatus.length === 0 && (
                      <p className="text-sm text-muted-foreground">No data yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Sales Summary</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Total Sales</span>
                    <span className="font-bold text-green-600">₱{(s?.totalRevenue ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                    <span className="text-sm font-medium">This Month</span>
                    <span className="font-bold text-indigo-600">₱{(stats?.thisMonth.revenue ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Last Month</span>
                    <span className="font-bold text-gray-600">₱{(stats?.lastMonth.revenue ?? 0).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => handleExport("sales")}>
                <Download className="mr-2 h-4 w-4" /> Export Sales Report
              </Button>
            </div>
          </TabsContent>

          {/* Customer Report */}
          <TabsContent value="customers" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>New Customer Signups</CardTitle>
                  <CardDescription>Customer acquisition per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={customerReport.newSignups}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6366f1" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Customers</CardTitle>
                  <CardDescription>Highest value customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customerReport.topCustomers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No data yet</p>
                    ) : customerReport.topCustomers.map((c: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{c.name}</div>
                          <div className="text-xs text-muted-foreground">{c.bookings} booking{c.bookings !== 1 ? "s" : ""}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm text-green-600">₱{Number(c.revenue).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>Customer Stats</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Customers</span>
                    <span className="font-bold">{customerReport.totalCustomers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Repeat Customers</span>
                    <span className="font-bold">{customerReport.repeatCustomers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Retention Rate</span>
                    <span className="font-bold text-green-600">{customerReport.customerRetentionRate}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Satisfaction</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-6 w-6 text-yellow-500 fill-current" />
                      <span className="text-3xl font-bold">{s?.avgRating ?? "—"}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{s?.totalReviews ?? 0} reviews</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => handleExport("customer")}>
                <Download className="mr-2 h-4 w-4" /> Export Customer Report
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
