import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const AreaChart = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.AreaChart })),
  {
    loading: () => <Skeleton className="h-64 w-full" />,
    ssr: false,
  }
)

const Area = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Area })),
  { ssr: false }
)

const XAxis = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.XAxis })),
  { ssr: false }
)

const YAxis = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.YAxis })),
  { ssr: false }
)

const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.CartesianGrid })),
  { ssr: false }
)

const Tooltip = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Tooltip })),
  { ssr: false }
)

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })),
  { ssr: false }
)

interface LazyAreaChartProps {
  data: any[]
  dataKey: string
  stroke?: string
  fill?: string
  fillOpacity?: number
  height?: number
  formatter?: (value: any) => [string, string]
}

export default function LazyAreaChart({ 
  data, 
  dataKey, 
  stroke = "#8884d8", 
  fill = "#8884d8", 
  fillOpacity = 0.4,
  height = 300,
  formatter
}: LazyAreaChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10 }} width={40} />
          <Tooltip formatter={formatter} />
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={stroke} 
            fill={fill} 
            fillOpacity={fillOpacity} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}