Collecting flask==3.0.0 (from -r requirements.txt (line 1))
  Downloading flask-3.0.0-py3-none-any.whl.metadata (3.6 kB)
Collecting flask-cors==4.0.0 (from -r requirements.txt (line 2))
  Using cached Flask_Cors-4.0.0-py2.py3-none-any.whl.metadata (5.4 kB)
Collecting scikit-learn==1.3.2 (from -r requirements.txt (line 3))
  Downloading scikit-learn-1.3.2.tar.gz (7.5 MB)
     ---------------------------------------- 7.5/7.5 MB 593.4 kB/s eta 0:00:00
  Installing build dependencies: started
# Online Healthcare System 🏥

A comprehensive healthcare system with Firebase integration and ML-based disease prediction.

## Features 🌟

- User Authentication (Patients, Doctors, Admins)
- Appointment Management
- Medical Records Management
- Disease Prediction using Machine Learning
- Secure Data Storage with Firebase
- Role-based Access Control

## Project Structure 📁

```
├── backend/
│   ├── models/
│   │   ├── disease_prediction.py
│   │   └── database.py
│   ├── app.py
│   └── requirements.txt
├── frontend/
│   ├── js/
│   │   └── firebase-config.js
│   └── [other frontend files]
├── firestore.rules
└── README.md
```

## Setup Instructions 🚀

### Prerequisites
- Python 3.8+
- Node.js 14+
- Firebase Account

### Backend Setup

1. Install Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Set up Firebase:
   - Place your `serviceAccountKey.json` in the backend directory
   - Ensure Firebase configuration in `frontend/js/firebase-config.js` is correct

3. Start the backend server:
```bash
python app.py
```

### Frontend Setup

1. Open `index.html` in a web browser
2. Frontend will automatically connect to the backend API

## API Endpoints 📡

### Patient Routes
- POST `/api/patients` - Create new patient
- GET `/api/patients/<patient_id>` - Get patient details

### Doctor Routes
- POST `/api/doctors` - Create new doctor
- GET `/api/doctors` - Get all doctors
- GET `/api/doctors/<doctor_id>` - Get doctor details

### Appointment Routes
- POST `/api/appointments` - Create new appointment
- GET `/api/appointments/patient/<patient_id>` - Get patient's appointments
- GET `/api/appointments/doctor/<doctor_id>` - Get doctor's appointments

### Medical Reports Routes
- POST `/api/medical-reports` - Create new medical report

### Disease Prediction
- POST `/api/predict` - Get disease prediction based on symptoms
- GET `/api/symptoms` - Get list of available symptoms

## Security 🔒

- Firebase Authentication for user management
- Firestore Security Rules for data protection
- Role-based access control (Patient, Doctor, Admin)

## Database Schema 💾

### Collections:
- patients
- doctors
- appointments
- medical_reports
- prescriptions
- payments
- admins
- feedback

For detailed schema information, refer to the Firestore security rules.

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License 📄

This project is licensed under the MIT License.
