# AI Resume Scanner & HR Platform 🚀

A comprehensive, full-stack AI-driven recruitment platform designed to intelligently parse, match, and evaluate candidate resumes against Job Descriptions using Natural Language Processing and local offline Generative AI.

![V2 Dashboard View](./frontend/public/dashboard_preview.png)

## 🌟 Key Features
- **Automated Resume & JD Parsing**: Instantly extracts years of experience, core skills, and education from `.txt`, `.pdf`, and `.docx` files.
- **Dual Matching Engine**: 
  - *Heuristic NLP*: Uses Spacy to cross-reference extracted candidate skills against JD requirements.
  - *Semantic AI*: Uses `sentence-transformers` for deep-context cosine similarity matching.
- **Local Offline Generative Insights**: Seamlessly integrated with **Ollama** (`llama3`) to natively generate specific strengths, missing skill gaps, and personalized candidate interview questions completely offline.
- **Rich Dashboard Interface**: A gorgeous, responsive React + Tailwind frontend with data visualizations, metric tracking, and simple drag-and-drop file uploaders.
- **API First**: Powered by a lightning-fast FastAPI backend natively structured for microservice scalability.
- **Fully Dockerized**: 1-click containerized deployment for both backend models and frontend interface.

## 🏗️ Architecture Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide React, Axios.
- **Backend**: Python 3.10, FastAPI, Uvicorn, Pydantic.
- **AI & NLP Processing**: 
  - `Spacy` (en_core_web_sm) for entity recognition.
  - `SentenceTransformers` (all-MiniLM-L6-v2) for semantic text embedding.
  - `Scikit-learn` for cosine similarity vector math.
  - `Ollama` for local Large Language Model inferencing.

---

## 🚀 Quickstart & Installation

### 1. Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose installed.
- [Ollama](https://ollama.ai/) installed locally on your host machine with the `llama3` model pulled (`ollama run llama3`).

### 2. Setup the AI Model
Initialize the custom HR persona model using the provided Modelfile:
```bash
ollama create resume_scanner -f backend/Modelfile
```

### 3. Spin up the Platform (Docker)
Start the entire stack using Docker Compose. The backend will automatically map to your host's Ollama instance.
```bash
docker-compose up --build
```

### 4. Access the Application
- **Frontend Dashboard**: Navigate to `http://localhost:5175`
- **Backend API Docs (Swagger)**: Navigate to `http://localhost:8000/docs`

---

## 🧠 How the AI Works under the hood
1. Documents are uploaded via the React frontend and transmitted as Multipart forms to FastAPI.
2. PyPDF2 reads the binary buffers.
3. Spacy extracts customized tokens mapped to a vast tech-industry vocabulary.
4. Matrix multiplication determines raw experience and skill vectors.
5. The processed dictionary is serialized to JSON and POSTed to your local `http://localhost:11434/api/generate` (Ollama) wrapping a strict prompt payload.
6. The AI returns the final `strengths`, `gaps`, and `interview_questions`.

## 📁 Project Structure
```text
├── backend/
│   ├── app.py                 # FastAPI routing and global in-memory state
│   ├── jd_parser.py           # Extracts requirements from JDs
│   ├── resume_parser.py       # Extracts metrics from Resumes
│   ├── matcher.py             # Cosine similarity math engine
│   ├── llm_generator.py       # Interfaces with Ollama for gen-insights
│   ├── Modelfile              # Instructions tying Llama3 to the HR persona
│   └── requirements.txt       # Python dependencies
├── frontend/                  # React + Tailwind V2 Dashboard application
├── docker-compose.yml         # Container orchestration
└── README.md                  # Project documentation
```
