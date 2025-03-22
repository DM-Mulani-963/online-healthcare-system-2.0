import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# List of symptoms (this should be expanded based on your dataset)
symptoms = [
    'fever', 'cough', 'fatigue', 'difficulty_breathing', 'body_aches',
    'headache', 'loss_of_taste', 'sore_throat', 'runny_nose', 'nausea'
]

# List of diseases (this should be expanded based on your dataset)
diseases = [
     'Common Cold', 'Flu', 'Pneumonia', 'Bronchitis'
]

class DiseasePredictor:
    def __init__(self):
        self.model = None
        self.le = LabelEncoder()
        self.model_path = 'models/disease_model.joblib'
        
        if os.path.exists(self.model_path):
            self.load_model()
        else:
            self.train_model()
    
    def preprocess_symptoms(self, patient_symptoms):
        # Convert symptoms to binary feature vector
        feature_vector = np.zeros(len(symptoms))
        for symptom in patient_symptoms:
            if symptom in symptoms:
                feature_vector[symptoms.index(symptom)] = 1
        return feature_vector.reshape(1, -1)
    
    def train_model(self):
        # This is a simplified training process
        # In production, you should use real medical data
        X = np.random.randint(0, 2, size=(1000, len(symptoms)))
        y = np.random.choice(diseases, size=1000)
        
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X, y)
        
        # Save the model
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(self.model, self.model_path)
    
    def load_model(self):
        self.model = joblib.load(self.model_path)
    
    def predict(self, patient_symptoms):
        features = self.preprocess_symptoms(patient_symptoms)
        prediction = self.model.predict(features)[0]
        probabilities = self.model.predict_proba(features)[0]
        
        # Get top 3 predictions with probabilities
        top_3_indices = np.argsort(probabilities)[-3:][::-1]
        predictions = []
        for idx in top_3_indices:
            predictions.append({
                'disease': diseases[idx],
                'probability': float(probabilities[idx])
            })
        
        return {
            'predictions': predictions,
            'top_prediction': predictions[0]['disease'],
            'confidence': float(predictions[0]['probability'])
        }

# Initialize the predictor
predictor = DiseasePredictor()

def predict_disease(patient_symptoms):
    return predictor.predict(patient_symptoms)

# Example usage
if __name__ == '__main__':
    # Test the model
    test_symptoms = ['fever', 'cough', 'fatigue', 'headache']
    result = predict_disease(test_symptoms)
    print('Test Prediction:', result) 