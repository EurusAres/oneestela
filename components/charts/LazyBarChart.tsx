import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const BarChart = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.BarChart })),
  {
    loading: () => <Skeleton className="h-64 w-full" />,
    ssr: false,
  }
)

const Bar = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Bar })),
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

interface LazyBarChartProps {
  data: any[]
  dataKey: string
  fill?: string
  height?: number
}

export default function LazyBarChart({ 
  data, 
  dataKey, 
  fill = "#6366f1",
  height = 300
}: LazyBarChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="area" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={50} />
          <YAxis tick={{ fontSize: 10 }} width={45} />
          <Tooltip />
          <Bar dataKey={dataKey} fill={fill} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}