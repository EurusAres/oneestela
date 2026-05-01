'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

interface LazyBarChartProps {
  data: any[]
  dataKey: string
  fill?: string
  height?: number
  formatter?: (value: any) => [string, string]
}

const DynamicBarChart = dynamic(
  () => import('./BarChartComponent'),
  {
    loading: () => <Skeleton className="h-64 w-full" />,
    ssr: false,
  }
)

export default function LazyBarChart(props: LazyBarChartProps) {
  return <DynamicBarChart {...props} />
}