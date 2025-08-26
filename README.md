# SharePoint-AI-Platform
AI-powered documentation management platform with SharePoint integration, featuring smart assignment tracking and intelligent document search.

## Features
- 📋 Real-time assignment management
- 🤖 AI chatbot with document search
- 🔍 Vector-based document search using LangChain
- 📁 SharePoint integration
- ⚡ Real-time updates with Supabase
- 📊 Interactive dashboard

## Tech Stack
- **Frontend**: React + TypeScript + Material-UI
- **Backend**: Python + FastAPI
- **Database**: Supabase (PostgreSQL + pgvector)
- **AI**: LangChain + OpenAI
- **Integration**: Microsoft Graph API

## Quick Start
1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your keys
3. Run `./start.sh` to start both frontend and backend
4. Open http://localhost:3000

## Environment Setup
See `.env.example` for required environment variables.

## Demo
Run `python backend/seed_demo_data.py` to populate with demo data.
