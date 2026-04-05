import API_BASE from '../config';
import StatCards from '../components/StatCards';
import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import JobList from '../components/JobList';
import DetailPanel from '../components/DetailPanel';
import ScrapeHistory from '../components/ScrapeHistory';
import Analytics from '../components/Analytics';
import FiltersPanel from '../components/FiltersPanel';
import OverviewCharts from '../components/OverviewCharts';
import RecentListings from '../components/RecentListings';
import ScraperHealth from '../components/ScraperHealth';

function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState(null);
  const [lastScraped, setLastScraped] = useState(null);
  const [search, setSearch] = useState('');
  const [activePage, setActivePage] = useState('overview');
  const [filters, setFilters] = useState({
    workTypes: [],
    sources: [],
    minSalary: 0,
    datePosted: 'any',
    continents: [],
    countries: [],
  });

  const CONTINENT_MAP = {
    'USA': 'North America', 'United States': 'North America', 'Canada': 'North America', 'Mexico': 'North America',
    'UK': 'Europe', 'United Kingdom': 'Europe', 'Germany': 'Europe', 'France': 'Europe',
    'Netherlands': 'Europe', 'Spain': 'Europe', 'Italy': 'Europe', 'Poland': 'Europe',
    'Australia': 'Oceania', 'New Zealand': 'Oceania',
    'India': 'Asia', 'Singapore': 'Asia', 'Japan': 'Asia', 'China': 'Asia',
    'Nigeria': 'Africa', 'South Africa': 'Africa', 'Kenya': 'Africa',
    'Brazil': 'South America', 'Argentina': 'South America',
  };

  const filteredJobs = jobs.filter(job => {
    const q = search.toLowerCase();
    const matchesSearch =
      job.title?.toLowerCase().includes(q) ||
      job.company?.toLowerCase().includes(q) ||
      job.location?.toLowerCase().includes(q);

    const workType = job.is_remote ? 'Remote' : job.job_type === 'hybrid' ? 'Hybrid' : 'On-site';
    const matchesWorkType = filters.workTypes.length === 0 || filters.workTypes.includes(workType);

    const matchesSource = filters.sources.length === 0 || filters.sources.includes(job.site);

    const matchesSalary = filters.minSalary === 0 ||
      (job.min_amount !== null && job.min_amount >= filters.minSalary);

    const daysDiff = job.date_posted
      ? Math.floor((new Date() - new Date(job.date_posted)) / (1000 * 60 * 60 * 24))
      : Infinity;
    const matchesDate =
      filters.datePosted === 'any' ||
      (filters.datePosted === 'today' && daysDiff < 1) ||
      (filters.datePosted === '3days' && daysDiff <= 3) ||
      (filters.datePosted === '7days' && daysDiff <= 7);

    const jobCountry = job.location
      ? job.location.split(',').pop().trim()
      : null;
    const jobContinent = jobCountry ? (CONTINENT_MAP[jobCountry] || 'Other') : null;
    const matchesCountry = filters.countries.length === 0 ||
      (jobCountry && filters.countries.includes(jobCountry));
    const matchesContinent = filters.continents.length === 0 ||
      (jobContinent && filters.continents.includes(jobContinent));

    return matchesSearch && matchesWorkType && matchesSource &&
      matchesSalary && matchesDate && matchesCountry && matchesContinent;
  });

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/listings/`)
      .then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setJobs(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  function handleScrape() {
    setScraping(true);
    fetch(`${API_BASE}/scrape/`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        console.log(`Scrape done. ${data.saved} new jobs saved.`);
        setScrapeResult(data.saved);
        setTimeout(() => setScrapeResult(null), 30000);
        return fetch(`${API_BASE}/listings/`);
      })
      .then(res => res.json())
      .then(data => {
        setJobs(data);
        return fetch(`${API_BASE}/last-scraped/`);
      })
      .then(res => res.json())
      .then(data => {
        setLastScraped(data.last_scraped);
        setScraping(false);
      })
      .catch(err => {
        console.error('Scrape failed:', err);
        setScraping(false);
      });
  }

  function formatLastScraped(isoString) {
    if (!isoString) return 'never';
    const diff = Math.floor((new Date() - new Date(isoString)) / (1000 * 60));
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff} min ago`;
    const hrs = Math.floor(diff / 60);
    if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  useEffect(() => {
    fetch(`${API_BASE}/last-scraped/`)
      .then(res => res.json())
      .then(data => { setLastScraped(data.last_scraped); })
      .catch(err => { console.error('Failed to fetch last scraped time:', err); });
  }, []);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="4" stroke="#E6F1FB" strokeWidth="1.5" />
              <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="#E6F1FB" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="logo-text">JobRadar</div>
            <div className="logo-sub">Scraping dashboard</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'listings', label: 'Job Listings' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'history', label: 'Scrape History' },
            { id: 'health', label: 'Scraper Health' },
          ].map(item => (
            <div
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              {item.label}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="scrape-btn"
            onClick={handleScrape}
            disabled={scraping}>
            {scraping ? 'Scraping...' : 'Run New Scrape'}
          </button>
          {scrapeResult !== null && (
            <div className="scrape-result">
              {scrapeResult === 0 ? 'No new jobs found.' : `+${scrapeResult} new jobs added.`}
            </div>
          )}
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-title">
            Developer Jobs
            <span className="topbar-sub"> — last scraped {formatLastScraped(lastScraped)}</span>
          </div>
          <input
            className="search-input"
            type="text"
            placeholder="Search jobs, companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </header>

        <div className="body">
          {activePage === 'listings' && (
            <FiltersPanel
              jobs={jobs}
              filters={filters}
              onChange={setFilters}
            />
          )}
          <div className="content">
            {activePage === 'overview' && (
              <>
                <StatCards jobs={jobs} />
                <OverviewCharts jobs={jobs} />
                <RecentListings jobs={jobs} onSelect={setSelectedJob} />
              </>
            )}

            {activePage === 'listings' && (
              <JobList
                jobs={filteredJobs}
                selectedJob={selectedJob}
                onSelect={setSelectedJob}
              />
            )}

            {activePage === 'analytics' && (
              <Analytics jobs={jobs} />
            )}

            {activePage === 'history' && (
              <ScrapeHistory />
            )}

            {activePage === 'health' && (
              <ScraperHealth />
            )}
          </div>
          <DetailPanel job={selectedJob} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;