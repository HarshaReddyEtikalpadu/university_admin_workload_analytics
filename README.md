# 🏫 Silverleaf Academy — Admin Workload Analysis Dashboard


A **modern, data-driven web application** designed to analyze and visualize administrative workload patterns at **Silverleaf Academy**.  
It transforms raw CSV data into actionable insights using **interactive dashboards**, **real-time analytics**, and **data-driven recommendations** to improve decision-making and efficiency.

---

## 🧭 Table of Contents
- [Overview](#-overview)
- [Core Features](#-core-features)
- [Dashboard Modules](#-dashboard-modules)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Sample Data Highlights](#-sample-data-highlights)
- [Customization Guide](#-customization-guide)
- [Development & Build](#-development--build)
- [Future Enhancements](#-future-enhancements)
- [Contributors](#-contributors)
- [License](#-license)
- [Useful References](#-useful-references)

---

## 🚀 Overview

The **Admin Workload Analysis Dashboard** provides a holistic view of administrative operations across departments.  
It helps administrators monitor workload distribution, identify performance bottlenecks, and assess KPIs in real-time.

---

## ✨ Core Features

### 🔐 Role-Based Access (Demo Mode)
- Built-in **role hierarchy** (Admin, Manager, Registrar, etc.)
- Current version supports **single-demo admin** (`John Smith`)
- Extendable for multi-role authentication
- Session managed securely in `sessionStorage`

---

### 📊 Real-Time Analytics
- **8 KPI Cards** with real-time trends:
  - Total Requests  
  - Total Hours Spent  
  - Total Cost  
  - Average Processing Time  
  - Approval Rate  
  - Rejection Rate  
  - Pending Requests  
  - Error Rate
- **Interactive Charts**
  - Pie Chart → Request distribution  
  - Bar Chart → Avg processing time by type  
  - Line Chart → Monthly workload trend  
- **Heatmap** for peak workload hours  
- **Statistical analysis** (Mean, Median, Std Dev, Correlation)  
- **Automated recommendations** with improvement insights  

---

### 🗂️ Data Management
- Advanced filters: Department, Priority, Status, Request Type  
- Instant search (debounced input)  
- Sortable & paginated tables (10 rows/page)  
- CSV export with column selection  
- Real-time data refresh  

---

### 💎 Modern UI/UX
- Built using **React + Tailwind CSS**
- Fully **responsive layout**
- **Clean, minimal, and professional** UI  
- Smooth animations and page transitions  
- Consistent color palette and spacing system  

---

## 🧠 Dashboard Modules

| Module | Description |
|---------|-------------|
| **Dashboard Overview** | Displays core KPIs, totals, and trends |
| **Analytics** | Charts (Pie, Bar, Line, Heatmap) for performance visualization |
| **Recommendations** | AI-style insights & optimization tips |
| **Tasks / Reports** | Operational summaries and exports |
| **Team (Upcoming)** | Manage users, roles, and department assignments |
| **Calendar (Upcoming)** | Department schedules, events, and workload planning |

---

## 🛠️ Tech Stack

| Layer | Technology |
|--------|-------------|
| **Frontend** | React 18 (Vite) |
| **Styling** | Tailwind CSS |
| **Routing** | React Router DOM |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **CSV Parsing** | Papa Parse |
| **Data Storage** | Client-side CSV / Local Session |

---## 📈 Future Enhancements

- 🔒 **JWT / OAuth-based Authentication**  
  Implement secure login and session management with industry-standard authentication mechanisms.

- 🌐 **Backend API (Node.js + Express + PostgreSQL)**  
  Add RESTful APIs for dynamic data fetching, analytics computation, and persistent storage.

- 🧾 **Export to Excel / PDF**  
  Enable downloadable reports and analytics summaries for offline sharing and record-keeping.

- 📆 **Interactive Calendar View**  
  Visualize department schedules, requests, and workload timelines with drag-and-drop events.

- 👥 **Team Management & Role Control**  
  Manage admin users, departments, and access levels through a centralized interface.

- 📱 **Progressive Web App (PWA) Support**  
  Allow offline access, faster load times, and mobile install capability for enhanced usability.

---

## 🔗 Useful References

- [React Documentation](https://react.dev/)  
- [Vite Documentation](https://vitejs.dev/)  
- [Tailwind CSS](https://tailwindcss.com/)  
- [Recharts Documentation](https://recharts.org/en-US/)

---

> **Built with ❤️ by the Silverleaf Academy Research Team**  
> *Empowering data-driven academic administration.*
