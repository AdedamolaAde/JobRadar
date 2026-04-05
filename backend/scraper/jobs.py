import jobspy
import pandas as pd
from datetime import date
from listings.models import JobListing


def scrape_jobs(search_term="Python Developer", location="Remote", results_wanted=50):
    print(f"Scraping jobs for '{search_term}' in '{location}'...")

    jobs: pd.DataFrame = jobspy.scrape_jobs(
        site_name=["indeed", "linkedin", "glassdoor"],
        search_term=search_term,
        location=location,
        results_wanted=results_wanted,
        hours_old=72,
        country_indeed="USA",
    )

    if jobs.empty:
        print("No jobs found.")
        return 0

    print(f"Found {len(jobs)} jobs. Saving to database...")

    saved  = 0
    skipped = 0

    for _, row in jobs.iterrows():
        try:
            _, created = JobListing.objects.get_or_create(
                job_url=row.get("job_url", ""),
                defaults={
                    "title":            row.get("title", ""),
                    "company":          row.get("company", ""),
                    "location":         row.get("location", ""),
                    "job_type":         row.get("job_type", "") or "",
                    "salary_min":       row.get("min_amount") if pd.notna(row.get("min_amount")) else None,
                    "salary_max":       row.get("max_amount") if pd.notna(row.get("max_amount")) else None,
                    "salary_currency":  row.get("currency", "") or "",
                    "description":      row.get("description", "") or "",
                    "site":             row.get("site", ""),
                    "date_posted":      row.get("date_posted") if pd.notna(row.get("date_posted")) else None,
                }
            )
            if created:
                saved += 1
            else:
                skipped += 1
        except Exception as e:
            print(f"Error saving job: {e}")
            continue

    print(f"Done. Saved: {saved} new | Skipped: {skipped} duplicates")
    return saved