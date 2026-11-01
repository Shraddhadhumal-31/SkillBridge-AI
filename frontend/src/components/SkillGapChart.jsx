import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export default function SkillGapChart({
  matchedCount = 0,
  missingCount = 0,
  partialCount = 0,
  weightedCoverage = 0,
}) {
  const pieData = [
    { name: 'Acquired Skills', value: matchedCount, color: '#10b981' }, // emerald
    { name: 'Transferable/Partial', value: partialCount, color: '#f59e0b' }, // amber
    { name: 'Skills to Acquire', value: missingCount, color: '#f43f5e' }, // rose
  ].filter((d) => d.value > 0);

  const barData = [
    { name: 'Matched', count: matchedCount, fill: '#10b981' },
    { name: 'Transferable', count: partialCount, fill: '#f59e0b' },
    { name: 'Missing', count: missingCount, fill: '#f43f5e' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
      {/* Donut Distribution */}
      <div className="h-56 flex flex-col items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} skills`, name]}
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-900">{weightedCoverage}%</span>
          <span className="text-[10px] uppercase font-bold text-slate-400">Readiness</span>
        </div>
      </div>

      {/* Bar Count */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {barData.map((entry, index) => (
                <Cell key={`bar-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
