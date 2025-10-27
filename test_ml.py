import requests
import json

# Test data
test_student = {
    "student_id": "TEST001",
    "age": 20,
    "cgpa": 7.5,
    "attendance_rate": 85.0,
    "family_income": 55000.0,
    "past_failures": 2,
    "study_hours_per_week": 15.0,
    "assignments_submitted": 45,
    "projects_completed": 3,
    "total_activities": 8,
    "scholarship": 1,
    "extra_curricular": 1,
    "sports_participation": 0,
    "parental_education": 1,
    "gender": 1,
    "department": 4
}

# Test single prediction
print("Testing single prediction...")
response = requests.post("http://localhost:5000/predict", json=test_student)
print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")

# Test batch prediction
print("\nTesting batch prediction...")
batch_data = {"students": [test_student]}
response = requests.post("http://localhost:5000/predict_batch", json=batch_data)
print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")