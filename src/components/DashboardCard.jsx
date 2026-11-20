import React from 'react';

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'purple',
  onClick
}) {
  const colorStyles = {
    purple: {
      border: 'border-brand-purple/25 hover:border-brand-purple/50',
      iconBg: 'bg-brand-purple/15 text-brand-purple-light',
      glow: 'hover:shadow-glow-purple',
    },
    blue: {
      border: 'border-brand-blue/25 hover:border-brand-blue/50',
      iconBg: 'bg-brand-blue/15 text-brand-blue-light',
      glow: 'hover:shadow-glow-blue',
    },
    cyan: {
      border: 'border-cyan-500/25 hover:border-cyan-500/50',
      iconBg: 'bg-cyan-500/15 text-cyan-400',
      glow: 'hover:shadow-cyan-500/20',
    },
    emerald: {
      border: 'border-emerald-500/25 hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/15 text-emerald-400',
      glow: 'hover:shadow-emerald-500/20',
    },
    amber: {
      border: 'border-amber-500/25 hover:border-amber-500/50',
      iconBg: 'bg-amber-500/15 text-amber-400',
      glow: 'hover:shadow-amber-500/20',
    }
  };

  const style = colorStyles[color] || colorStyles.purple;

  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-2xl p-5 border transition-all duration-200 ${style.border} ${style.glow} ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 tracking-wider uppercase">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${style.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          {value}
        </h3>
        {trend && (
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-slate-400 line-clamp-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
