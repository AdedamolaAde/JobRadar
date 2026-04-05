# data-dashboard

The `data-dashboard` project is a comprehensive web application designed to collect, process, and visualize specific data, likely related to job listings, through an interactive dashboard. It employs a full-stack architecture, combining a robust Django backend for data management and API services with a dynamic React frontend for user interaction and data visualization. The application also integrates a dedicated scraping module to gather raw data periodically or on demand.

## Features

This project provides a rich set of features to manage and analyze data effectively:

*   **Interactive Dashboard:** A central `Dashboard.jsx` component presenting key metrics and visualizations.
*   **Overview Charts:** Dynamic charts and graphs rendered by `OverviewCharts.jsx` for data trend analysis.
*   **Statistical Cards:** Quick summary statistics provided by `StatCards.jsx` for at-a-glance insights.
*   **Job Listing Display:** `JobList.jsx` and `RecentListings.jsx` components for browsing and viewing detailed job information.
*   **Advanced Filtering:** `FiltersPanel.jsx` allows users to refine data based on various criteria.
*   **Detailed Data Panels:** `DetailPanel.jsx` to show comprehensive information for selected data entries.
*   **Data Analytics Views:** Dedicated `Analytics.jsx` components for deeper data exploration.
*   **Integrated Data Scraper:** A Python-based `scraper.py` and `scrape.py` module for automated data collection.
*   **Scraping History and Health Monitoring:** `ScrapeHistory.jsx` and `ScraperHealth.jsx` provide visibility into scraper operations and performance.
*   **RESTful API:** A well-defined API built with Django REST Framework (`serializers.py`, `views.py`, `urls.py`) to serve data to the frontend.
*   **Robust Data Models:** Backend models (`models.py`) to structure and store collected data, including jobs and scraping logs.
*   **Database Migrations:** Managed database schema evolution using Django's migration system.

## Tech Stack

The project leverages a modern and powerful tech stack to deliver a scalable and maintainable application:

**Frontend:**
*   **React.js:** A JavaScript library for building user interfaces.
*   **JavaScript (ES6+):** The primary language for frontend logic.
*   **HTML5:** Structure for web content.
*   **CSS3:** Styling for the user interface.
*   **npm / Yarn:** Package managers for frontend dependencies.

**Backend:**
*   **Python:** The core programming language for backend development.
*   **Django:** A high-level Python web framework for rapid development and clean design.
*   **Django REST Framework:** A powerful toolkit for building Web APIs.
*   **SQLite:** Default database for development and testing (`db.sqlite3`), easily configurable for PostgreSQL or MySQL in production.
*   **pip:** Package installer for Python.

## Project Structure

The project is organized into a clear structure separating backend and frontend components.

```
data-dashboard/
├── .gitignore                      # Git ignored files and directories
├── db.sqlite3                      # SQLite database file (development)
├── manage.py                       # Django's command-line utility
├── requirements.txt                # Python dependencies
├── frontend/                       # React frontend application
│   ├── public/                     # Static assets for the React app
│   │   ├── favicon.ico
│   │   ├── index.html              # Main HTML entry point
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── src/                        # React source code
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Analytics.jsx
│   │   │   ├── DetailPanel.jsx
│   │   │   ├── FiltersPanel.jsx
│   │   │   ├── JobList.jsx
│   │   │   ├── OverviewCharts.jsx
│   │   │   ├── RecentListings.jsx
│   │   │   ├── ScrapeHistory.jsx
│   │   │   ├── ScraperHealth.jsx
│   │   │   └── StatCards.jsx
│   │   ├── App.css
│   │   ├── App.js                  # Main React application component
│   │   ├── config.js               # Frontend configuration
│   │   ├── Dashboard.jsx           # Dashboard layout and logic
│   │   ├── Dashboard.css
│   │   ├── index.css
│   │   ├── index.js                # React application entry point
│   │   └── setupTests.js           # Frontend testing setup
│   ├── package-lock.json           # Frontend dependency lock file
│   └── package.json                # Frontend dependencies and scripts
└── data_dashboard_project/         # Main Django project directory
    ├── asgi.py                     # ASGI config for Django
    ├── settings.py                 # Django settings
    ├── urls.py                     # Project-level URL declarations
    ├── wsgi.py                     # WSGI config for Django
    └── __init__.py
    └── data_app/                   # A Django application for data management and scraping
        ├── migrations/             # Database migration files
        │   ├── 0001_initial.py
        │   ├── 0002_job_delete_joblisting.py
        │   ├── 0003_scrapelog.py
        │   ├── 0004_scrapelog_duplicates_skipped_and_more.py
        │   ├── 0005_job_company_rating.py
        │   └── __init__.py
        ├── __init__.py
        ├── admin.py                # Django admin site configuration
        ├── apps.py                 # Application configuration
        ├── jobs.py                 # Utility for job-related tasks (e.g., custom management commands)
        ├── models.py               # Database models for Job and ScrapeLog
        ├── scraper.py              # Core data scraping logic
        ├── serializers.py          # Django REST Framework serializers
        ├── tests.py                # Application-specific tests
        ├── urls.py                 # Application-specific URL declarations
        └── views.py                # API views and logic
    └── scrape.py                   # Standalone or supplementary scraping script

```

## Installation Instructions

Follow these steps to set up and run the `data-dashboard` project locally.

### Prerequisites

Ensure you have the following installed on your system:

*   **Python 3.8+**
*   **Node.js 14+**
*   **npm** (comes with Node.js) or **Yarn**

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/data-dashboard.git
    cd data-dashboard
    ```

2.  **Create a Python virtual environment:**
    ```bash
    python -m venv venv
    ```

3.  **Activate the virtual environment:**
    *   On macOS and Linux:
        ```bash
        source venv/bin/activate
        ```
    *   On Windows:
        ```bash
        venv\Scripts\activate
        ```

4.  **Install backend dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

5.  **Run database migrations:**
    ```bash
    python manage.py migrate
    ```

6.  **(Optional) Create a superuser** to access the Django admin panel:
    ```bash
    python manage.py createsuperuser
    ```

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install frontend dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

## Usage Instructions

After successful installation, you can run both the backend and frontend components.

### Start the Backend Server

1.  **Ensure your Python virtual environment is activated.** If not, navigate to the `data-dashboard` root directory and activate it:
    *   On macOS and Linux: `source venv/bin/activate`
    *   On Windows: `venv\Scripts\activate`

2.  **Run the Django development server:**
    ```bash
    python manage.py runserver
    ```
    The backend API will typically be accessible at `http://127.0.0.1:8000/`.

### Start the Frontend Development Server

1.  **Open a new terminal window or tab.**
2.  **Navigate to the `frontend` directory:**
    ```bash
    cd frontend
    ```
3.  **Start the React development server:**
    ```bash
    npm start
    # or
    yarn start
    ```
    The frontend application will open in your browser, usually at `http://localhost:3000/`.

### Data Scraping

The project includes a data scraping module. You can initiate a scrape operation through a custom Django management command:

1.  **Ensure your Python virtual environment is activated.**
2.  **Run the scraper command from the `data-dashboard` root directory:**
    ```bash
    python manage.py scrape_data
    ```
    *(Note: The exact command `scrape_data` is an example; refer to the `jobs.py` or `scraper.py` files for the actual custom management command defined, or if scraping is triggered via a view/API endpoint.)*

## License Information

This project is licensed under the MIT License. See the `LICENSE` file (if present) or the license description below for details.

```
MIT License

Copyright (c) [Year] [Your Name or Organization]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```