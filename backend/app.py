from flask import Flask, request, jsonify
from flask_cors import CORS
from models.disease_prediction import predict_disease
from models.database import Database
import firebase_admin
from firebase_admin import credentials, firestore
import json
import os

app = Flask(__name__)
CORS(app)

# Initialize Firebase Admin
try:
    # Initialize Firebase Admin SDK with service account key
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()
except Exception as e:
    print(f"Firebase initialization error: {e}")

# Patient Routes
@app.route('/api/patients', methods=['POST'])
def create_patient():
    data = request.get_json()
    result = Database.create_patient(data)
    return jsonify(result)

@app.route('/api/patients/<patient_id>', methods=['GET'])
def get_patient(patient_id):
    result = Database.get_patient(patient_id)
    return jsonify(result)

# Doctor Routes
@app.route('/api/doctors', methods=['POST'])
def create_doctor():
    data = request.get_json()
    result = Database.create_doctor(data)
    return jsonify(result)

@app.route('/api/doctors', methods=['GET'])
def get_all_doctors():
    result = Database.get_all_doctors()
    return jsonify(result)

@app.route('/api/doctors/<doctor_id>', methods=['GET'])
def get_doctor(doctor_id):
    result = Database.get_doctor(doctor_id)
    return jsonify(result)

# Appointment Routes
@app.route('/api/appointments', methods=['POST'])
def create_appointment():
    data = request.get_json()
    result = Database.create_appointment(data)
    return jsonify(result)

@app.route('/api/appointments/patient/<patient_id>', methods=['GET'])
def get_patient_appointments(patient_id):
    result = Database.get_patient_appointments(patient_id)
    return jsonify(result)

@app.route('/api/appointments/doctor/<doctor_id>', methods=['GET'])
def get_doctor_appointments(doctor_id):
    result = Database.get_doctor_appointments(doctor_id)
    return jsonify(result)

# Medical Reports Routes
@app.route('/api/medical-reports', methods=['POST'])
def create_medical_report():
    data = request.get_json()
    result = Database.create_medical_report(data)
    return jsonify(result)

# Disease Prediction Route
@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        symptoms = data.get('symptoms', [])
        user_id = data.get('userId')
        
        if not symptoms:
            return jsonify({'error': 'No symptoms provided'}), 400
        
        # Get prediction from model
        prediction = predict_disease(symptoms)
        
        # Store prediction in Firestore
        if user_id:
            prediction_ref = db.collection('predictions').document()
            prediction_ref.set({
                'userId': user_id,
                'symptoms': symptoms,
                'prediction': prediction,
                'timestamp': firestore.SERVER_TIMESTAMP
            })
        
        return jsonify(prediction)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/symptoms', methods=['GET'])
def get_symptoms():
    from models.disease_prediction import symptoms
    return jsonify({'symptoms': symptoms})

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)