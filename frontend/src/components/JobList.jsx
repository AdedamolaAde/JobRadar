function JobList({ jobs, selectedJob, onSelect }) {
  if (jobs.length === 0) {
    return <p className="empty-state">No jobs yet. Run a scrape to get started.</p>;
  }

  return (
    <div className="job-list">
      {jobs.map((job, i) => (
        <div
          className={`job-card ${selectedJob?.id === job.id ? 'selected' : ''}`}
          key={job.id || i}
          onClick={() => onSelect(job)}
        >
          <div
            className="company-logo"
            style={{ background: getLogoColor(i).bg, color: getLogoColor(i).text }}
          >
            {job.company ? job.company[0].toUpperCase() : '?'}
          </div>

          <div className="job-info">
            <div className="job-title">{job.title}</div>
            <div className="job-meta">
              {job.company} · {job.location || 'Location N/A'}
            </div>
          </div>

          <div className="job-tags">
            <span className={`tag ${getWorkType(job)}`}>
              {getWorkTypeLabel(job)}
            </span>
          </div>

          <div className="job-salary">{formatSalary(job)}</div>

          <div className="job-date">{formatDate(job.date_posted)}</div>
        </div>
      ))}
    </div>
  );
}

function getWorkType(job) {
  if (job.is_remote) return 'remote';
  if (job.job_type === 'hybrid') return 'hybrid';
  return 'onsite';
}

function getWorkTypeLabel(job) {
  if (job.is_remote) return 'Remote';
  if (job.job_type === 'hybrid') return 'Hybrid';
  return 'On-site';
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

const LOGO_COLORS = [
  { bg: '#E6F1FB', text: '#185FA5' },
  { bg: '#EAF3DE', text: '#3B6D11' },
  { bg: '#FAEEDA', text: '#854F0B' },
  { bg: '#FBEAF0', text: '#993556' },
  { bg: '#EEEDFE', text: '#534AB7' },
];

function getLogoColor(index) {
  return LOGO_COLORS[index % LOGO_COLORS.length];
}

export default JobList;