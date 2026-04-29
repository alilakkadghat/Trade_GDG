# 🌍 TradeBot Insights

**TradeBot Insights** is a cutting-edge Document Intelligence platform designed to revolutionize international trade operations. By leveraging advanced AI models (Gemini), high-fidelity document parsing (Docling), and interactive 3D visualizations, it automates document extraction, validation, and compliance checking.

---

## ✨ Key Features

### 🔍 Document Intelligence & RAG
- **AI-Powered Extraction**: Automatically extract structured data from complex trade documents (Invoices, Bills of Lading, Packing Lists) using **IBM Docling** and **Google Gemini**.
- **Contextual RAG Query**: Ask natural language questions about your uploaded documents and get precise answers backed by indexed document data.
- **Automated Classification**: Intelligent categorization of documents with confidence scores.

### ⚖️ Compliance & Validation
- **Cross-Document Validation**: Ensure consistency across different trade documents (e.g., verifying that the HS Code on an invoice matches the Bill of Lading).
- **Rule-Based Compliance**: Automated checks against global trade regulations and custom business rules.
- **Risk Assessment**: Real-time identification of discrepancies and potential compliance risks.

### 📊 Advanced Visualizations
- **Interactive 3D Globe**: Visualize global trade flows and port locations using **Three.js** and **React Three Fiber**.
- **Dynamic Dashboard**: Real-time analytics and insights using **Recharts**.
- **Geographic Insights**: Integration with **Leaflet** and **D3-geo** for detailed mapping of trade routes and delays.

### 🛡️ Enterprise-Ready Core
- **Secure Authentication**: Robust user management and row-level security powered by **Supabase**.
- **Modern Tech Stack**: Built with **Next.js 15 (App Router)** and **FastAPI**.
- **Dockerized Architecture**: Simplified deployment using Docker and Docker Compose.

---

## 🏗️ Architecture

The project follows a decoupled client-server architecture:

- **Frontend**: A highly interactive Next.js application focused on visual excellence and seamless user experience.
- **Backend**: A high-performance Python FastAPI server handling heavy-duty AI processing, document parsing, and vector embeddings.
- **Database**: Supabase (PostgreSQL) with `pgvector` for efficient similarity searches in RAG operations.

### System Architecture

```mermaid
graph TD
    User([User]) --> Frontend[Next.js Frontend]
    
    subgraph "Client Side"
        Frontend
    end
    
    Frontend <-> Backend[FastAPI Backend]
    
    subgraph "Server Side"
        Backend
        Backend --> Docling[Docling Parser]
        Backend --> Gemini[Google Gemini AI]
    end
    
    subgraph "Cloud Services"
        Backend <-> Supabase[(Supabase)]
        Supabase --- Auth[Auth]
        Supabase --- DB[(PostgreSQL + pgvector)]
        Supabase --- Storage[Storage]
    end
    
    Docling --> Backend
    Gemini --> Backend
```


---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4, Radix UI, Lucide React
- **Visualization**: Three.js, React Three Fiber, Recharts, Leaflet, D3-geo
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **AI/LLM**: Google Gemini API, LangChain
- **Parsing**: IBM Docling
- **Database Client**: Supabase Python SDK

### Infrastructure
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Containerization**: Docker, Docker Compose

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.10+)
- [Docker](https://www.docker.com/) (Optional, for containerized setup)
- A [Supabase](https://supabase.com/) project
- A [Google AI Studio](https://aistudio.google.com/) API Key (for Gemini)

### Environment Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tradeflow-insights
   ```

2. Configure environment variables:
   Create a `.env` file in the `tradeflow-insights` directory (refer to `.env.example`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   NEWS_API_KEY=your_news_api_key
   SHIPSGO_API_KEY=your_shipsgo_api_key
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

### Running Locally

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

#### 2. Frontend Setup
```bash
# From the tradeflow-insights root
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the application.

### Running with Docker
```bash
docker-compose up --build
```

---

## 📁 Project Structure

```text
tradeflow-insights/
├── src/                # Next.js Frontend
│   ├── app/            # App Router pages & layouts
│   ├── components/     # UI Components (Shadcn UI)
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Shared utilities & Supabase client
│   └── types/          # TypeScript definitions
├── backend/            # FastAPI Backend
│   ├── services/       # AI, Parsing, and Storage logic
│   ├── models/         # Pydantic models
│   └── scripts/        # Database setup scripts
├── data_for_RAG/       # Sample data for indexing
└── docker-compose.yml  # Docker configuration
```

---

## 📡 API Endpoints

### Documents & Extraction
- **`POST /api/documents/upload`**: The primary ingestion endpoint. It parses files with Docling, classifies them, extracts fields with Gemini, and generates vector embeddings.
- **`GET /api/documents`**: Retrieves processed documents, including extracted metadata and processing status.
- **`GET /api/documents/{id}`**: Detailed view of a single document and its extracted fields.

### Intelligence & RAG
- **`POST /api/query`**: Executes a RAG (Retrieval-Augmented Generation) query. Searches the vector database for relevant chunks and uses Gemini to answer questions about the trade documents.

### Validation & Compliance
- **`POST /api/transactions/{id}/validate`**: Performs cross-document consistency checks (e.g., verifying HS codes across Invoice and Bill of Lading).
- **`POST /api/transactions/{id}/compliance`**: Runs automated compliance rules against extracted data.
- **`GET /api/transactions/{id}/validations`**: Retrieves historical validation results.

### Core Resources
- **`GET /api/transactions`**: Lists or creates trade transactions/containers.
- **`GET /api/health`**: System status and dependency check.


---

## 📜 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

*Built with ❤️ by ALI,NAMAN,MAHIRIE,AVNI*
