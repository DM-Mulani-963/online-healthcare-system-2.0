from firebase_admin import firestore
from datetime import datetime

db = firestore.client()

class Database:
    @staticmethod
    def create_patient(data):
        try:
            doc_ref = db.collection('patients').document()
            data['created_at'] = firestore.SERVER_TIMESTAMP
            doc_ref.set(data)
            return {'id': doc_ref.id, 'status': 'success'}
        except Exception as e:
            return {'error': str(e), 'status': 'error'}

    @staticmethod
    def create_doctor(data):
        try:
            doc_ref = db.collection('doctors').document()
            data['created_at'] = firestore.SERVER_TIMESTAMP
            doc_ref.set(data)
            return {'id': doc_ref.id, 'status': 'success'}
        except Exception as e:
            return {'error': str(e), 'status': 'error'}

    @staticmethod
    def create_appointment(data):
        try:
            doc_ref = db.collection('appointments').document()
            data['created_at'] = firestore.SERVER_TIMESTAMP
            doc_ref.set(data)
            return {'id': doc_ref.id, 'status': 'success'}
        except Exception as e:
            return {'error': str(e), 'status': 'error'}

    @staticmethod
    def create_medical_report(data):
        try:
            doc_ref = db.collection('medical_reports').document()
            data['created_at'] = firestore.SERVER_TIMESTAMP
            doc_ref.set(data)
            return {'id': doc_ref.id, 'status': 'success'}
        except Exception as e:
            return {'error': str(e), 'status': 'error'}

    @staticmethod
    def get_patient(patient_id):
        try:
            doc = db.collection('patients').document(patient_id).get()
            if doc.exists:
                return {'data': doc.to_dict(), 'status': 'success'}
            return {'error': 'Patient not found', 'status': 'error'}
        except Exception as e:
            return {'error': str(e), 'status': 'error'}

    @staticmethod
    def get_doctor(doctor_id):
        try:
            doc = db.collection('doctors').document(doctor_id).get()
            if doc.exists:
                return {'data': doc.to_dict(), 'status': 'success'}
            return {'error': 'Doctor not found', 'status': 'error'}
        except Exception as e:
            return {'error': str(e), 'status': 'error'}

    @staticmethod
    def get_all_doctors():
        try:
            docs = db.collection('doctors').stream()
            return {'data': [{'id': doc.id, **doc.to_dict()} for doc in docs], 'status': 'success'}
        except Exception as e:
            return {'error': str(e), 'status': 'error'}

    @staticmethod
    def get_patient_appointments(patient_id):
        try:
            docs = db.collection('appointments').where('patient_id', '==', patient_id).stream()
            return {'data': [{'id': doc.id, **doc.to_dict()} for doc in docs], 'status': 'success'}
        except Exception as e:
            return {'error': str(e), 'status': 'error'}

    @staticmethod
    def get_doctor_appointments(doctor_id):
        try:
            docs = db.collection('appointments').where('doctor_id', '==', doctor_id).stream()
            return {'data': [{'id': doc.id, **doc.to_dict()} for doc in docs], 'status': 'success'}
        except Exception as e:
            return {'error': str(e), 'status': 'error'}
