function DetailPanel({ job }) {
  if (!job) {
    return (
      <div className="detail-panel">
        <p className="empty-state">Select a job to see details.</p>
      </div>
    );
  }

  return (
    <div className="detail-panel">
      <div className="detail-company">
        <div
          className="detail-logo"
          style={{ background: '#E6F1FB', color: '#185FA5' }}
        >
          {job.company ? job.company[0].toUpperCase() : '?'}
        </div>
        <div>
          <div className="detail-name">{job.company || 'Unknown company'}</div>
          <div className="detail-site">{job.company_url || ''}</div>
        </div>
      </div>

      <div className="detail-title">{job.title}</div>
      <div className="detail-loc">{job.location || 'Location N/A'}</div>

      <div className="detail-chips">
        {job.job_function && <span className="detail-chip">{job.job_function}</span>}
        {job.job_type && <span className="detail-chip">{job.job_type}</span>}
        {job.is_remote && <span className="detail-chip">Remote</span>}
      </div>

      <div className="detail-section">
        <div className="detail-sec-title">Job details</div>
        <div className="detail-row">
          <span className="detail-key">Salary</span>
          <span className="detail-val">{formatSalary(job)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-key">Work type</span>
          <span className="detail-val">{job.is_remote ? 'Remote' : job.job_type || 'On-site'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-key">Posted</span>
          <span className="detail-val">{formatDate(job.date_posted)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-key">Source</span>
          <span className="detail-val">{job.site || 'N/A'}</span>
        </div>
      </div>

      {job.description && (
        <div className="detail-section">
          <div className="detail-sec-title">Description</div>
          <div className="detail-desc">
            {job.description.slice(0, 300)}
            {job.description.length > 300 ? '...' : ''}
          </div>
        </div>
      )}

      {job.job_url && (
        <a className="apply-btn" href={job.job_url} target="_blank" rel="noreferrer">
          Apply now
        </a>
      )}
    </div>
  );
}

function formatSalary(job) {
  if (!job.min_amount && !job.max_amount) return 'N/A';
  const currency = job.currency || '$';
  const min = job.min_amount ? Math.round(job.min_amount / 1000) : null;
  const max = job.max_amount ? Math.round(job.max_amount / 1000) : null;
  if (min && max) return `${currency}${min}k–${max}k`;
  if (min) return `From ${currency}${min}k`;
  if (max) return `Up to ${currency}${max}k`;
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const diff = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60));
  if (diff < 1) return 'Just now';
  if (diff < 24) return `${diff}h ago`;
  const days = Math.floor(diff / 24);
  return `${days}d ago`;
}

export default DetailPanel;