function StatCards({ jobs }) {
  const total = jobs.length;
  const remote = jobs.filter(j => j.is_remote).length;
  const remotePercent = total > 0 ? ((remote / total) * 100).toFixed(1) : 0;

  const salaries = jobs
    .map(j => j.min_amount)
    .filter(s => s !== null && s !== undefined && s > 0);
  const avgSalary = salaries.length > 0
    ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length / 1000)
    : 0;

  const today = new Date().toDateString();
  const newToday = jobs.filter(j => new Date(j.date_posted).toDateString() === today).length;

  const stats = [
    { label: 'Total listings', value: total, delta: null },
    { label: 'Remote roles', value: remote, delta: `${remotePercent}% of total` },
    { label: 'Avg. salary', value: avgSalary > 0 ? `$${avgSalary}k` : 'N/A', delta: null },
    { label: 'New today', value: newToday, delta: null },
  ];

  return (
    <div className="stat-row">
      {stats.map((s, i) => (
        <div className="stat-card" key={i}>
          <div className="stat-label">{s.label}</div>
          <div className="stat-value">{s.value}</div>
          {s.delta && <div className="stat-delta">{s.delta}</div>}
        </div>
      ))}
    </div>
  );
}

export default StatCards;