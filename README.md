# TripNYC 🚕

TripNYC is a comprehensive data-driven web application designed to help tourists and commuters plan their travel in New York City more efficiently. By leveraging tens of millions of trip records from the NYC Taxi & Limousine Commission (TLC), the project provides actionable insights into urban transportation patterns and costs.

## Project Description

TripNYC analyzes historical NYC taxi and for-hire vehicle (FHV) data to provide users with:

- 💰 **Trip Cost Estimation**: Compare estimated trip costs across different providers (Uber, Lyft, Yellow/Green taxis)
- ⏱️ **Travel Time Predictions**: Get historical average travel times for your routes
- 🚦 **Traffic Dashboard**: Visualize area-level traffic intensity and patterns by hour
- ♿ **Accessibility Insights**: Monitor Wheelchair Accessible Vehicle (WAV) request fulfillment rates and wait times
- 🗺️ **Route Hotspots**: Discover the busiest routes during different time slots
- 📍 **Smart Recommendations**: Get suggested destinations based on popular travel patterns

The application features an interactive map interface, real-time data visualization using charts, and a user-friendly design that makes trip planning intuitive and efficient.

---

## Repository Structure

```
TirpNYC/
├── 0_Data_processing/          # Data cleaning and preprocessing notebooks
│   ├── fhv_data_preprocessing_updated.ipynb
│   ├── green_data_preprocessing_updated.ipynb
│   ├── yellow_data_processing.ipynb
│   ├── load_parquet.ipynb
│   └── statistics.ipynb
│
├── backend/                    # Node.js/Express API server
│   ├── tripnyc_backend.js     # Main server file with API endpoints
│   ├── queries.js             # SQL query definitions
│   ├── create_indexes.js      # Database index creation scripts
│   └── package.json           # Backend dependencies
│
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── App.jsx            # Main application component with all pages
│   │   ├── ZoneMarkerMap.jsx  # Interactive Leaflet map component
│   │   ├── main.jsx           # React entry point
│   │   └── assets/            # Static assets
│   ├── public/                # Public assets
│   ├── index.html             # HTML template
│   ├── package.json           # Frontend dependencies
│   └── vite.config.js         # Vite configuration
│
├── Dockerfile                  # Docker configuration for deployment
├── LICENSE                     # Project license
└── README.md                   # This file
```

### Directory Descriptions

- **`0_Data_processing/`**: Contains Jupyter notebooks for downloading, cleaning, and preprocessing raw TLC PARQUET data files. These notebooks transform raw data into clean CSV files ready for database ingestion.

- **`backend/`**: Node.js server using Express and PostgreSQL. Handles all API requests, database queries, and business logic for trip estimation, traffic analysis, accessibility reports, and route hotspots.

- **`frontend/`**: React application built with Vite. Provides an interactive user interface with features like trip planning, interactive maps (Leaflet), data visualization (Recharts), and responsive design (Tailwind CSS).

---

## 🚀 How to Run the Project Locally

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)
- **PostgreSQL** database with TLC trip data loaded
- Git

### Branch Information

- **`fix-recommendation`**: Main development branch for running the project locally
- **`deployment`**: Production branch configured with Docker for deployment

### Setup Instructions

#### 1. Clone the Repository
```bash
git clone https://github.com/Youni2017/TirpNYC.git
cd TirpNYC
```

#### 2. Checkout the Local Development Branch
```bash
git checkout fix-recommendation
```

#### 3. Set Up the Backend
```bash
cd backend
npm install
node tripnyc_backend.js
```

The backend server will start on `http://localhost:3001`

**Note**: Make sure your PostgreSQL database is running and properly configured with the TLC trip data.

#### 4. Set Up the Frontend (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

The frontend development server will start on `http://localhost:5173`

#### 5. Access the Application

Open your browser and navigate to `http://localhost:5173`

### Docker Deployment

For deployment using Docker, switch to the `deployment` branch:

```bash
git checkout deployment
docker build -t tripnyc .
docker run -p 3000:3000 tripnyc
```

---

## 📊 Dataset Overview

TripNYC uses **official NYC TLC trip record data** for **August 2024**.  
The raw files are provided in **PARQUET** format and are publicly available:

- **Yellow Taxi Trip Records (2024-08)**  
  https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2024-08.parquet

- **Green Taxi Trip Records (2024-08)**  
  https://d37ci6vzurychx.cloudfront.net/trip-data/green_tripdata_2024-08.parquet

- **High-Volume For-Hire Vehicle Trip Records (Uber/Lyft/Via, 2024-08)**  
  https://d37ci6vzurychx.cloudfront.net/trip-data/fhvhv_tripdata_2024-08.parquet

These PARQUET files are downloaded and converted into CSV using `pandas` before being loaded into PostgreSQL.

---

## Technology Stack

**Frontend:**
- React 18
- Vite (build tool)
- Tailwind CSS (styling)
- Leaflet & react-leaflet (interactive maps)
- Recharts (data visualization)
- lucide-react (icons)

**Backend:**
- Node.js
- Express.js
- PostgreSQL

**Data Processing:**
- Python
- Pandas
- Jupyter Notebooks

---

## Features

### 1. Trip Planner
- Interactive map for selecting start and end locations
- Cost comparison across taxi types and FHV providers
- Time-based trip estimation
- Recommended destinations based on popular routes

### 2. Traffic Dashboard
- Hourly traffic patterns visualization
- Workday vs. weekend comparison
- Interactive zone selection on map
- Line charts showing trip volume trends

### 3. Route Hotspots
- Top 10 busiest routes by time slot
- Visual route representation on map
- Average fare information
- Clickable table for route exploration

### 4. Accessibility Report
- WAV request fulfillment rates by provider
- Wait time disparity analysis (WAV vs. non-WAV)
- Request volume statistics
- Animated data visualization

---

## 👥 Contributors

- [Youni Chen](https://github.com/Youni2017)
- [Feiyang Jin](https://github.com/feiyanj)
- [Mengyang Xu](https://github.com/character331)
- [Qingyang Feng](https://github.com/Robert-fengy)

---

## 🙏 Acknowledgments

Data provided by the NYC Taxi & Limousine Commission (TLC).

Made with ❤️ for CIS 5500 - Database & Information Systems
