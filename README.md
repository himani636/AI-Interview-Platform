AI Interview Platform 🚀

An AI-powered interview preparation platform that analyzes resumes and job descriptions to generate personalized interview reports and interview preparation guidance.

## Features

- User Registration and Login
- JWT Authentication
- Resume Upload
- Resume Text Extraction
- AI Generated Interview Reports
- Job Description Analysis
- Technical Question Generation
- Behavioral Question Generation
- Skill Gap Analysis
- Preparation Plan Generation
- Resume PDF Generation
- Protected Routes

## Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- SCSS
- React Router
- Context API
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Multer
- PDF Parser

### AI
- Generative AI API Integration
- Prompt Engineering

## Project Structure


AI-Interview-Platform/

├── Frontend/
│ ├── src/
│ └── package.json
│
├── Backend/
│ ├── src/
│ └── package.json
│
└── README.md


## Installation

### Clone Repository

```bash
git clone https://github.com/himani636/AI-Interview-Platform.git
Backend Setup
cd Backend
npm install

Create .env file:

PORT=3000
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret_key
AI_API_KEY=your_api_key

Run backend:

npm start
Frontend Setup
cd Frontend
npm install
npm run dev
Future Improvements
AI Mock Interview
Voice Interview Support
Interview Performance Scoring
Cloud Deployment
Author Himani