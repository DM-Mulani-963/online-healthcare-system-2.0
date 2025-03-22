# Healthcare Management System

A modern healthcare management system with a React frontend and C++ backend.

## Project Structure

```
.
├── frontend/           # React TypeScript frontend
├── backend/           # C++ backend server
├── src/              # Shared source files
│   ├── database/     # Database related files
│   ├── models/       # Data models
│   └── routes/       # API routes
└── public/           # Public assets
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- C++ compiler (GCC/Clang)
- CMake (v3.10 or higher)
- MySQL Server

## Setup Instructions

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at http://localhost:3000

### Backend Setup

1. Install required C++ dependencies:
   - Crow (C++ web framework)
   - MySQL Connector/C++
   - OpenSSL

2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Create a build directory and navigate to it:
   ```bash
   mkdir build && cd build
   ```

4. Build the project:
   ```bash
   cmake ..
   make
   ```

5. Run the server:
   ```bash
   ./healthcare_backend
   ```

The backend server will be available at http://localhost:3000

## Features

- User authentication (login/register)
- Patient dashboard
- Appointment management
- Medical records
- Prescription management
- Doctor-patient communication

## API Documentation

The backend provides the following REST API endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/appointments` - Get user appointments
- `POST /api/appointments` - Create new appointment
- `GET /api/medical-records` - Get user medical records
- `GET /api/prescriptions` - Get user prescriptions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 