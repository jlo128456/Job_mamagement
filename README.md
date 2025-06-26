Job Management System – Frontend
This is the React frontend for the Job Management System. It includes dashboards for Admins, Contractors, and Technicians, built with React Router and Context API.

Features
User login and role-based dashboard
Job creation, review, status updates
Technician and contractor update workflows
Admin approval and oversight tools
Onsite timestamp and status log tracking
Machine/job many-to-many relationship
Getting Started
Prerequisites
Node.js v16+
npm v8+
Installation
Navigate to the frontend directory:
cd frontend
Install dependencies:
npm install
Start the development server:
npm start
Open http://localhost:3000 to view it in the browser.

Folder Structure
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   ├── layout/
│   │   ├── modals/
│   ├── context/
│   ├── utils/
│   ├── styles/
│   ├── App.js
│   └── index.js
├── .env
├── package.json
└── README.md
Environment Variables
Create a .env file in the frontend/ directory:

REACT_APP_API_BASE_URL=http://localhost:5000
Update the value above if you deploy the backend elsewhere.

Deployment
Netlify
Push the frontend to GitHub
In Netlify dashboard:
New site from Git
Set build command: npm run build
Set publish directory: build
Add REACT_APP_API_BASE_URL to environment variables
Render (for backend)
Ensure CORS is enabled in Flask backend for https://your-netlify-site.netlify.app

Notes
Uses React Router (v6+) for routing
Uses Context API for global state (user, jobs)
Custom utility functions in /utils for formatting and status color
Designed to work seamlessly with Flask backend
License
This project is for educational use under the Phase 5 final project requirements.
