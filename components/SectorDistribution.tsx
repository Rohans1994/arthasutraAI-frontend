import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#475569', '#0891b2', '#ea580c', '#65a30d'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-xs font-black text-white uppercase">{payload[0].name}</p>
        <p className="text-[10px] font-bold text-blue-400 uppercase mt-1">Allocation: {payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

interface SectorDistributionProps {
  data: { name: string; value: number }[];
  title?: string;
  label?: string;
}

const SectorDistribution: React.FC<SectorDistributionProps> = ({ 
  data, 
  title, 
  label 
}) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="h-[380px] w-full flex flex-col">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{title}</h3>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-bold uppercase tracking-widest">{label}</span>
        </div>
      )}
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 20, bottom: 20 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  className="hover:opacity-80 transition-opacity outline-none"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              align="center"
              iconType="circle"
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SectorDistribution;