# SharePoint AI Platform Backend

A FastAPI-based backend with OneDrive integration, Supabase database, and AI-powered document management.

## ✨ Features

- 🔐 **User Authentication** - JWT-based auth with Microsoft SSO
- ☁️ **OneDrive Integration** - Upload, sync, and manage files
- 📊 **Assignment Management** - Create, track, and update assignments
- 🤖 **AI Chat Assistant** - Intelligent document search and insights
- 📚 **Document Management** - Full-text search and organization
- 🚀 **RESTful API** - Complete CRUD operations for all resources

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your configurations:

```env
# Supabase Configuration
SUPABASE_URL=https://ucydttijehacthurnuov.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# Microsoft Azure (for OneDrive)
MICROSOFT_CLIENT_ID=your_azure_client_id
MICROSOFT_CLIENT_SECRET=your_azure_client_secret
MICROSOFT_TENANT_ID=common
MICROSOFT_REDIRECT_URI=http://localhost:8000/api/auth/microsoft/callback

# JWT Security
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
```

### 3. Start the Server

```bash
python run.py
```

The API will be available at:
- **API Server:** http://localhost:8000
- **Documentation:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

## 🔧 Microsoft Azure Setup (for OneDrive)

### 1. Create Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Configure:
   - **Name:** SharePoint AI Platform
   - **Supported account types:** Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI:** `http://localhost:8000/api/auth/microsoft/callback`

### 2. Configure API Permissions

Add these Microsoft Graph permissions:
- `Files.ReadWrite` - Read and write user files
- `Files.ReadWrite.All` - Read and write all files (optional)
- `User.Read` - Sign in and read user profile

### 3. Get Credentials

From your app registration:
- **Application (client) ID** → `MICROSOFT_CLIENT_ID`
- **Client Secret** → `MICROSOFT_CLIENT_SECRET`
- **Directory (tenant) ID** → `MICROSOFT_TENANT_ID`

## 📚 API Endpoints

### Authentication
```bash
POST /api/auth/login              # Email/password login
POST /api/auth/register           # User registration
GET  /api/auth/microsoft/connect  # Get OneDrive auth URL
GET  /api/auth/microsoft/callback # Handle OneDrive callback
GET  /api/auth/onedrive/status    # Check OneDrive connection
GET  /api/auth/me                 # Get current user info
```

### Assignments
```bash
GET    /api/assignments           # Get user assignments
POST   /api/assignments           # Create assignment
GET    /api/assignments/{id}      # Get specific assignment
PUT    /api/assignments/{id}      # Update assignment
DELETE /api/assignments/{id}      # Delete assignment
PATCH  /api/assignments/{id}/status # Quick status update
GET    /api/assignments/stats/summary # Get assignment statistics
```

### Documents
```bash
GET    /api/documents             # Get user documents
POST   /api/documents/upload      # Upload document to OneDrive
GET    /api/documents/onedrive/files # List OneDrive files
POST   /api/documents/onedrive/sync # Sync OneDrive files to database
GET    /api/documents/{id}/download # Download document
DELETE /api/documents/{id}        # Delete document
GET    /api/documents/search/{query} # Search documents
```

### AI Chat
```bash
POST /api/chat                    # Send message to AI
GET  /api/chat/history            # Get chat history
GET  /api/chat/sessions           # Get chat sessions
GET  /api/chat/suggestions        # Get suggested prompts
DELETE /api/chat/sessions/{id}    # Delete chat session
```

## 🧪 Testing the Backend

### 1. Health Check
```bash
curl http://localhost:8000/health
```

### 2. Test OneDrive Connection
```bash
# Get auth URL
curl http://localhost:8000/api/auth/microsoft/connect

# Visit the returned auth_url in browser to connect OneDrive
```

### 3. Test API with Authentication

First, register/login to get a token:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","name":"Test User"}'
```

Then use the token for protected endpoints:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/assignments
```

## 🔍 Example API Calls

### Create an Assignment
```bash
curl -X POST http://localhost:8000/api/assignments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete API Documentation",
    "description": "Write comprehensive API docs",
    "priority": "high",
    "due_date": "2024-12-31"
  }'
```

### Upload Document to OneDrive
```bash
curl -X POST http://localhost:8000/api/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf"
```

### Chat with AI
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What assignments do I have?",
    "session_id": "optional-session-id"
  }'
```

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based authentication
- **CORS Protection** - Configured for frontend domains
- **Input Validation** - Pydantic models for all inputs
- **Error Handling** - Comprehensive error responses
- **Rate Limiting** - Built-in FastAPI rate limiting

## 🐛 Troubleshooting

### Common Issues

1. **Supabase Connection Failed**
   - Check your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
   - Ensure your Supabase project is active

2. **OneDrive Authentication Failing**
   - Verify Azure app registration settings
   - Check redirect URI matches exactly
   - Ensure correct permissions are granted

3. **CORS Issues**
   - Frontend URL must be in CORS origins
   - Check that frontend is running on expected port

4. **Import Errors**
   - Run `pip install -r requirements.txt` again
   - Check Python version compatibility (3.8+)

### Debug Mode

Set `DEBUG=True` in your `.env` file for detailed error messages and auto-reload.

## 📦 Dependencies

Key libraries used:
- **FastAPI** - Modern, fast web framework
- **Supabase** - Database and real-time subscriptions
- **MSAL** - Microsoft authentication library
- **Pydantic** - Data validation and serialization
- **python-jose** - JWT token handling
- **uvicorn** - ASGI server

## 🚀 Production Deployment

For production deployment:

1. Set `DEBUG=False`
2. Use a strong `JWT_SECRET_KEY`
3. Configure proper CORS origins
4. Set up SSL/HTTPS
5. Use a production ASGI server like Gunicorn
6. Configure proper logging
7. Set up monitoring and health checks

## 🤝 Contributing

1. Follow FastAPI best practices
2. Add proper error handling
3. Include docstrings for all functions
4. Test all endpoints thoroughly
5. Update documentation for new features