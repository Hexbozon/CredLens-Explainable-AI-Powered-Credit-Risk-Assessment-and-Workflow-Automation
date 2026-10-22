# CredLens

### Explainable AI-Powered Credit Risk Assessment and Workflow Automation

CredLens is an AI-powered credit risk assessment and decision-support platform designed to help lending analysts evaluate loan applications using machine learning and explainable AI. It predicts credit grades and default risk, explains the factors influencing predictions, and provides a dashboard for reviewing applications and analyzing portfolio risk.

## Features

- **Credit Risk Prediction:** Uses machine learning to estimate the probability of loan default.
- **Credit Grade Prediction:** Predicts an applicant's credit grade and sub-grade using applicant-related features.
- **Explainable AI:** Integrates SHAP to identify the factors influencing model predictions.
- **Interactive Dashboard:** Displays application statistics, risk distributions, and portfolio insights.
- **Application Management:** Enables analysts to access and review assessment records.
- **Workflow Automation:** Connects the prediction pipeline, explanations, and application records through a unified interface.

## Technology Stack

**Frontend**
- React
- Vite
- Tailwind CSS

**Backend**
- Python
- FastAPI

**Machine Learning**
- XGBoost
- Scikit-learn
- SHAP
- Pandas
- NumPy

**Database**
- PostgreSQL (planned or used, depending on implementation status)

## System Architecture

The application follows a client-server architecture. The React frontend communicates with the FastAPI backend through REST APIs. The backend processes applicant data, runs the machine learning pipeline, generates risk predictions and explanations, and manages assessment records.

```text
Lending Analyst
      |
      v
React Frontend
      |
      v
FastAPI Backend
      |
      v
Data Preprocessing
      |
      v
Credit Grade Prediction
      |
      v
Sub-grade Prediction
      |
      v
Default Risk Prediction
      |
      v
SHAP Explanations
      |
      v
Assessment Results and Dashboard
```

## Project Structure

```text
CredLens/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── ...
├── creditlens-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.10 or later
- Node.js and npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Hexbozon/CredLens: Explainable AI-Powered Credit Risk Assessment and Workflow Automation.git
cd CredLens
```

Replace the repository URL with your GitHub repository URL.

### 2. Set Up the Backend

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment.

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Create a local `.env` file containing the environment variables required by the application. Do not commit this file.

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The API documentation is typically available at:

`http://127.0.0.1:8000/docs`

### 3. Set Up the Frontend

Open a separate terminal:

```bash
cd creditlens-frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your terminal.

## API Endpoints

The backend currently includes endpoints for:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/assess` | Assess a loan application |
| POST | `/api/preprocess` | Preprocess applicant data |
| POST | `/api/shap` | Generate prediction explanations |
| POST | `/api/assessments/{assessment_id}/shap` | Save SHAP results for an assessment |
| GET | `/api/applications` | Retrieve application records |
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |

## Machine Learning Workflow

1. Receive applicant information.
2. Preprocess the input features.
3. Predict the credit grade and sub-grade.
4. Estimate the probability of loan default.
5. Generate SHAP explanations for model predictions.
6. Present assessment results for analyst review.

## Responsible Use

CredLens is designed as a decision-support tool, not an autonomous loan approval or rejection system. Predictions should be interpreted alongside relevant financial information, model limitations, and human judgment.

## Future Improvements

- Historical portfolio analytics and risk trend visualization.
- LLM-generated summaries grounded in model predictions and SHAP results.
- Improved model monitoring and evaluation.
- Enhanced authentication and role-based access control.
- Deployment of the frontend, backend, and database.

## Disclaimer

CredLens is an educational and development project. Its predictions should not be treated as definitive financial advice or used as the sole basis for real-world lending decisions.

## Author

Developed as an AI and machine learning project exploring credit risk prediction, explainable AI, and workflow automation.
