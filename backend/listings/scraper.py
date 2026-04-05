import pandas as pd
from jobspy import scrape_jobs
from .models import Job, ScrapeLog


def run_scrape(search_term="Python Developer", location="", results_wanted=50):
    print(f"Scraping for: {search_term} in {location}...")

    jobs = scrape_jobs(
        site_name=["linkedin", "indeed", "glassdoor"],
        search_term=search_term,
        location=location,
        results_wanted=results_wanted,
        hours_old=72,
    )

    if jobs is None or jobs.empty:
        print("No jobs returned from scraper.")
        return 0

    # NEW: capture total rows before any filtering for jobs_attempted
    jobs_attempted = len(jobs)

    count = 0
    # NEW: track how many rows were skipped as duplicates
    duplicates = 0

    for _, row in jobs.iterrows():
        job_url = row.get("job_url", None)

        if job_url and Job.objects.filter(job_url=job_url).exists():
            # NEW: increment duplicate counter instead of silently skipping
            duplicates += 1
            continue

        Job.objects.create(
            site=row.get("site", None),
            title=row.get("title", None),
            company=row.get("company", None),
            company_url=row.get("company_url", None) or None,
            location=row.get("location", None),
            is_remote=bool(row.get("is_remote", False)),
            job_type=row.get("job_type", None),
            job_function=row.get("job_function", None),
            date_posted=row.get("date_posted", None) if pd.notna(row.get("date_posted")) else None,
            min_amount=row.get("min_amount", None) if pd.notna(row.get("min_amount")) else None,
            max_amount=row.get("max_amount", None) if pd.notna(row.get("max_amount")) else None,
            currency=row.get("currency", None),
            job_url=job_url or None,
            description=row.get("description", None),
            company_rating=row.get("company_rating", None) if pd.notna(row.get("company_rating", None) or float('nan')) else None,
        )
        count += 1

    print(f"Saved {count} new jobs. Skipped {duplicates} duplicates.")

    # NEW: pass all three new fields into ScrapeLog
    ScrapeLog.objects.create(
        jobs_saved=count,
        jobs_attempted=jobs_attempted,
        duplicates_skipped=duplicates,
        source="linkedin, indeed, glassdoor",
    )
    return count