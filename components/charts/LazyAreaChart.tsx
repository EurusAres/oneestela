'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { ComponentType } from 'react'

interface LazyAreaChartProps {
  data: any[]
  dataKey: string
  stroke?: string
  fill?: string
  fillOpacity?: number
  height?: number
  formatter?: (value: any) => [string, string]
}

const DynamicAreaChart = dynamic(
  () => import('./AreaChartComponent'),
  {
    loading: () => <Skeleton className="h-64 w-full" />,
    ssr: false,
  }
)

export default function LazyAreaChart(props: LazyAreaChartProps) {
  return <DynamicAreaChart {...props} />
}