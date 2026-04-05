import { useState, useEffect } from "react";

function Analytics({ jobs }) {
  const [analytics, setAnalytics] = useState(null);
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [industry, setIndustry] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [hotzones, setHotzones] = useState(null);
  const [monthOverMonth, setMonthOverMonth] = useState([]);
  const [ratingData, setRatingData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/analytics/")
      .then(r => r.json())
      .then(setAnalytics)
      .catch(() => {});

    fetch("http://localhost:8000/api/analytics/skills/")
      .then(r => r.json())
      .then(d => setSkills(d.skills || []))
      .catch(() => {});

    fetch("http://localhost:8000/api/analytics/experience/")
      .then(r => r.json())
      .then(d => setExperience(d.experience || []))
      .catch(() => {});

    fetch("http://localhost:8000/api/analytics/industry/")
      .then(r => r.json())
      .then(d => setIndustry(d.industries || []))
      .catch(() => {});

    fetch("http://localhost:8000/api/analytics/bundles/")
      .then(r => r.json())
      .then(d => setBundles(d.bundles || []))
      .catch(() => {});

    fetch("http://localhost:8000/api/analytics/hotzones/")
      .then(r => r.json())
      .then(d => setHotzones(d))
      .catch(() => {});

    fetch("http://localhost:8000/api/analytics/month-over-month/")
      .then(r => r.json())
      .then(d => setMonthOverMonth(d.months || []))
      .catch(() => {});

    fetch("http://localhost:8000/api/analytics/rating-vs-salary/")
      .then(r => r.json())
      .then(d => setRatingData(d.points || []))
      .catch(() => {});
  }, []);

  if (jobs.length === 0) {
    return <p className="empty-state">No data yet. Run a scrape first.</p>;
  }

  const total = jobs.length;

  const workTypeCounts = jobs.reduce((acc, job) => {
    const type = job.is_remote ? 'Remote' : job.job_type === 'hybrid' ? 'Hybrid' : 'On-site';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const siteCounts = jobs.reduce((acc, job) => {
    const site = job.site || 'Unknown';
    acc[site] = (acc[site] || 0) + 1;
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

  const salaries = jobs
    .map(j => j.min_amount)
    .filter(s => s !== null && s !== undefined && s > 0);

  const avgSalary = salaries.length > 0
    ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length / 1000) : null;
  const maxSalary = salaries.length > 0 ? Math.round(Math.max(...salaries) / 1000) : null;
  const minSalary = salaries.length > 0 ? Math.round(Math.min(...salaries) / 1000) : null;

  const WORK_COLORS = {
    Remote: '#378ADD',
    Hybrid: '#97C459',
    'On-site': '#C4B5F4',
  };

  const SITE_COLORS = ['#7F77DD', '#E8A87C', '#5DCAA5', '#D85A30', '#888780'];
  const circumference = 2 * Math.PI * 35;

  function getDonutSegments(counts) {
    const entries = Object.entries(counts);
    const t = entries.reduce((s, [, v]) => s + v, 0);
    let offset = 0;
    return entries.map(([key, val], i) => {
      const pct = val / t;
      const dash = pct * circumference;
      const gap = circumference - dash;
      const seg = { key, val, pct, dash, gap, offset, color: SITE_COLORS[i % SITE_COLORS.length] };
      offset += dash;
      return seg;
    });
  }

  const siteSegments = getDonutSegments(siteCounts);

  function getWorkTypeSegments(counts) {
    const entries = Object.entries(counts);
    const t = entries.reduce((s, [, v]) => s + v, 0);
    let offset = 0;
    return entries.map(([key, val]) => {
      const pct = val / t;
      const dash = pct * circumference;
      const gap = circumference - dash;
      const seg = { key, val, pct, dash, gap, offset, color: WORK_COLORS[key] || '#ccc' };
      offset += dash;
      return seg;
    });
  }

  const workTypeSegments = getWorkTypeSegments(workTypeCounts);

  function HorizontalBarChart({ items, barColor }) {
    if (!items || items.length === 0) {
      return <p className="empty-state" style={{ fontSize: '12px' }}>No data yet.</p>;
    }
    const maxCount = Math.max(...items.map(i => i.count), 1);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        {items.map(({ name, count }) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '110px', fontSize: '11px', color: '#aaa', textAlign: 'right', flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {name}
            </div>
            <div style={{ flex: 1, background: 'transparent', borderRadius: '3px', height: '14px' }}>
              <div style={{ width: `${(count / maxCount) * 100}%`, height: '100%', background: barColor, borderRadius: '3px', minWidth: count > 0 ? '6px' : '0', transition: 'width 0.4s ease' }} />
            </div>
            <div style={{ width: '28px', fontSize: '11px', color: '#aaa', flexShrink: 0 }}>
              {count}
            </div>
          </div>
        ))}
      </div>
    );
  }

  function JobTypeDonut({ jobTypes }) {
    if (!jobTypes || jobTypes.length === 0) {
      return <p className="empty-state" style={{ fontSize: '12px' }}>No data yet.</p>;
    }
    const countMap = Object.fromEntries(jobTypes.map(jt => [jt.name, jt.count]));
    const segments = getDonutSegments(countMap);
    const typeTotal = jobTypes.reduce((s, jt) => s + jt.count, 0);
    return (
      <div className="donut-container">
        <svg width="100" height="100" viewBox="0 0 100 100">
          {segments.map((seg) => (
            <circle key={seg.key} cx="50" cy="50" r="35" fill="none" stroke={seg.color}
              strokeWidth="14" strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={-seg.offset} transform="rotate(-90 50 50)" />
          ))}
          <text x="50" y="46" textAnchor="middle" fontSize="14" fontWeight="500" fill="var(--color-text-primary)">{typeTotal}</text>
          <text x="50" y="58" textAnchor="middle" fontSize="9" fill="#888">total</text>
        </svg>
        <div className="donut-legend">
          {segments.map((seg) => (
            <div className="donut-item" key={seg.key}>
              <div className="donut-swatch" style={{ background: seg.color }}></div>
              <span>{seg.key} — {Math.round(seg.pct * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function SkillsChart({ skills }) {
    if (!skills || skills.length === 0) {
      return <p className="empty-state" style={{ fontSize: '12px' }}>No skill data yet.</p>;
    }
    const top = skills.slice(0, 12);
    const maxCount = Math.max(...top.map(s => s.count), 1);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        {top.map(({ skill, count }) => (
          <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '100px', fontSize: '11px', color: '#aaa', textAlign: 'right', flexShrink: 0 }}>
              {skill}
            </div>
            <div style={{ flex: 1, background: 'transparent', borderRadius: '3px', height: '14px' }}>
              <div style={{ width: `${(count / maxCount) * 100}%`, height: '100%', background: '#378ADD', borderRadius: '3px', minWidth: count > 0 ? '6px' : '0', transition: 'width 0.4s ease' }} />
            </div>
            <div style={{ width: '28px', fontSize: '11px', color: '#aaa', flexShrink: 0 }}>
              {count}
            </div>
          </div>
        ))}
      </div>
    );
  }

  function ExperienceChart({ experience }) {
    if (!experience || experience.length === 0) {
      return <p className="empty-state" style={{ fontSize: '12px' }}>No experience data yet.</p>;
    }
    const EXP_COLORS = { Junior: '#5DCAA5', Mid: '#378ADD', Senior: '#E8A87C', Lead: '#D85A30', Unspecified: '#888780' };
    const maxCount = Math.max(...experience.map(e => e.count), 1);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        {experience.map(({ level, count }) => (
          <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '90px', fontSize: '11px', color: '#aaa', textAlign: 'right', flexShrink: 0 }}>
              {level}
            </div>
            <div style={{ flex: 1, background: 'transparent', borderRadius: '3px', height: '14px' }}>
              <div style={{ width: `${(count / maxCount) * 100}%`, height: '100%', background: EXP_COLORS[level] || '#888', borderRadius: '3px', minWidth: count > 0 ? '6px' : '0', transition: 'width 0.4s ease' }} />
            </div>
            <div style={{ width: '28px', fontSize: '11px', color: '#aaa', flexShrink: 0 }}>
              {count}
            </div>
          </div>
        ))}
      </div>
    );
  }

  function RatingVsSalary({ points }) {
    if (!points || points.length === 0) {
      return <p className="empty-state" style={{ fontSize: '12px' }}>No rating + salary data yet. Run a scrape to populate.</p>;
    }
    const maxSal = Math.max(...points.map(p => p.salary), 1);
    const W = 320, H = 180, PAD = 32;
    return (
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        <text x="8" y={H / 2} fontSize="9" fill="#aaa" textAnchor="middle"
          transform={`rotate(-90, 8, ${H / 2})`}>Salary ($k)</text>
        <text x={W / 2} y={H - 2} fontSize="9" fill="#aaa" textAnchor="middle">Rating</text>
        {[1, 2, 3, 4, 5].map(r => {
          const x = PAD + ((r - 1) / 4) * (W - PAD * 2);
          return (
            <g key={r}>
              <line x1={x} y1={PAD} x2={x} y2={H - PAD} stroke="#f0f0f0" strokeWidth="1" />
              <text x={x} y={H - PAD + 10} fontSize="8" fill="#aaa" textAnchor="middle">{r}</text>
            </g>
          );
        })}
        {points.map((p, i) => {
          const x = PAD + ((p.rating - 1) / 4) * (W - PAD * 2);
          const y = (H - PAD) - (p.salary / maxSal) * (H - PAD * 2);
          return (
            <circle key={i} cx={x} cy={y} r="4" fill="#378ADD" fillOpacity="0.7">
              <title>{p.company} — {p.rating}★ / ${p.salary}k</title>
            </circle>
          );
        })}
      </svg>
    );
  }

  return (
    <div className="analytics-wrap">

      {/* ── ROW 1 ─────────────────────────────────────────── */}
      <div className="analytics-row">
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
                        <div key={type} style={{ flex: 1, height: pixelHeight > 0 ? pixelHeight + 'px' : '0px', background: WORK_COLORS[type], borderRadius: '3px 3px 0 0', minHeight: counts[type] > 0 ? '4px' : '0px' }}></div>
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
                <circle key={seg.key} cx="50" cy="50" r="35" fill="none"
                  stroke={WORK_COLORS[seg.key] || '#ccc'} strokeWidth="14"
                  strokeDasharray={seg.dash + ' ' + seg.gap} strokeDashoffset={-seg.offset}
                  transform="rotate(-90 50 50)" />
              ))}
              <text x="50" y="46" textAnchor="middle" fontSize="14" fontWeight="500" fill="var(--color-text-primary)">{total}</text>
              <text x="50" y="58" textAnchor="middle" fontSize="9" fill="#888">total</text>
            </svg>
            <div className="donut-legend">
              {workTypeSegments.map((seg) => (
                <div className="donut-item" key={seg.key}>
                  <div className="donut-swatch" style={{ background: WORK_COLORS[seg.key] || '#ccc' }}></div>
                  <span>{seg.key} — {Math.round(seg.pct * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 2 ─────────────────────────────────────────── */}
      <div className="analytics-row">
        <div className="analytics-card">
          <div className="analytics-card-header">
            <div className="analytics-card-title">Jobs by source</div>
          </div>
          <div className="donut-container">
            <svg width="100" height="100" viewBox="0 0 100 100">
              {siteSegments.map((seg) => (
                <circle key={seg.key} cx="50" cy="50" r="35" fill="none"
                  stroke={seg.color} strokeWidth="14"
                  strokeDasharray={seg.dash + ' ' + seg.gap} strokeDashoffset={-seg.offset}
                  transform="rotate(-90 50 50)" />
              ))}
              <text x="50" y="46" textAnchor="middle" fontSize="14" fontWeight="500" fill="var(--color-text-primary)">{total}</text>
              <text x="50" y="58" textAnchor="middle" fontSize="9" fill="#888">total</text>
            </svg>
            <div className="donut-legend">
              {siteSegments.map((seg) => (
                <div className="donut-item" key={seg.key}>
                  <div className="donut-swatch" style={{ background: seg.color }}></div>
                  <span>{seg.key} — {seg.val} jobs</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="analytics-card wide">
          <div className="analytics-card-header">
            <div className="analytics-card-title">Salary insights</div>
          </div>
          {avgSalary ? (
            <div className="salary-grid">
              <div className="salary-stat">
                <div className="salary-label">Average</div>
                <div className="salary-value">${avgSalary}k</div>
              </div>
              <div className="salary-stat">
                <div className="salary-label">Highest</div>
                <div className="salary-value">${maxSalary}k</div>
              </div>
              <div className="salary-stat">
                <div className="salary-label">Lowest</div>
                <div className="salary-value">${minSalary}k</div>
              </div>
              <div className="salary-stat">
                <div className="salary-label">With salary data</div>
                <div className="salary-value">{salaries.length} <span className="salary-sub">/ {total}</span></div>
              </div>
            </div>
          ) : (
            <p className="empty-state">No salary data available.</p>
          )}
        </div>
      </div>

      {/* ── ROW 3 ─────────────────────────────────────────── */}
      <div className="analytics-row">
        <div className="analytics-card">
          <div className="analytics-card-header">
            <div className="analytics-card-title">Top hiring companies</div>
          </div>
          <HorizontalBarChart items={analytics?.top_companies || []} barColor="#378ADD" />
        </div>

        <div className="analytics-card">
          <div className="analytics-card-header">
            <div className="analytics-card-title">Top job locations</div>
          </div>
          <HorizontalBarChart items={analytics?.top_locations || []} barColor="#378ADD" />
        </div>

        <div className="analytics-card">
          <div className="analytics-card-header">
            <div className="analytics-card-title">Job type breakdown</div>
          </div>
          <JobTypeDonut jobTypes={analytics?.job_types || []} />
        </div>
      </div>

      {/* ── ROW 4 ─────────────────────────────────────────── */}
      <div className="analytics-row">
        <div className="analytics-card wide">
          <div className="analytics-card-header">
            <div className="analytics-card-title">Top requested skills</div>
          </div>
          <SkillsChart skills={skills} />
        </div>

        <div className="analytics-card">
          <div className="analytics-card-header">
            <div className="analytics-card-title">Experience level distribution</div>
          </div>
          <ExperienceChart experience={experience} />
        </div>
      </div>

      {/* ── ROW 5 ─────────────────────────────────────────── */}
      <div className="analytics-row">
        <div className="analytics-card wide">
          <div className="analytics-card-header">
            <div className="analytics-card-title">Industry breakdown</div>
          </div>
          <HorizontalBarChart
            items={industry.map(i => ({ name: i.sector, count: i.count }))}
            barColor="#7F77DD"
          />
        </div>
      </div>

      {/* ── ROW 6 ─────────────────────────────────────────── */}
      <div className="analytics-row">
        <div className="analytics-card wide">
          <div className="analytics-card-header">
            <div className="analytics-card-title">Tech stack bundles</div>
          </div>
          <HorizontalBarChart items={bundles} barColor="#5DCAA5" />
        </div>
      </div>

      {/* ── ROW 7 ─────────────────────────────────────────── */}
      <div className="analytics-row">
        <div className="analytics-card wide">
          <div className="analytics-card-header">
            <div className="analytics-card-title">Posting hot zones — day of week</div>
          </div>
          <HorizontalBarChart items={hotzones?.days || []} barColor="#E8A87C" />
        </div>

        <div className="analytics-card wide">
          <div className="analytics-card-header">
            <div className="analytics-card-title">Posting hot zones — hour of day</div>
          </div>
          <HorizontalBarChart items={hotzones?.hours || []} barColor="#E8A87C" />
        </div>
      </div>

      {/* ── ROW 8 ─────────────────────────────────────────── */}
      <div className="analytics-row">
        <div className="analytics-card wide">
          <div className="analytics-card-header">
            <div className="analytics-card-title">Month-over-month job postings</div>
          </div>
          <HorizontalBarChart items={monthOverMonth} barColor="#97C459" />
        </div>
      </div>

      {/* ── ROW 9 ─────────────────────────────────────────── */}
      <div className="analytics-row">
        <div className="analytics-card wide">
          <div className="analytics-card-header">
            <div className="analytics-card-title">Company rating vs salary</div>
          </div>
          <RatingVsSalary points={ratingData} />
        </div>
      </div>

    </div>
  );
}

export default Analytics;