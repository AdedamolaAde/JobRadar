from django.urls import path
from . import views

urlpatterns = [
    path('listings/', views.listings_view, name='listings'),
    path('scrape/', views.scrape_view, name='scrape'),
    path('last-scraped/', views.last_scraped_view, name='last-scraped'),
    path('scrape-history/', views.scrape_history_view, name='scrape-history'),

    # NEW: analytics aggregations (row-3 charts + future expansion)
    path('analytics/', views.analytics_view, name='analytics'),
    path('analytics/skills/', views.skills_view, name='analytics-skills'),
    path('analytics/experience/', views.experience_view, name='analytics-experience'),
    path('analytics/industry/', views.industry_view, name='analytics-industry'),

    # NEW: scraper health tab data
    path('scraper-health/', views.scraper_health_view, name='scraper-health'),
    
    path('analytics/bundles/', views.tech_bundles_view, name='analytics-bundles'),
    
    path('analytics/hotzones/', views.posting_hotzones_view, name='analytics-hotzones'),
    
    path('analytics/month-over-month/', views.month_over_month_view, name='analytics-mom'),
    
    path('analytics/rating-vs-salary/', views.rating_vs_salary_view, name='analytics-rating-salary'),
]