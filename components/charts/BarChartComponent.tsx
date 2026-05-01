'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface BarChartComponentProps {
  data: any[]
  dataKey: string
  fill?: string
  height?: number
  formatter?: (value: any) => [string, string]
}

export default function BarChartComponent({ 
  data, 
  dataKey, 
  fill = "#8884d8",
  height = 300,
  formatter
}: BarChartComponentProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10 }} width={40} />
          <Tooltip formatter={formatter} />
          <Bar dataKey={dataKey} fill={fill} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}