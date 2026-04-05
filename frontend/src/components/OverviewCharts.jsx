import { useMemo } from 'react';

function OverviewCharts({ jobs }) {
  if (jobs.length === 0) return null;

  const WORK_COLORS = {
    Remote: '#378ADD',
    Hybrid: '#97C459',
    'On-site': '#C4B5F4',
  };

  const total = jobs.length;

  const workTypeCounts = jobs.reduce((acc, job) => {
    const type = job.is_remote ? 'Remote' : job.job_type === 'hybrid' ? 'Hybrid' : 'On-site';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const dailyCounts = jobs.reduce((acc, job) => {
    if (!job.date_posted) return acc;
    const date = String(job.date_posted).slice(0, 10);
    if (!acc[date]) acc[date] = { Remote: 0, Hybrid: 0, 'On-site': 0 };
    const type = job.is_remote ? 'Remote' : job.job_type === 'hybrid' ? 'Hybrid' : 'On-site';
    acc[date][type] = acc[date][type] + 1;
    return acc;
  }, {});

  const sortedDays = Object.entries(dailyCounts)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .slice(-7);

  const maxDayCount = Math.max(
    ...sortedDays.map(([, counts]) => counts.Remote + counts.Hybrid + counts['On-site']),
    1
  );

  const circumference = 2 * Math.PI * 35;

  const workTypeSegments = Object.entries(workTypeCounts).reduce((acc, [key, val]) => {
    const t = Object.values(workTypeCounts).reduce((s, v) => s + v, 0);
    const prev = acc.reduce((s, seg) => s + seg.dash, 0);
    const pct = val / t;
    const dash = pct * circumference;
    const gap = circumference - dash;
    acc.push({ key, val, pct, dash, gap, offset: prev, color: WORK_COLORS[key] || '#ccc' });
    return acc;
  }, []);

  return (
    <div className="analytics-row" style={{ marginTop: '16px', marginBottom: '8px' }}>
      <div className="analytics-card wide">
        <div className="analytics-card-header">
          <div className="analytics-card-title">Listings per day (last 7 days)</div>
          <div className="chart-legend">
            {Object.entries(WORK_COLORS).map(([label, color]) => (
              <div className="legend-item" key={label}>
                <div className="legend-dot" style={{ background: color }}></div>
                {label}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '100px', paddingTop: '8px' }}>
          {sortedDays.map(([date, counts]) => {
            const label = new Date(date).toLocaleDateString('en-GB', { weekday: 'short' });
            return (
              <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '100%', height: '80px', display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
                  {['Remote', 'Hybrid', 'On-site'].map(type => {
                    const pixelHeight = Math.round((counts[type] / maxDayCount) * 80);
                    return (
                      <div
                        key={type}
                        style={{
                          flex: 1,
                          height: pixelHeight > 0 ? pixelHeight + 'px' : '0px',
                          background: WORK_COLORS[type],
                          borderRadius: '3px 3px 0 0',
                          minHeight: counts[type] > 0 ? '4px' : '0px',
                        }}
                      ></div>
                    );
                  })}
                </div>
                <div style={{ fontSize: '11px', color: '#aaa' }}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="analytics-card">
        <div className="analytics-card-header">
          <div className="analytics-card-title">Work type split</div>
        </div>
        <div className="donut-container">
          <svg width="100" height="100" viewBox="0 0 100 100">
            {workTypeSegments.map((seg) => (
              <circle
                key={seg.key}
                cx="50" cy="50" r="35"
                fill="none"
                stroke={seg.color}
                strokeWidth="14"
                strokeDasharray={seg.dash + ' ' + seg.gap}
                strokeDashoffset={-seg.offset}
                transform="rotate(-90 50 50)"
              />
            ))}
            <text x="50" y="46" textAnchor="middle" fontSize="14" fontWeight="500" fill="var(--color-text-primary)">{total}</text>
            <text x="50" y="58" textAnchor="middle" fontSize="9" fill="#888">total</text>
          </svg>
          <div className="donut-legend">
            {workTypeSegments.map((seg) => (
              <div className="donut-item" key={seg.key}>
                <div className="donut-swatch" style={{ background: seg.color }}></div>
                <span>{seg.key} — {Math.round(seg.pct * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverviewCharts;