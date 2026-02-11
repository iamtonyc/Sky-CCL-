
import React, { useMemo } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  Legend,
  ComposedChart
} from 'recharts';
import { CCLData } from '../types';

interface CCLChartProps {
  data: CCLData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-slate-200 shadow-xl rounded-lg">
        <p className="text-sm font-bold text-slate-800 mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm flex items-center justify-between gap-4">
              <span className="font-medium" style={{ color: entry.color }}>
                {entry.name}:
              </span>
              <span className="font-bold text-slate-700">
                {entry.value.toFixed(2)}
              </span>
            </p>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2 italic">
          {payload[0].payload.originalDateRange}
        </p>
      </div>
    );
  }
  return null;
};

const CCLChart: React.FC<CCLChartProps> = ({ data }) => {
  const processedData = useMemo(() => {
    return data.map((d, i) => {
      // Calculate 52-week MA (or simple cumulative average if less than 52 weeks)
      const windowSize = 52;
      const start = Math.max(0, i - windowSize + 1);
      const window = data.slice(start, i + 1);
      const sum = window.reduce((acc, curr) => acc + curr.indexValue, 0);
      const ma52 = sum / window.length;

      return {
        ...d,
        upperBand: ma52 * 1.06,
        lowerBand: ma52 * 0.96,
        ma52: ma52
      };
    });
  }, [data]);

  if (processedData.length === 0) return null;

  // Calculate domain for Y axis
  const allValues = processedData.flatMap(d => [d.indexValue, d.upperBand, d.lowerBand]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const padding = (maxVal - minVal) * 0.1 || 10;

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">CCL Index Trend</h2>
          <p className="text-sm text-slate-500">Includes 52-week MA bands (1.06x & 0.96x)</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-400">Latest Value</p>
          <p className="text-3xl font-bold text-blue-600">
            {processedData[processedData.length - 1].indexValue.toFixed(2)}
          </p>
        </div>
      </div>
      
      <div className="h-[500px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={processedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIndex" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="endDate" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              dy={10}
              minTickGap={40}
            />
            <YAxis 
              domain={[Math.floor(minVal - padding), Math.ceil(maxVal + padding)]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36}/>
            
            <Area 
              name="CCL Index"
              type="monotone" 
              dataKey="indexValue" 
              stroke="#2563eb" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorIndex)"
              animationDuration={1500}
            />

            <Line 
              name="52W MA x 1.06"
              type="monotone" 
              dataKey="upperBand" 
              stroke="#fbbf24" 
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />

            <Line 
              name="52W MA x 0.96"
              type="monotone" 
              dataKey="lowerBand" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-slate-50">
        <div className="px-4 py-2 bg-slate-50 rounded-lg">
          <span className="text-xs font-semibold text-slate-400 block uppercase">Period Starts</span>
          <span className="text-sm font-bold text-slate-700">{processedData[0].endDate}</span>
        </div>
        <div className="px-4 py-2 bg-slate-50 rounded-lg">
          <span className="text-xs font-semibold text-slate-400 block uppercase">Period Ends</span>
          <span className="text-sm font-bold text-slate-700">{processedData[processedData.length - 1].endDate}</span>
        </div>
        <div className="px-4 py-2 bg-slate-50 rounded-lg">
          <span className="text-xs font-semibold text-slate-400 block uppercase">Peak Value</span>
          <span className="text-sm font-bold text-green-600">{maxVal.toFixed(2)}</span>
        </div>
        <div className="px-4 py-2 bg-slate-50 rounded-lg">
          <span className="text-xs font-semibold text-slate-400 block uppercase">Lowest Value</span>
          <span className="text-sm font-bold text-red-600">{minVal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default CCLChart;
