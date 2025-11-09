# Admin Workload Analysis Dashboard

A comprehensive web-based dashboard for analyzing administrative workload at Silverleaf Academy. This research project visualizes administrative workload data, provides statistical analysis, and offers data-driven recommendations.

## 🚀 Features

- **Role-Based Access Control (demo)**: The project includes role concepts. For this initial delivery the app runs in a single-admin demo mode by default (one demo user: John Smith). You can later enable or add more demo roles.

- **Real-Time Analytics**:
  - 8 KPI metric cards with trend indicators
  - Interactive charts (Pie, Bar, Line)
  - Heatmap visualization of peak workload hours
  - Statistical analysis and correlations
  - Data-driven recommendations

- **Data Management**:
  - Advanced filtering (Department, Status, Priority, Type)
  - Real-time search functionality
  - Sortable data tables
  - CSV export capability
  - Pagination support

- **Modern UI/UX**:
  - Clean, professional design
  - Responsive layout (mobile, tablet, desktop)
  - Smooth animations and transitions
  - Intuitive navigation

## 🛠️ Tech Stack

- **Framework**: React 18.x
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **CSV Parsing**: Papa Parse
- **Routing**: React Router DOM

## 📦 Installation

1. **Clone or navigate to the project directory**:
```bash
cd admin-workload-dashboard
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start the development server**:
```bash
npm run dev
```

4. **Open your browser**:
Navigate to `http://localhost:5173` (or the URL shown in terminal)

## 🎯 Usage

### Login

The app uses a simple demo sign-in. By default you will see a single demo admin (John Smith). Clicking the card logs you in (no password required) and stores the session in `sessionStorage`.

Notes:
- This is client-side demo auth only. For production, replace with a proper backend authentication flow.
- The code is structured to support multiple roles; we default to a single admin for this initial build.

### Dashboard Features

#### KPI Cards
- Total Requests
- Total Hours Spent
- Total Cost
- Average Processing Time
- Approval Rate
- Rejection Rate
- Pending Requests
- Error Rate

#### Charts
- **Pie Chart**: Distribution of requests by type
- **Bar Chart**: Average processing time by request type
- **Line Chart**: Monthly workload trend (6 months)

#### Heatmap
- Visual representation of peak workload hours
- Color-coded by intensity (Low, Medium, High, Peak)
- Shows hour x day matrix (Mon-Fri, 8 AM - 5 PM)

#### Statistical Analysis
- Descriptive statistics (Mean, Median, Std Dev, Mode)
- Correlation analysis
- Key findings (Critical, Warning, Positive)

#### Recommendations
- Priority-based action items
- Current vs target metrics
- Potential savings
- Automation potential progress bars

#### Data Table
- Sortable columns
- Filterable by type, status, priority
- Search functionality
- Pagination (10 rows per page)
- Export to CSV

## 📁 Project Structure

```
admin-workload-dashboard/
├── public/
│   ├── data/                      # CSV data files (optional)
│   │   ├── requests.csv
│   │   ├── admins.csv
│   │   ├── departments.csv
│   │   ├── request_types.csv
│   │   ├── workload_log.csv
│   │   └── daily_summary.csv
│   └── index.html
│
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── LoginPage.jsx
│   │   ├── MetricCard.jsx
│   │   ├── Charts/
│   │   │   ├── PieChartComponent.jsx
│   │   │   ├── BarChartComponent.jsx
│   │   │   ├── LineChartComponent.jsx
│   │   │   └── HeatmapTable.jsx
│   │   ├── DataTable.jsx
│   │   └── AnalysisSection.jsx
│   │
│   ├── pages/                    # Main page components
│   │   └── Dashboard.jsx
│   │
│   ├── utils/                    # Helper functions
│   │   ├── constants.js
│   │   ├── dataLoader.js
│   │   ├── calculations.js
│   │   ├── filters.js
│   │   └── sampleData.js
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useDataLoader.js
│   │   └── useFilters.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 📊 Data

The application uses sample data generation by default. If CSV files are placed in `public/data/`, they will be loaded automatically. Otherwise, the application generates 250+ sample requests with realistic patterns.

### Upload / Override (quick testing)

You can upload a `requests.csv` at runtime from the dashboard UI to override the loaded data for the current browser session. The top-right status bar on the dashboard includes an "Upload requests.csv" control. Uploaded data is parsed and stored in `sessionStorage` as a temporary override and the page will reload to apply it.

To clear the uploaded override, click "Clear Uploaded Data" in the same control. For multi-file/full replacement, place properly named CSVs under `public/data/` and reload the app.

### Sample Data Features

- 250+ requests across 5 request types
- 7 departments
- 5 admin users
- Realistic date distribution (last 6 months)
- Bias towards peak hours (Mon-Thu, 9-11 AM)
- Various statuses and priorities
- Processing times: 20-100 minutes

### CSV Format

If you want to use your own CSV files, they should follow this structure:

**requests.csv**:
```csv
request_id,request_number,student_id,department_id,department_name,request_type,priority,status,assigned_admin_id,assigned_admin_name,created_at,resolved_at,processing_time_minutes,estimated_time_minutes,manual_steps_count,error_count,requires_manual_review,complexity_score
```

## 🎨 Customization

### Colors

Edit `tailwind.config.js` to customize colors:
- `silverleaf-blue`: #003366
- `silverleaf-orange`: #FF8C42
- `primary-blue`: #3B82F6
- `primary-green`: #10B981

### Constants

Edit `src/utils/constants.js` to modify:
- Request types
- Departments
- User roles
- Demo users
- Chart colors

## 🚢 Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## 📝 Notes

- This is a demo/research application
- No password required for login (role selection only)
- Session is stored in sessionStorage
- CSV export currently logs to console (can be extended)
- Sample data is generated on each page load

## 🤝 Contributing

This is a research project for Silverleaf Academy. For modifications or improvements, please follow the existing code structure and styling patterns.

## 📄 License

This project is created for research purposes at Silverleaf Academy.

## 👨‍💻 Author

Silverleaf Academy Research Team

## 🔗 Links

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Recharts Documentation](https://recharts.org/)

---

**Built with ❤️ for Silverleaf Academy**
