# ShetNiyojan

ShetNiyojan is a comprehensive agricultural management system designed to empower farmers with data-driven insights for optimizing crop cultivation, health monitoring, and supply chain management.

<div align="center">
  <img src="Frontend/src/assets/logo.png" alt="ShetNiyojan Logo" width="120">
</div>

## Project Overview

ShetNiyojan integrates modern frontend technologies with advanced machine learning capabilities to create a complete farm management solution. The platform offers tools for each phase of the agricultural cycle - from planning and preparation to harvesting and distribution.

## Project Structure

The project follows a client-server architecture:

### Frontend
- Built with React + TypeScript + Vite
- Uses Tailwind CSS for styling and Shadcn UI components
- Responsive design for mobile, tablet, and desktop devices
- Interactive dashboards and visualizations
- Located in the `Frontend` directory

### Backend
- Built with Flask and Python
- MongoDB database for data persistence
- Machine learning models for crop recommendation, soil analysis, and disease detection
- AI-powered image analysis for plant health assessment
- RESTful API endpoints for frontend communication
- Located in the `Backend` directory

## Key Features

### Phase 1: Planning & Preparation
- **AI-Based Crop Prediction**: Get personalized crop recommendations based on soil composition, climate conditions, and historical yield data
- **Lease Marketplace**: Access equipment rental and field planning tools for efficient resource allocation

### Phase 2: Growing & Monitoring
- **Crop Health Monitoring**: 
  - Upload plant images for real-time disease detection
  - AI-powered diagnosis of plant health issues
  - Detailed treatment recommendations with dosage information
  - Voice input support for hands-free operation
- **Smart Irrigation**: Optimize water usage with intelligent scheduling based on weather forecasts and soil moisture levels

### Phase 3: Harvest & Distribution
- **Supply Chain Optimization**:
  - Transport route optimization for maximum profit
  - Market price analysis across different locations
  - Interactive maps for visualizing distribution options
- **Yield Management**: 
  - Comprehensive tracking of yields and performance metrics
  - Historical data analysis for continuous improvement

### Additional Features
- **User Authentication**: Secure mobile number-based login and registration system
- **Multilingual Support**: Language selection for broader accessibility
- **Responsive Design**: Optimized for all devices, from smartphones to desktops
- **Real-time Activity Tracking**: Keep track of all farm activities in one place

## Screenshots

(Screenshots would be placed here)

## Getting Started

### Prerequisites
- Node.js 16+
- Python 3.8+
- MongoDB
- API keys for external services (if applicable)

### Frontend Setup
1. Navigate to the Frontend directory:
   ```bash
   cd ShetNiyojan/Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The application will be available at `http://localhost:5173`

### Backend Setup
1. Navigate to the Backend directory:
   ```bash
   cd ShetNiyojan/Backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # On Windows
   .venv\Scripts\activate
   # On macOS/Linux
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   - Create a `.env` file based on the existing one
   - Add any required API keys for external services

5. Start the backend server:
   ```bash
   python app.py
   ```

6. The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/register`: Register a new user
- `POST /api/login`: Authenticate user and get token
- `GET /api/profile`: Get current user profile

### Yields Management
- `GET /api/yields`: Get all yields for current user
- `POST /api/yields`: Create a new yield
- `GET /api/yields/:id`: Get a specific yield
- `PUT /api/yields/:id`: Update a yield
- `DELETE /api/yields/:id`: Delete a yield

### Crop Health
- `POST /api/crop-health`: Upload plant image for disease detection

### Crop Recommendation
- `POST /api/crop-prediction`: Get crop recommendations based on soil and climate data

### Supply Chain
- `POST /api/supply-chain/optimize`: Get transport route optimization

## Technologies Used

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Shadcn UI component library
- Axios for API communication
- React Router for navigation
- Responsive design for all devices

### Backend
- Flask for API development
- MongoDB for database storage
- Python for backend logic
- XGBoost and other ML models for predictions and recommendations
- AI-powered image analysis for disease detection
- RESTful API architecture

## Future Enhancements
- Integration with IoT devices for real-time sensor data
- Weather forecast integration
- Mobile application development
- Marketplace for agricultural products
- Community features for knowledge sharing

## Contributors
- (List of contributors)

## License
This project is licensed under the MIT License. 