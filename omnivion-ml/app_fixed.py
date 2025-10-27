import warnings
warnings.filterwarnings("ignore", category=UserWarning)

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import pickle
import numpy as np
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the trained XGBoost model with better error handling
MODEL_PATH = 'XGBoost.pkl'

def load_model_safely():
    """Safely load the XGBoost model with compatibility fixes"""
    try:
        with open(MODEL_PATH, 'rb') as file:
            model = pickle.load(file)
        
        # XGBoost compatibility fixes
        if hasattr(model, '__class__') and 'XGB' in str(model.__class__):
            # Set attributes that might be missing in older versions
            if not hasattr(model, 'use_label_encoder'):
                model.use_label_encoder = False
            if not hasattr(model, 'eval_metric'):
                model.eval_metric = 'logloss'
        
        # Test the model with dummy data
        test_data = pd.DataFrame([[20, 7.5, 85, 50000, 2, 15, 45, 3, 8, 1, 1, 0, 1, 1, 4]], 
                                columns=['age', 'cgpa', 'attendance_rate', 'family_income', 'past_failures',
                                        'study_hours_per_week', 'assignments_submitted', 'projects_completed',
                                        'total_activities', 'scholarship', 'extra_curricular', 'sports_participation',
                                        'parental_education', 'gender', 'department'])
        
        # Test prediction
        try:
            if hasattr(model, 'predict_proba'):
                _ = model.predict_proba(test_data)
                print("✅ Model supports predict_proba")
            else:
                _ = model.predict(test_data)
                print("✅ Model supports predict only")
        except Exception as test_error:
            print(f"⚠️  Model test failed: {test_error}")
            return None
            
        print("✅ XGBoost model loaded and tested successfully")
        return model
        
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return None

model = load_model_safely()

# Feature columns expected by the model
EXPECTED_FEATURES = [
    'age', 'cgpa', 'attendance_rate', 'family_income', 'past_failures',
    'study_hours_per_week', 'assignments_submitted', 'projects_completed',
    'total_activities', 'scholarship', 'extra_curricular', 'sports_participation',
    'parental_education', 'gender', 'department'
]

def preprocess_student_data(student_data):
    """Preprocess student data for prediction"""
    try:
        # Create DataFrame from student data
        df = pd.DataFrame([student_data])
        
        # Ensure all expected features are present
        for feature in EXPECTED_FEATURES:
            if feature not in df.columns:
                df[feature] = 0  # Default value for missing features
        
        # Select only the expected features in the correct order
        df = df[EXPECTED_FEATURES]
        
        # Handle missing values
        df = df.fillna(0)
        
        return df
    except Exception as e:
        print(f"Error in preprocessing: {e}")
        return None

def get_risk_level(probability):
    """Convert dropout probability to risk level"""
    if probability >= 0.7:
        return "high"
    elif probability >= 0.4:
        return "medium"
    else:
        return "low"

def safe_predict(model, data):
    """Safely make predictions with fallback options"""
    try:
        # Try predict_proba first
        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba(data)
            if proba.shape[1] >= 2:
                return float(proba[0][1])  # Probability of positive class
            else:
                return float(proba[0][0])  # Single probability
        else:
            # Fallback to predict
            prediction = model.predict(data)
            return float(prediction[0])
    except Exception as e:
        print(f"Prediction error: {e}")
        # Return a safe default
        return 0.5

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None
    })

@app.route('/predict', methods=['POST'])
def predict_single():
    """Predict dropout risk for a single student"""
    try:
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500
        
        # Get student data from request
        student_data = request.json
        
        if not student_data:
            return jsonify({"error": "No student data provided"}), 400
        
        # Preprocess the data
        processed_data = preprocess_student_data(student_data)
        
        if processed_data is None:
            return jsonify({"error": "Error preprocessing data"}), 400
        
        # Make prediction safely
        dropout_probability = safe_predict(model, processed_data)
        
        # Get risk level
        risk_level = get_risk_level(dropout_probability)
        
        # Simple contributing factors based on thresholds
        contributing_factors = []
        if student_data.get('cgpa', 0) < 5.0:
            contributing_factors.append({
                "factor": "Low CGPA",
                "weight": 0.8,
                "description": f"CGPA of {student_data.get('cgpa', 0):.2f} is below average"
            })
        
        if student_data.get('attendance_rate', 0) < 70:
            contributing_factors.append({
                "factor": "Poor Attendance",
                "weight": 0.7,
                "description": f"Attendance rate of {student_data.get('attendance_rate', 0):.1f}% is concerning"
            })
        
        if student_data.get('past_failures', 0) >= 4:
            contributing_factors.append({
                "factor": "Multiple Past Failures",
                "weight": 0.6,
                "description": f"{student_data.get('past_failures', 0)} past failures indicate academic struggles"
            })
        
        # Simple recommendations
        recommendations = []
        if risk_level == "high":
            recommendations.extend([
                {
                    "action": "Immediate Academic Intervention",
                    "priority": "high",
                    "description": "Schedule one-on-one tutoring sessions"
                },
                {
                    "action": "Attendance Monitoring",
                    "priority": "high",
                    "description": "Implement daily attendance tracking"
                }
            ])
        elif risk_level == "medium":
            recommendations.extend([
                {
                    "action": "Study Skills Workshop",
                    "priority": "medium",
                    "description": "Enroll in study skills workshops"
                },
                {
                    "action": "Regular Check-ins",
                    "priority": "medium",
                    "description": "Schedule bi-weekly progress meetings"
                }
            ])
        else:
            recommendations.append({
                "action": "Maintain Current Progress",
                "priority": "low",
                "description": "Continue current study habits"
            })
        
        return jsonify({
            "student_id": student_data.get("student_id", "unknown"),
            "risk_level": risk_level,
            "dropout_probability": round(dropout_probability, 3),
            "contributing_factors": contributing_factors,
            "recommendations": recommendations,
            "model_version": "XGBoost_v1.0_compatible"
        })
        
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({"error": f"Prediction error: {str(e)}"}), 500

@app.route('/predict_batch', methods=['POST'])
def predict_batch():
    """Predict dropout risk for multiple students"""
    try:
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500
        
        # Get students data from request
        students_data = request.json.get('students', [])
        
        if not students_data:
            return jsonify({"error": "No students data provided"}), 400
        
        predictions = []
        
        for student_data in students_data:
            try:
                # Preprocess the data
                processed_data = preprocess_student_data(student_data)
                
                if processed_data is None:
                    continue
                
                # Make prediction safely
                dropout_probability = safe_predict(model, processed_data)
                
                # Get risk level
                risk_level = get_risk_level(dropout_probability)
                
                # Simple contributing factors
                contributing_factors = []
                if student_data.get('cgpa', 0) < 5.0:
                    contributing_factors.append({
                        "factor": "Low CGPA",
                        "weight": 0.8,
                        "description": f"CGPA of {student_data.get('cgpa', 0):.2f} is below average"
                    })
                
                if student_data.get('attendance_rate', 0) < 70:
                    contributing_factors.append({
                        "factor": "Poor Attendance",
                        "weight": 0.7,
                        "description": f"Attendance rate of {student_data.get('attendance_rate', 0):.1f}% is concerning"
                    })
                
                # Simple recommendations
                recommendations = []
                if risk_level == "high":
                    recommendations.append({
                        "action": "Immediate Intervention",
                        "priority": "high",
                        "description": "Schedule academic support"
                    })
                elif risk_level == "medium":
                    recommendations.append({
                        "action": "Monitor Progress",
                        "priority": "medium",
                        "description": "Regular check-ins needed"
                    })
                else:
                    recommendations.append({
                        "action": "Maintain Performance",
                        "priority": "low",
                        "description": "Continue current approach"
                    })
                
                predictions.append({
                    "student_id": student_data.get("student_id", "unknown"),
                    "risk_level": risk_level,
                    "dropout_probability": round(dropout_probability, 3),
                    "contributing_factors": contributing_factors,
                    "recommendations": recommendations
                })
                
            except Exception as e:
                print(f"Error predicting for student {student_data.get('student_id', 'unknown')}: {e}")
                # Add a failed prediction entry
                predictions.append({
                    "student_id": student_data.get("student_id", "unknown"),
                    "risk_level": "unknown",
                    "dropout_probability": 0,
                    "contributing_factors": [],
                    "recommendations": [],
                    "error": f"Prediction failed: {str(e)}"
                })
        
        return jsonify({
            "predictions": predictions,
            "total_processed": len(predictions),
            "model_version": "XGBoost_v1.0_compatible"
        })
        
    except Exception as e:
        print(f"Batch prediction error: {e}")
        return jsonify({"error": f"Batch prediction error: {str(e)}"}), 500

if __name__ == '__main__':
    print("🚀 Starting ML Prediction Service...")
    print(f"📊 Model loaded: {model is not None}")
    app.run(host='0.0.0.0', port=5000, debug=False)