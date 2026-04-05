import re
from collections import Counter
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Job, ScrapeLog
from .scraper import run_scrape


def listings_view(request):
    jobs = list(Job.objects.values())
    return JsonResponse(jobs, safe=False)


@csrf_exempt
def scrape_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
    count = run_scrape()
    return JsonResponse({'saved': count})


def last_scraped_view(request):
    log = ScrapeLog.objects.order_by('-scraped_at').first()
    if not log:
        return JsonResponse({'last_scraped': None})
    return JsonResponse({'last_scraped': log.scraped_at.isoformat()})


def scrape_history_view(request):
    logs = list(ScrapeLog.objects.order_by('-scraped_at').values())
    return JsonResponse(logs, safe=False)


# NEW: returns aggregated data for the three row-3 analytics charts.
# Computes everything in Python so the frontend makes one request instead of three.
def analytics_view(request):
    jobs = Job.objects.all()

    # --- Top hiring companies ---
    # Filter out blank/null company names before counting
    company_counts = Counter(
        j.company for j in jobs if j.company and j.company.strip()
    )
    top_companies = [
        {"name": name, "count": count}
        for name, count in company_counts.most_common(8)
    ]

    # --- Top job locations ---
    # Strip state/country suffixes to get the city-level label where possible
    location_counts = Counter(
        j.location.split(",")[0].strip()
        for j in jobs
        if j.location and j.location.strip()
    )
    top_locations = [
        {"name": name, "count": count}
        for name, count in location_counts.most_common(8)
    ]

    # --- Job type breakdown ---
    # Normalise raw jobspy values (fulltime, parttime, etc.) to readable labels
    TYPE_MAP = {
        "fulltime": "Full-time",
        "full-time": "Full-time",
        "full_time": "Full-time",
        "parttime": "Part-time",
        "part-time": "Part-time",
        "part_time": "Part-time",
        "contract": "Contract",
        "internship": "Internship",
        "temporary": "Temporary",
    }
    job_type_counts = Counter()
    for j in jobs:
        raw = (j.job_type or "").strip().lower()
        label = TYPE_MAP.get(raw, "Other" if raw else "Unknown")
        job_type_counts[label] += 1

    job_types = [
        {"name": name, "count": count}
        for name, count in job_type_counts.most_common()
    ]

    return JsonResponse({
        "top_companies": top_companies,
        "top_locations": top_locations,
        "job_types": job_types,
    })


# NEW: scans all job descriptions for a curated list of Python-ecosystem keywords
# and returns each keyword's frequency across the entire job corpus.
SKILL_KEYWORDS = [
    "Python", "Django", "Flask", "FastAPI", "REST", "GraphQL",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "Celery",
    "Docker", "Kubernetes", "AWS", "GCP", "Azure",
    "React", "TypeScript", "JavaScript", "Node.js",
    "Machine Learning", "TensorFlow", "PyTorch", "Pandas", "NumPy",
    "Git", "CI/CD", "Linux", "Terraform", "Spark",
]

def skills_view(request):
    descriptions = Job.objects.exclude(description=None).values_list("description", flat=True)
    counts = Counter()
    for desc in descriptions:
        text = desc.lower()
        for kw in SKILL_KEYWORDS:
            if kw.lower() in text:
                counts[kw] += 1

    skills = [{"skill": kw, "count": counts[kw]} for kw in SKILL_KEYWORDS if counts[kw] > 0]
    skills.sort(key=lambda x: x["count"], reverse=True)
    return JsonResponse({"skills": skills})

from itertools import combinations

BUNDLE_KEYWORDS = [
    "Python", "Django", "Flask", "FastAPI", "REST", "TypeScript",
    "JavaScript", "Node.js", " Docker", "Kubernetes", "AWS", "GCP",
    "PostgreSQL", "MongoDB", "Redis", "Celery", "Pandas", "NumPy",
    "TensorFlow", "PyTorch", "Git", "CI/CD", "Linux", "Terraform", "Spark",
]

def tech_bundles_view(request):
    descriptions = Job.objects.exclude(description=None).values_list("description", flat=True)
    pair_counts = Counter()
    for desc in descriptions:
        text = desc.lower()
        present = [kw for kw in BUNDLE_KEYWORDS if kw.lower() in text]
        for pair in combinations(present, 2):
            pair_counts[" + ".join(pair)] += 1
    top_pairs = [{"name": pair, "count": count} for pair, count in pair_counts.most_common(10)]
    return JsonResponse({"bundles": top_pairs})

def posting_hotzones_view(request):
    dates = Job.objects.exclude(date_scraped=None).values_list("date_scraped", flat=True)
    
    day_counts = Counter()
    hour_counts = Counter
    
    DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    
    for dt in dates:
        day_counts[DAYS[dt.weekday()]] += 1
        hour_counts[dt.hour] += 1
        
    days = [{"day": day, "count": day_counts[day]} for day in DAYS]
    hours = [{"name": f"{h:02d}:00", "count" : hour_counts[h]} for h in range(24)]
    
    return JsonResponse({"days": days, "hours": hours})

def month_over_month_view(request):
    from django.db.models.functions import TruncMonth
    from django.db.models import Count
    
    monthly = (
        Job.objects
        .annotate(month=TruncMonth('date_scraped'))
        .values('month')
        .annotate(count=Count('id'))
        .order_by('month')
    )
    
    result = [
        {
            "name": entry['month'].strftime('%b %Y'),
            "count": entry['count']
        }
        for entry in monthly
    ]
    
    return JsonResponse({"monthly_counts": result})

def rating_vs_salary_view(request):
    jobs = Job.objects.exclude(company_rating=None).exclude(min_amount=None)
    result = [
        {
            "company": j.company or "Unknown",
            "rating": j.company_rating,
            "salary": round(j.min_amount / 1000, 1),
        }
        
        for j in jobs
        if j.min_amount > 0
    ]
    return JsonResponse({"points": result})
    


# NEW: classifies each job description into an experience level by scanning for
# seniority signals in the text. Returns a count per level for the distribution chart.
EXPERIENCE_PATTERNS = {
    "Lead":   [r"\blead\b", r"\bstaff\b", r"\bprincipal\b", r"\bdirector\b"],
    "Senior": [r"\bsenior\b", r"\bsr\.?\b", r"\b5\+?\s*years?\b", r"\b6\+?\s*years?\b", r"\b7\+?\s*years?\b"],
    "Mid":    [r"\bmid[- ]?level\b", r"\b3\+?\s*years?\b", r"\b4\+?\s*years?\b"],
    "Junior": [r"\bjunior\b", r"\bjr\.?\b", r"\bentry[- ]?level\b", r"\b0-2\s*years?\b", r"\b1\+?\s*years?\b"],
}

def experience_view(request):
    descriptions = Job.objects.exclude(description=None).values_list("description", flat=True)
    counts = Counter({"Junior": 0, "Mid": 0, "Senior": 0, "Lead": 0})
    unclassified = 0

    for desc in descriptions:
        text = desc.lower()
        matched = False
        # Check from most senior downward so "Lead" wins over "Senior" if both match
        for level in ["Lead", "Senior", "Mid", "Junior"]:
            if any(re.search(p, text) for p in EXPERIENCE_PATTERNS[level]):
                counts[level] += 1
                matched = True
                break
        if not matched:
            unclassified += 1

    result = [{"level": level, "count": counts[level]} for level in ["Junior", "Mid", "Senior", "Lead"]]
    result.append({"level": "Unspecified", "count": unclassified})
    return JsonResponse({"experience": result})


# NEW: maps each job description to an industry sector using keyword matching.
# Returns a count per sector for the industry breakdown chart.
INDUSTRY_KEYWORDS = {
    "FinTech":      ["fintech", "finance", "banking", "payments", "lending", "trading", "insurance"],
    "HealthTech":   ["health", "medical", "healthcare", "clinical", "pharma", "biotech", "hospital"],
    "E-commerce":   ["e-commerce", "ecommerce", "retail", "marketplace", "shopify", "woocommerce"],
    "EdTech":       ["edtech", "education", "learning", "lms", "e-learning", "tutoring", "curriculum"],
    "SaaS":         ["saas", "software as a service", "cloud platform", "b2b software"],
    "Cybersecurity":["security", "cybersecurity", "infosec", "soc", "penetration", "firewall"],
    "AI / ML":      ["machine learning", "artificial intelligence", "deep learning", "nlp", "computer vision"],
    "Logistics":    ["logistics", "supply chain", "warehouse", "shipping", "delivery", "fleet"],
    "Media":        ["media", "streaming", "content", "publishing", "advertising", "broadcast"],
}

def industry_view(request):
    descriptions = Job.objects.exclude(description=None).values_list("description", flat=True)
    counts = Counter()
    unclassified = 0

    for desc in descriptions:
        text = desc.lower()
        matched = False
        for sector, keywords in INDUSTRY_KEYWORDS.items():
            if any(kw in text for kw in keywords):
                counts[sector] += 1
                matched = True
                break
        if not matched:
            unclassified += 1

    result = [{"sector": sector, "count": counts[sector]} for sector in INDUSTRY_KEYWORDS if counts[sector] > 0]
    result.sort(key=lambda x: x["count"], reverse=True)
    result.append({"sector": "Other", "count": unclassified})
    return JsonResponse({"industries": result})


# NEW: returns all ScrapeLog entries with the new instrumentation fields,
# ordered newest first. Powers the Scraper Health tab.
def scraper_health_view(request):
    logs = list(ScrapeLog.objects.order_by('-scraped_at').values(
        'id', 'scraped_at', 'jobs_saved', 'jobs_attempted', 'duplicates_skipped', 'source'
    ))
    # Compute success rate per run as a convenience field for the frontend
    for log in logs:
        attempted = log['jobs_attempted']
        log['success_rate'] = (
            round((log['jobs_saved'] / attempted) * 100, 1) if attempted > 0 else 0
        )
        log['duplicate_rate'] = (
            round((log['duplicates_skipped'] / attempted) * 100, 1) if attempted > 0 else 0
        )
    return JsonResponse({"logs": logs})