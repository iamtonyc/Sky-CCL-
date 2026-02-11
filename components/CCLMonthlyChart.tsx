
import React, { useMemo } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Bar,
  ComposedChart,
  Line,
  Legend,
  Cell
} from 'recharts';
import { CCLData } from '../types';

interface CCLMonthlyChartProps {
  data: CCLData[];
}

const MonthlyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isUp = data.close >= data.open;
    return (
      <div className="bg-white p-4 border border-slate-200 shadow-xl rounded-lg">
        <p className="text-sm font-bold text-slate-800 mb-2">{label}</p>
        <div className="space-y-1 text-xs">
          <p className="flex justify-between gap-6">
            <span className="text-slate-500">Open:</span>
            <span className="font-mono font-bold">{data.open.toFixed(2)}</span>
          </p>
          <p className="flex justify-between gap-6">
            <span className="text-slate-500">High:</span>
            <span className="font-mono font-bold text-green-600">{data.high.toFixed(2)}</span>
          </p>
          <p className="flex justify-between gap-6">
            <span className="text-slate-500">Low:</span>
            <span className="font-mono font-bold text-red-600">{data.low.toFixed(2)}</span>
          </p>
          <p className="flex justify-between gap-6 border-t pt-1 mt-1">
            <span className="text-slate-500">Close:</span>
            <span className={`font-mono font-bold ${isUp ? 'text-green-600' : 'text-red-600'}`}>
              {data.close.toFixed(2)}
            </span>
          </p>
          {data.ma10 !== undefined && (
            <p className="flex justify-between gap-6 text-red-600 font-medium">
              <span>MA 10:</span>
              <span className="font-mono font-bold">{data.ma10.toFixed(2)}</span>
            </p>
          )}
          <p className="text-[10px] text-slate-400 mt-2">
            Change: {((data.close - data.open) / data.open * 100).toFixed(2)}%
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const CCLMonthlyChart: React.FC<CCLMonthlyChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    // Group weekly data by month (YYYY-MM)
    const groups: Record<string, CCLData[]> = {};
    
    data.forEach(item => {
      const month = item.endDate.substring(0, 7); // yyyy-mm
      if (!groups[month]) {
        groups[month] = [];
      }
      groups[month].push(item);
    });

    const monthlyData = Object.entries(groups).map(([month, items]) => {
      // Sort items within the month by date to get correct open/close
      const sorted = [...items].sort((a, b) => a.endDate.localeCompare(b.endDate));
      const open = sorted[0].indexValue;
      const close = sorted[sorted.length - 1].indexValue;
      const high = Math.max(...sorted.map(v => v.indexValue));
      const low = Math.min(...sorted.map(v => v.indexValue));

      return {
        month,
        open,
        close,
        high,
        low,
        // For Recharts Bar to work as a range, we pass [start, end]
        wick: [low, high],
        body: [open, close]
      };
    }).sort((a, b) => a.month.localeCompare(b.month));

    // Add Moving Average calculation (10-month)
    return monthlyData.map((d, i) => {
      const windowSize = 10;
      const start = Math.max(0, i - windowSize + 1);
      const window = monthlyData.slice(start, i + 1);
      const sum = window.reduce((acc, curr) => acc + curr.close, 0);
      const ma10 = sum / window.length;
      return { ...d, ma10 };
    });
  }, [data]);

  if (chartData.length === 0) return null;

  const latestData = chartData[chartData.length - 1];
  const minVal = Math.min(...chartData.map(d => Math.min(d.low, d.ma10)));
  const maxVal = Math.max(...chartData.map(d => Math.max(d.high, d.ma10)));
  const padding = (maxVal - minVal) * 0.1 || 10;

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Monthly CCL Performance</h2>
          <p className="text-sm text-slate-500">Candlestick view with 10-Month Moving Average (Red)</p>
        </div>
        <div className="text-right flex items-center gap-6">
          <div>
            <p className="text-sm font-medium text-slate-400">Latest Close</p>
            <p className="text-2xl font-bold text-slate-700">
              {latestData.close.toFixed(2)}
            </p>
          </div>
          <div className="pl-6 border-l border-slate-100">
            <p className="text-sm font-medium text-slate-400">10-MA</p>
            <p className="text-2xl font-bold text-red-600">
              {latestData.ma10.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="h-[500px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              dy={10}
              minTickGap={20}
            />
            <YAxis 
              domain={[Math.floor(minVal - padding), Math.ceil(maxVal + padding)]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              dx={-10}
            />
            <Tooltip content={<MonthlyTooltip />} />
            <Legend verticalAlign="top" height={36} />
            
            {/* Wicks */}
            <Bar dataKey="wick" barSize={2} fill="#94a3b8" name="High/Low Range" />
            
            {/* Bodies */}
            <Bar dataKey="body" barSize={16} name="Open/Close Body">
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.close >= entry.open ? '#22c55e' : '#ef4444'} 
                />
              ))}
            </Bar>

            {/* 10-Month Moving Average Line */}
            <Line 
              name="10-Month MA"
              type="monotone" 
              dataKey="ma10" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={false}
              animationDuration={1500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-50">
        <div className="p-3 bg-green-50 rounded-lg border border-green-100">
          <span className="text-[10px] font-bold text-green-600 block uppercase">Bullish Months</span>
          <span className="text-lg font-bold text-green-700">
            {chartData.filter(d => d.close >= d.open).length}
          </span>
        </div>
        <div className="p-3 bg-red-50 rounded-lg border border-red-100">
          <span className="text-[10px] font-bold text-red-600 block uppercase">Bearish Months</span>
          <span className="text-lg font-bold text-red-700">
            {chartData.filter(d => d.close < d.open).length}
          </span>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Period</span>
          <span className="text-lg font-bold text-slate-700">{chartData.length} Months</span>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
          <span className="text-[10px] font-bold text-blue-600 block uppercase">Latest Trend</span>
          <span className={`text-lg font-bold ${chartData[chartData.length-1].close >= chartData[chartData.length-1].open ? 'text-green-600' : 'text-red-600'}`}>
            {chartData[chartData.length-1].close >= chartData[chartData.length-1].open ? 'Upward' : 'Downward'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CCLMonthlyChart;
