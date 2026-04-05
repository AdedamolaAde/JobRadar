import API_BASE from '../config';
import { useState, useEffect } from 'react';

function ScraperHealth() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/scraper-health/`)
      .then(res => res.json())
      .then(data => {
        setLogs(data.logs || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch scraper health:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="empty-state">Loading health data...</p>;
  if (logs.length === 0) return <p className="empty-state">No scrape runs recorded yet.</p>;

  const totalAttempted = logs.reduce((s, l) => s + l.jobs_attempted, 0);
  const totalSaved     = logs.reduce((s, l) => s + l.jobs_saved, 0);
  const totalDupes     = logs.reduce((s, l) => s + l.duplicates_skipped, 0);
  const avgSuccess     = totalAttempted > 0 ? Math.round((totalSaved / totalAttempted) * 100) : 0;
  const avgDupe        = totalAttempted > 0 ? Math.round((totalDupes / totalAttempted) * 100) : 0;
  const lastRun        = new Date(logs[0].scraped_at);

  return (
    <div className="health-wrap">
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-label">Total runs</div>
          <div className="stat-value">{logs.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Jobs saved (all time)</div>
          <div className="stat-value">{totalSaved}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg success rate</div>
          <div className="stat-value">{avgSuccess}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg duplicate rate</div>
          <div className="stat-value">{avgDupe}%</div>
        </div>
      </div>

      <div className="health-freshness">
        Last run: {lastRun.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        {' '}at {lastRun.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        {' '}— source: {logs[0].source}
      </div>
    </div>
  );
}

export default ScraperHealth;