'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface AreaChartComponentProps {
  data: any[]
  dataKey: string
  stroke?: string
  fill?: string
  fillOpacity?: number
  height?: number
  formatter?: (value: any) => [string, string]
}

export default function AreaChartComponent({ 
  data, 
  dataKey, 
  stroke = "#8884d8", 
  fill = "#8884d8", 
  fillOpacity = 0.4,
  height = 300,
  formatter
}: AreaChartComponentProps) {
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