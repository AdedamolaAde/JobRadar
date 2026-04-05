const CONTINENT_MAP = {
  'USA': 'North America', 'United States': 'North America', 'Canada': 'North America', 'Mexico': 'North America',
  'UK': 'Europe', 'United Kingdom': 'Europe', 'Germany': 'Europe', 'France': 'Europe',
  'Netherlands': 'Europe', 'Spain': 'Europe', 'Italy': 'Europe', 'Poland': 'Europe',
  'Australia': 'Oceania', 'New Zealand': 'Oceania',
  'India': 'Asia', 'Singapore': 'Asia', 'Japan': 'Asia', 'China': 'Asia',
  'Nigeria': 'Africa', 'South Africa': 'Africa', 'Kenya': 'Africa',
  'Brazil': 'South America', 'Argentina': 'South America',
};

function FiltersPanel({ jobs, filters, onChange }) {
  const sources = [...new Set(jobs.map(j => j.site).filter(Boolean))];

  const maxSalaryInData = Math.max(
    ...jobs.map(j => j.max_amount).filter(s => s !== null && s !== undefined && s > 0),
    200000
  );

  const countries = [...new Set(
    jobs.map(j => {
      if (!j.location) return null;
      const parts = j.location.split(',');
      return parts[parts.length - 1].trim();
    }).filter(Boolean)
  )].sort();

  const continents = [...new Set(
    countries.map(c => CONTINENT_MAP[c] || 'Other')
  )].sort();

  return (
    <div className="filters-panel">
      <div className="filters-title">Filters</div>

      <div className="filter-group">
        <div className="filter-label">Work type</div>
        {['Remote', 'Hybrid', 'On-site'].map(type => (
          <label className="filter-check" key={type}>
            <input
              type="checkbox"
              checked={filters.workTypes.includes(type)}
              onChange={() => {
                const updated = filters.workTypes.includes(type)
                  ? filters.workTypes.filter(t => t !== type)
                  : [...filters.workTypes, type];
                onChange({ ...filters, workTypes: updated });
              }}
            />
            {type}
          </label>
        ))}
      </div>

      <div className="filter-group">
        <div className="filter-label">Source</div>
        {sources.map(source => (
          <label className="filter-check" key={source}>
            <input
              type="checkbox"
              checked={filters.sources.includes(source)}
              onChange={() => {
                const updated = filters.sources.includes(source)
                  ? filters.sources.filter(s => s !== source)
                  : [...filters.sources, source];
                onChange({ ...filters, sources: updated });
              }}
            />
            {source.charAt(0).toUpperCase() + source.slice(1)}
          </label>
        ))}
      </div>

      <div className="filter-group">
        <div className="filter-label">Continent</div>
        {continents.map(continent => (
          <label className="filter-check" key={continent}>
            <input
              type="checkbox"
              checked={filters.continents.includes(continent)}
              onChange={() => {
                const updated = filters.continents.includes(continent)
                  ? filters.continents.filter(c => c !== continent)
                  : [...filters.continents, continent];
                onChange({ ...filters, continents: updated });
              }}
            />
            {continent}
          </label>
        ))}
      </div>

      <div className="filter-group">
        <div className="filter-label">Country</div>
        {countries.map(country => (
          <label className="filter-check" key={country}>
            <input
              type="checkbox"
              checked={filters.countries.includes(country)}
              onChange={() => {
                const updated = filters.countries.includes(country)
                  ? filters.countries.filter(c => c !== country)
                  : [...filters.countries, country];
                onChange({ ...filters, countries: updated });
              }}
            />
            {country}
          </label>
        ))}
      </div>

      <div className="filter-group">
        <div className="filter-label">
          Min salary — ${Math.round(filters.minSalary / 1000)}k
        </div>
        <input
          type="range"
          min="0"
          max={maxSalaryInData}
          step="5000"
          value={filters.minSalary}
          onChange={e => onChange({ ...filters, minSalary: Number(e.target.value) })}
          className="filter-range"
        />
      </div>

      <div className="filter-group">
        <div className="filter-label">Date posted</div>
        {[
          { label: 'Any time', value: 'any' },
          { label: 'Today', value: 'today' },
          { label: 'Last 3 days', value: '3days' },
          { label: 'Last 7 days', value: '7days' },
        ].map(opt => (
          <label className="filter-check" key={opt.value}>
            <input
              type="radio"
              name="datePosted"
              checked={filters.datePosted === opt.value}
              onChange={() => onChange({ ...filters, datePosted: opt.value })}
            />
            {opt.label}
          </label>
        ))}
      </div>

      <button
        className="filter-reset"
        onClick={() => onChange({
          workTypes: [],
          sources: [],
          minSalary: 0,
          datePosted: 'any',
          continents: [],
          countries: [],
        })}
      >
        Reset filters
      </button>
    </div>
  );
}

export default FiltersPanel;