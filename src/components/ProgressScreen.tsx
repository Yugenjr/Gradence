import { Semester, AttendanceSubject } from '../types';
import { BarChart, TrendingUp, Sparkles, AlertCircle, Heart } from 'lucide-react';

interface ProgressScreenProps {
  semesters: Semester[];
  attendanceSubjects: AttendanceSubject[];
  gpaScale: 4 | 10;
}

export default function ProgressScreen({ semesters, attendanceSubjects, gpaScale }: ProgressScreenProps) {
  
  // Calculate historical SGPAs and CGPA progression
  const getGpaHistory = () => {
    if (semesters.length === 0) {
      // Mock history if empty to show a beautiful preview
      return [
        { label: 'Sem 1', sgpa: 8.2, cgpa: 8.2 },
        { label: 'Sem 2', sgpa: 8.6, cgpa: 8.4 },
        { label: 'Sem 3', sgpa: 8.9, cgpa: 8.57 },
      ].map(item => ({
        ...item,
        sgpa: gpaScale === 4 ? parseFloat((item.sgpa * 0.4).toFixed(2)) : item.sgpa,
        cgpa: gpaScale === 4 ? parseFloat((item.cgpa * 0.4).toFixed(2)) : item.cgpa
      }));
    }

    const history: { label: string; sgpa: number; cgpa: number }[] = [];
    let runningPoints = 0;
    let runningCredits = 0;

    semesters.forEach((sem) => {
      runningPoints += sem.sgpa * sem.totalCredits;
      runningCredits += sem.totalCredits;
      const cumulative = runningCredits > 0 ? parseFloat((runningPoints / runningCredits).toFixed(2)) : sem.sgpa;

      history.push({
        label: `Sem ${sem.number}`,
        sgpa: sem.sgpa,
        cgpa: cumulative
      });
    });

    return history;
  };

  const gpaData = getGpaHistory();

  // Compute consistency score based on SGPA standard deviation
  const calculateConsistency = () => {
    if (gpaData.length < 2) return 92; // Default high consistency
    const sgpas = gpaData.map(d => d.sgpa);
    const avg = sgpas.reduce((s, x) => s + x, 0) / sgpas.length;
    const variance = sgpas.reduce((s, x) => s + Math.pow(x - avg, 2), 0) / sgpas.length;
    const stdDev = Math.sqrt(variance);
    // Convert to consistency % (100% being standard deviation of 0)
    const consistency = Math.max(50, Math.min(100, Math.round(100 - (stdDev / gpaScale) * 100)));
    return consistency;
  };

  const consistencyScore = calculateConsistency();

  // GPA predictions based on average growth
  const predictFutureCGPA = () => {
    if (gpaData.length === 0) return (gpaScale === 10 ? 8.7 : 3.6);
    const lastCgpa = gpaData[gpaData.length - 1].cgpa;
    if (gpaData.length === 1) return lastCgpa;

    // Calculate average delta growth
    let totalDelta = 0;
    for (let i = 1; i < gpaData.length; i++) {
      totalDelta += gpaData[i].cgpa - gpaData[i - 1].cgpa;
    }
    const avgDelta = totalDelta / (gpaData.length - 1);
    const prediction = Math.min(gpaScale, lastCgpa + (avgDelta * 2)); // project out 2 semesters
    return parseFloat(prediction.toFixed(2));
  };

  const futurePrediction = predictFutureCGPA();

  // Render SVG charts
  const renderSgpaChart = () => {
    const chartHeight = 120;
    const chartWidth = 320;
    const padding = 20;
    const maxVal = gpaScale;

    if (gpaData.length === 0) return null;

    return (
      <svg className="w-full h-32 text-white" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
        {/* Horizontal grid lines */}
        <line x1="0" y1={chartHeight * 0.25} x2={chartWidth} y2={chartHeight * 0.25} stroke="#222" strokeDasharray="3,3" />
        <line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} stroke="#222" strokeDasharray="3,3" />
        <line x1="0" y1={chartHeight * 0.75} x2={chartWidth} y2={chartHeight * 0.75} stroke="#222" strokeDasharray="3,3" />

        {/* Generate SGPA bars */}
        {gpaData.map((d, i) => {
          const barWidth = 32;
          const spacing = (chartWidth - padding * 2) / Math.max(1, gpaData.length - 1 || 1);
          const x = gpaData.length === 1 ? chartWidth / 2 - barWidth / 2 : padding + i * spacing - barWidth / 2;
          const pct = d.sgpa / maxVal;
          const h = (chartHeight - 30) * pct;
          const y = chartHeight - h - 20;

          return (
            <g key={i} className="group cursor-pointer">
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                fill="#ffffff"
                rx="6"
                opacity="0.8"
                className="transition-all hover:opacity-100"
              />
              {/* Labels */}
              <text x={x + barWidth / 2} y={chartHeight - 4} fill="#888" fontSize="9" fontFamily="monospace" textAnchor="middle">
                {d.label}
              </text>
              {/* Value on top of bar */}
              <text x={x + barWidth / 2} y={y - 5} fill="#fff" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                {d.sgpa.toFixed(1)}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderCgpaGrowthLine = () => {
    const chartHeight = 120;
    const chartWidth = 320;
    const padding = 30;
    const maxVal = gpaScale;
    const minVal = gpaScale === 10 ? 5 : 2;

    if (gpaData.length === 0) return null;

    // Generate points coordinates
    const points = gpaData.map((d, i) => {
      const spacing = (chartWidth - padding * 2) / Math.max(1, gpaData.length - 1 || 1);
      const x = gpaData.length === 1 ? chartWidth / 2 : padding + i * spacing;
      const normalizedY = (d.cgpa - minVal) / (maxVal - minVal);
      const y = chartHeight - 25 - normalizedY * (chartHeight - 45);
      return { x, y, cgpa: d.cgpa, label: d.label };
    });

    // Create polyline string
    const polylinePath = points.map(p => `${p.x},${p.y}`).join(' ');

    return (
      <svg className="w-full h-32 text-white overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
        {/* Grids */}
        <line x1="0" y1={chartHeight * 0.3} x2={chartWidth} y2={chartHeight * 0.3} stroke="#1f1f21" />
        <line x1="0" y1={chartHeight * 0.6} x2={chartWidth} y2={chartHeight * 0.6} stroke="#1f1f21" />

        {/* Shaded Area */}
        {points.length > 1 && (
          <path
            d={`M ${points[0].x} ${chartHeight - 20} L ${polylinePath} L ${points[points.length - 1].x} ${chartHeight - 20} Z`}
            fill="url(#area-gradient)"
            opacity="0.15"
          />
        )}

        {/* Glow definitions */}
        <defs>
          <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Growth Line */}
        <polyline
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.5"
          points={polylinePath}
          className="transition-all"
        />

        {/* Data nodes */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#000000"
              stroke="#ffffff"
              strokeWidth="2"
            />
            {/* Value tooltip */}
            <text x={p.x} y={p.y - 10} fill="#fff" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              {p.cgpa.toFixed(2)}
            </text>
            {/* Label */}
            <text x={p.x} y={chartHeight - 2} fill="#666" fontSize="8" fontFamily="monospace" textAnchor="middle">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div id="progress-screen" className="space-y-8 pb-4">
      {/* Header */}
      <div>
        <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block">
          METRICS & ANALYTICS
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1 leading-tight">
          Performance <span className="text-white font-odoo-slant">Insights</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-1 font-mono">
          Interactive historical graphs mapping grade momentum and trajectory.
        </p>
      </div>

      {/* Grid containing SGPA Trend & CGPA Growth Line charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Semester SGPA Trend */}
        <div className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-5 space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block">
              SEMESTER TREND (SGPA)
            </span>
            <BarChart className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="pt-2">
            {renderSgpaChart()}
          </div>
        </div>

        {/* CGPA Growth over Time */}
        <div className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-5 space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block">
              CGPA ACCUMULATION CURVE
            </span>
            <TrendingUp className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="pt-2">
            {renderCgpaGrowthLine()}
          </div>
        </div>

      </div>

      {/* Two Column details: Consistency score & Future predictions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Consistency Score Card */}
        <div className="bg-[#0F0F10] border border-[#2A2A2A] rounded-[24px] p-6 space-y-4 relative overflow-hidden">
          <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block">
            STABILITY MATRIX
          </span>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-white">
              {consistencyScore}%
            </span>
            <span className="text-xs font-mono text-neutral-400 uppercase">
              CONSISTENCY
            </span>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed">
            Your SGPA standard deviation indicates {consistencyScore >= 90 ? 'an exceptionally stable' : 'a varying'} grade spread. A higher consistency rating means you maintain stable quality performance across multiple courses.
          </p>

          <div className="pt-2 border-t border-neutral-900 flex justify-between text-[10px] font-mono text-neutral-500">
            <span>STABLE THRESHOLD: &gt;85%</span>
            <span>CURRENT STATE: OPTIMAL</span>
          </div>
        </div>

        {/* Predictive AI Future Prediction */}
        <div className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-6 space-y-4 relative overflow-hidden">
          <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block">
            PREDICTIVE GRADUATION TRAJECTORY
          </span>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-white">
              {futurePrediction.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-neutral-400 uppercase">
              PROJECTED FINAL CGPA
            </span>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed">
            Based on linear delta extrapolation, if you maintain your current rate of performance growth over upcoming semesters, you are projected to reach a final cumulative CGPA of <span className="text-white font-bold font-mono">{futurePrediction}</span>.
          </p>

          <div className="pt-2 border-t border-neutral-800 flex items-center gap-1.5 text-[10px] font-mono text-neutral-500">
            <Sparkles className="w-3.5 h-3.5 text-neutral-500 animate-pulse" />
            <span>EXTRAPOLATING LINEAR MOMENTUM</span>
          </div>
        </div>

      </div>

      {/* Attendance summary overview */}
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-[24px] p-6">
        <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block mb-4">
          ATTENDANCE STREAK MONITOR
        </span>

        {attendanceSubjects.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs text-neutral-500 font-mono">No courses tracked yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {attendanceSubjects.map((sub) => {
              const subPercent = sub.total > 0 ? parseFloat(((sub.present / sub.total) * 100).toFixed(1)) : 0;
              const isBelow = subPercent < sub.requiredPercentage && sub.total > 0;

              return (
                <div key={sub.id} className="flex items-center justify-between gap-4 border-b border-neutral-900 pb-3 last:border-b-0 last:pb-0">
                  <div className="truncate">
                    <span className="text-xs font-bold text-white block truncate">{sub.name}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">Target: {sub.requiredPercentage}%</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {isBelow ? (
                      <span className="text-[10px] font-mono text-neutral-400 border border-neutral-800 px-2 py-0.5 rounded uppercase shrink-0">
                        ATTEND CRITICAL
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-white border border-neutral-800 px-2 py-0.5 rounded uppercase shrink-0">
                        SAFE
                      </span>
                    )}
                    <span className="text-xs font-mono font-bold text-white">{sub.total > 0 ? `${subPercent}%` : '—'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
