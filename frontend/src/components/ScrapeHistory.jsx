import API_BASE from '../config';
import { useState, useEffect } from 'react';

function ScrapeHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/scrape-history/`)
      .then(res => res.json())
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch scrape history:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="empty-state">Loading history...</p>;
  if (logs.length === 0) return <p className="empty-state">No scrapes recorded yet.</p>;

  return (
    <div className="history-table-wrap">
      <table className="history-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Time</th>
            <th>Jobs saved</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => {
            const date = new Date(log.scraped_at);
            return (
              <tr key={log.id}>
                <td className="muted">{logs.length - i}</td>
                <td>{date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td>{date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</td>
                <td><strong>{log.jobs_saved}</strong></td>
                <td>
                  <span className={log.jobs_saved > 0 ? 'status-badge success' : 'status-badge neutral'}>
                    {log.jobs_saved > 0 ? 'New jobs found' : 'No new jobs'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ScrapeHistory;