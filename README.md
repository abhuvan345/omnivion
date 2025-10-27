# 🧠 Omnivion — AI-Powered Student Insight and Dropout Prediction Platform  
### Omnitrics Hackathon 2025 Submission  

---

## 👥 Team Name  
*Old Monk*

---

## 👩‍💻 Team Members  
- *Akshay S* – [akshays.cs23@bmsce.ac.in]  
- *Abhijna S P* – [abhijnasp.ai23@bmsce.ac.in]  
- *Abhay K R* – [abhaykr.ai23@bmsce.ac.in]  
- *Bhuvan* – [bhuvana.cs24@bmsce.c.in]  

---

## 💡 Project Title  
*Omnivion – AI-Powered Student Insight and Dropout Prediction Platform*

---

## 📘 Short Project Summary  

*Omnivion* (Omni + Vision = Total Insight) is an AI-driven analytics platform designed to predict and prevent college student dropouts through intelligent data insights.  

Our solution leverages *Machine Learning* and *LLM-based recommendations* to identify at-risk students early, helping educators take proactive measures.  

- *Admins* can view institution-wide insights and manage users.  
- *HODs* can monitor department-level analytics and trends.  
- *Class Teachers* can upload class-level CSV data to get personalized dropout predictions.  

A built-in *conversational AI assistant* suggests interventions, motivational actions, and management strategies based on prediction results — turning data into meaningful decisions.  

Built using *React, Node.js, Express, FastAPI (Python), and MongoDB*, Omnivion combines predictive analytics with a futuristic, user-friendly interface to empower academic success.  

---

## 🛠 Tools / Technologies Used  
- *Frontend:* React.js, Tailwind CSS, Recharts  
- *Backend:* Node.js, Express.js  
- *ML Microservice:* Python, FastAPI, Scikit-learn, Pandas, Joblib  
- *Database:* MongoDB  
- *LLM Integration:* OpenAI / Gemini API  
- *Deployment:* Netlify (Frontend), Render (Backend), MongoDB Atlas (DB)

---

## ⚙ Instructions to Run the Project  

1. *Clone the Repository*
bash
git clone <your_repo_link>
cd omnivion

2. *Start the ML Microservice (Python)*
bash
cd ml_service
pip install -r requirements.txt
python ml_service.py
 
3. *Start the Backend Server*
bash
cd backend
npm install
npm start


4. *Start the Frontend*
bash
Copy code
cd frontend
npm install
npm run dev


5. *Access the App*

*Frontend*: http://localhost:5173

*Backend*: http://localhost:8000

*ML Service*: http://localhost:5000

6. *Login Roles*

*Admin*: Full institution analytics

*HOD*: Department-level insights

*Class Teacher*: Upload CSV → Predict class data


*🎯 Core Features*

-📊 Predict dropout risk using ML models (Random Forest, XGBoost)

-🧩 Role-based dashboards (Admin / HOD / Teacher)

-📂 CSV upload for batch predictions

-📈 Interactive analytics and visualizations

-💬 AI Chatbot powered by LLMs for personalized interventions

-🌗 Futuristic UI with light/dark mode and responsive design

*🎨 Theme & Design*

-Tagline: “See Beyond Grades. Predict the Future of Learning.”

-Logo Concept: Abstract eye with connected data nodes and an infinity curve — symbolizing endless insight.

-Color Palette:

      Deep Indigo #4B0082

      Electric Blue #00CFFF

      Off-white / Charcoal backgrounds

-Vibe: Futuristic · Professional · Analytical

*🚀 Future Scope*

-Integration with real-time attendance and LMS data.

-Advanced explainability (SHAP / LIME) for model transparency.

-Student wellness and performance tracking dashboards.

-Automated early-warning notifications for high-risk students.

-Chatbot support for better accessibility.


### 🏁 Built with Passion by Team Old Monk 💜