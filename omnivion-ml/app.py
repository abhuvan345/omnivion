from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import pickle
import numpy as np
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the trained XGBoost model
MODEL_PATH = 'XGBoost.pkl'

try:
    with open(MODEL_PATH, 'rb') as file:
        model = pickle.load(file)
    
    # Fix XGBoost compatibility issue by setting required attributes
    if hasattr(model, '_Booster'):
        # For newer XGBoost versions
        if not hasattr(model, 'use_label_encoder'):
            model.use_label_encoder = False
        if not hasattr(model, 'eval_metric'):
            model.eval_metric = 'logloss'
    
    print("✅ XGBoost model loaded successfully")
    print(f"📊 Model type: {type(model)}")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

# Feature columns expected by the model (based on your CSV structure)
EXPECTED_FEATURES = [
    'age', 'cgpa', 'attendance_rate', 'family_income', 'past_failures',
    'study_hours_per_week', 'assignments_submitted', 'projects_completed',
    'total_activities', 'scholarship', 'extra_curricular', 'sports_participation',
    'parental_education', 'gender', 'department'
]

def preprocess_student_data(student_data):
    """
    Preprocess student data for prediction
    """
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
    """
    Convert dropout probability to risk level
    """
    if probability >= 0.7:
        return "high"
    elif probability >= 0.4:
        return "medium"
    else:
        return "low"

def get_contributing_factors(student_data, probability):
    """
    Identify contributing factors based on student data
    """
    factors = []
    
    # Low CGPA
    if student_data.get('cgpa', 0) < 5.0:
        factors.append({
            "factor": "Low CGPA",
            "weight": 0.8,
            "description": f"CGPA of {student_data.get('cgpa', 0):.2f} is below average"
        })
    
    # Poor attendance
    if student_data.get('attendance_rate', 0) < 70:
        factors.append({
            "factor": "Poor Attendance",
            "weight": 0.7,
            "description": f"Attendance rate of {student_data.get('attendance_rate', 0):.1f}% is concerning"
        })
    
    # High past failures
    if student_data.get('past_failures', 0) >= 4:
        factors.append({
            "factor": "Multiple Past Failures",
            "weight": 0.6,
            "description": f"{student_data.get('past_failures', 0)} past failures indicate academic struggles"
        })
    
    # Low study hours
    if student_data.get('study_hours_per_week', 0) < 10:
        factors.append({
            "factor": "Insufficient Study Time",
            "weight": 0.5,
            "description": f"Only {student_data.get('study_hours_per_week', 0)} hours of study per week"
        })
    
    # Low assignment submission
    if student_data.get('assignments_submitted', 0) < 20:
        factors.append({
            "factor": "Low Assignment Completion",
            "weight": 0.4,
            "description": f"Only {student_data.get('assignments_submitted', 0)} assignments submitted"
        })
    
    return factors[:3]  # Return top 3 factors

def get_recommendations(risk_level, factors):
    """
    Generate recommendations based on risk level and factors
    """
    recommendations = []
    
    if risk_level == "high":
        recommendations.extend([
            {
                "action": "Immediate Academic Intervention",
                "priority": "high",
                "description": "Schedule one-on-one tutoring sessions and academic counseling"
            },
            {
                "action": "Attendance Monitoring",
                "priority": "high",
                "description": "Implement daily attendance tracking and follow-up for absences"
            },
            {
                "action": "Parent Conference",
                "priority": "medium",
                "description": "Arrange meeting with parents to discuss academic concerns"
            }
        ])
    elif risk_level == "medium":
        recommendations.extend([
            {
                "action": "Study Skills Workshop",
                "priority": "medium",
                "description": "Enroll in study skills and time management workshops"
            },
            {
                "action": "Peer Mentoring",
                "priority": "medium",
                "description": "Assign a peer mentor for academic support"
            },
            {
                "action": "Regular Check-ins",
                "priority": "low",
                "description": "Schedule bi-weekly progress meetings with advisor"
            }
        ])
    else:
        recommendations.extend([
            {
                "action": "Maintain Current Progress",
                "priority": "low",
                "description": "Continue current study habits and academic performance"
            },
            {
                "action": "Encourage Leadership",
                "priority": "low",
                "description": "Consider leadership roles or advanced coursework"
            }
        ])
    
    return recommendations

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None
    })

@app.route('/predict', methods=['POST'])
def predict_single():
    """
    Predict dropout risk for a single student
    """
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
        
        # Make prediction
        try:
            # Try predict_proba first
            prediction_proba = model.predict_proba(processed_data)[0]
            dropout_probability = float(prediction_proba[1])  # Probability of dropout (class 1)
        except Exception as pred_error:
            print(f"Prediction error: {pred_error}")
            # Fallback: try direct prediction
            try:
                prediction = model.predict(processed_data)[0]
                dropout_probability = float(prediction)
            except Exception as fallback_error:
                print(f"Fallback prediction error: {fallback_error}")
                return jsonify({"error": f"Model prediction failed: {str(fallback_error)}"}), 500
        
        # Get risk level
        risk_level = get_risk_level(dropout_probability)
        
        # Get contributing factors
        contributing_factors = get_contributing_factors(student_data, dropout_probability)
        
        # Get recommendations
        recommendations = get_recommendations(risk_level, contributing_factors)
        
        return jsonify({
            "student_id": student_data.get("student_id", "unknown"),
            "risk_level": risk_level,
            "dropout_probability": round(dropout_probability, 3),
            "contributing_factors": contributing_factors,
            "recommendations": recommendations,
            "model_version": "XGBoost_v1.0"
        })
        
    except Exception as e:
        return jsonify({"error": f"Prediction error: {str(e)}"}), 500

@app.route('/predict_batch', methods=['POST'])
def predict_batch():
    """
    Predict dropout risk for multiple students
    """
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
                
                # Make prediction
                try:
                    # Try predict_proba first
                    prediction_proba = model.predict_proba(processed_data)[0]
                    dropout_probability = float(prediction_proba[1])
                except Exception as pred_error:
                    print(f"Batch prediction error for {student_data.get('student_id', 'unknown')}: {pred_error}")
                    # Fallback: try direct prediction
                    try:
                        prediction = model.predict(processed_data)[0]
                        dropout_probability = float(prediction)
                    except Exception as fallback_error:
                        print(f"Fallback batch prediction error: {fallback_error}")
                        continue
                
                # Get risk level
                risk_level = get_risk_level(dropout_probability)
                
                # Get contributing factors
                contributing_factors = get_contributing_factors(student_data, dropout_probability)
                
                # Get recommendations
                recommendations = get_recommendations(risk_level, contributing_factors)
                
                predictions.append({
                    "student_id": student_data.get("student_id", "unknown"),
                    "risk_level": risk_level,
                    "dropout_probability": round(dropout_probability, 3),
                    "contributing_factors": contributing_factors,
                    "recommendations": recommendations
                })
                
            except Exception as e:
                print(f"Error predicting for student {student_data.get('student_id', 'unknown')}: {e}")
                continue
        
        return jsonify({
            "predictions": predictions,
            "total_processed": len(predictions),
            "model_version": "XGBoost_v1.0"
        })
        
    except Exception as e:
        return jsonify({"error": f"Batch prediction error: {str(e)}"}), 500

if __name__ == '__main__':
    print("🚀 Starting ML Prediction Service...")
    print(f"📊 Model loaded: {model is not None}")
    app.run(host='0.0.0.0', port=5000, debug=True)