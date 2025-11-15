# TripNYC 

TripNYC is a data-driven web application that helps tourists and commuters plan their travel in New York City more efficiently.  
By leveraging tens of millions of trip records from the NYC Taxi & Limousine Commission (TLC), the project provides insights into:

- 💰 Estimated trip cost across providers (Uber, Lyft, Yellow/Green taxis)  
- ⏳ Expected ride-hail wait time  
- 🚦 Area-level traffic intensity (inflow/outflow)  
- ♿ Accessibility performance (Wheelchair Accessible Vehicle requests)  
- 🗺 Popular routes during peak hours  

---

## Dataset Overview

TripNYC uses **official NYC TLC trip record data** for **August 2025**.  
The raw files are provided in **PARQUET** format and are publicly available:

- **Yellow Taxi Trip Records (2025-08, PARQUET)**  
  https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2025-08.parquet

- **Green Taxi Trip Records (2025-08, PARQUET)**  
  https://d37ci6vzurychx.cloudfront.net/trip-data/green_tripdata_2025-08.parquet

- **High-Volume For-Hire Vehicle Trip Records (Uber/Lyft/Via, 2025-08, PARQUET)**  
  https://d37ci6vzurychx.cloudfront.net/trip-data/fhvhv_tripdata_2025-08.parquet

These PARQUET files are first downloaded and then converted into CSV using `pandas` before being loaded into the database.

## Data Processing 

The [`0_Data_processing`](https://github.com/Youni2017/TirpNYC/tree/main/0_Data_processing) folder contains notebooks and scripts dedicated to cleaning and transforming raw TLC data. 
- `yellow_data_processing.ipynb`
- `green_data_preprocessing_1114.ipynb`
- `fhv_data_preprocessing_1114.ipynb`
- `load_parquet.ipynb`
Data processing is one component of the overall TripNYC project, and its goal is to produce clean, schema-consistent CSV files ready for ingestion into the database. These notebooks are used only for data cleaning.

## We’re just as excited as you are:)
- T
- B
- D

## Contributors
[Youni Chen](https://github.com/Youni2017), [Feiyang Jin](https://github.com/feiyanj), [Mengyang Xu](https://github.com/character331), [Qingyang Feng](https://github.com/Robert-fengy)
