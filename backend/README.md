# AI-Powered Healthcare System Backend

This is the backend service for the AI-Powered Healthcare System. It provides APIs for disease prediction based on symptoms and integrates with Firebase for data persistence.

## Features

- Disease prediction using machine learning
- Symptom-based analysis
- Firebase integration for data storage
- RESTful API endpoints
- CORS support for frontend integration

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Firebase service account credentials

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up Firebase:
   - Create a Firebase project
   - Download your service account key JSON file
   - Place it in a secure location and update the path in `app.py`

## Running the Server

Development mode:
```bash
python app.py
```

Production mode with Gunicorn:
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## API Endpoints

### GET /api/health
Health check endpoint.

### GET /api/symptoms
Returns a list of available symptoms.

### POST /api/predict
Predicts diseases based on symptoms.

Request body:
```json
{
    "symptoms": ["fever", "cough", "fatigue"],
    "userId": "optional-user-id"
}
```

Response:
```json
{
    "predictions": [
        {
            "disease": "COVID-19",
            "probability": 0.85
        },
        {
            "disease": "Flu",
            "probability": 0.10
        },
        {
            "disease": "Common Cold",
            "probability": 0.05
        }
    ],
    "top_prediction": "COVID-19",
    "confidence": 0.85
}
```

## Model Information

The disease prediction model is built using scikit-learn's RandomForestClassifier. The model:
- Uses a predefined set of symptoms as features
- Provides probability scores for multiple diseases
- Is automatically trained if no pre-trained model exists
- Saves the trained model for future use

## Security Notes

- Keep your Firebase credentials secure
- Don't commit sensitive credentials to version control
- Use environment variables for configuration in production
- Implement proper authentication and authorization in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request 