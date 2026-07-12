import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip, Legend
} from 'recharts';

export default function ESGRadarChart({ data }) {
  // data: [{ dept: 'Eng', E: 72, S: 65, G: 80 }, ...]
  if (!data?.length) return <div className="text-slate-500 text-sm text-center py-8">No score data yet</div>;

  const chartData = [
    { subject: 'Environmental', ...Object.fromEntries(data.map((d) => [d.dept, d.E])) },
    { subject: 'Social', ...Object.fromEntries(data.map((d) => [d.dept, d.S])) },
    { subject: 'Governance', ...Object.fromEntries(data.map((d) => [d.dept, d.G])) },
  ];

  const colors = ['#4ade80', '#60a5fa', '#f472b6', '#fb923c'];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
          labelStyle={{ color: '#e2e8f0' }}
        />
        <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
        {data.map((d, i) => (
          <Radar
            key={d.dept}
            name={d.dept}
            dataKey={d.dept}
            stroke={colors[i % colors.length]}
            fill={colors[i % colors.length]}
            fillOpacity={0.15}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
}
