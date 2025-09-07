// API service for backend communication
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

interface AssignmentCreate {
  title: string;
  description?: string;
  priority?: string;
  due_date?: string;
  assignee_id?: string;
  project_id?: string;
}

interface AssignmentUpdate {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  progress?: number;
}

interface ChatMessage {
  message: string;
  session_id?: string;
}

class ApiService {
  private userEmail: string | null = null;

  constructor() {
    // Load user email from localStorage (development mode)
    this.userEmail = localStorage.getItem('user_email');
  }

  setUserEmail(email: string) {
    this.userEmail = email;
    localStorage.setItem('user_email', email);
  }

  clearUserEmail() {
    this.userEmail = null;
    localStorage.removeItem('user_email');
  }

  private getHeaders(includeAuth: boolean = true) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.userEmail) {
      headers['x-user-email'] = this.userEmail;
    }

    return headers;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || 'Request failed');
    }
    return response.json();
  }

  // Authentication endpoints
  async login(credentials: LoginRequest) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(credentials),
    });
    return this.handleResponse(response);
  }

  async register(userData: RegisterRequest) {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/api/auth/users`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Project endpoints
  async getProjects() {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }


  // Assignment endpoints
  async getAssignments() {
    const response = await fetch(`${API_BASE_URL}/api/assignments`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createAssignment(assignment: AssignmentCreate) {
    const response = await fetch(`${API_BASE_URL}/api/assignments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(assignment),
    });
    return this.handleResponse(response);
  }

  async updateAssignment(id: string, assignment: AssignmentUpdate) {
    const response = await fetch(`${API_BASE_URL}/api/assignments/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(assignment),
    });
    return this.handleResponse(response);
  }

  async updateAssignmentStatus(id: string, status: string, progress?: number) {
    const response = await fetch(`${API_BASE_URL}/api/assignments/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, progress }),
    });
    return this.handleResponse(response);
  }

  async deleteAssignment(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/assignments/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getAssignmentStats() {
    const response = await fetch(`${API_BASE_URL}/api/assignments/stats/summary`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Document endpoints
  async getDocuments() {
    const response = await fetch(`${API_BASE_URL}/api/documents`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async uploadDocument(file: File, projectId?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (projectId) {
      formData.append('project_id', projectId);
    }

    const headers: HeadersInit = {};
    if (this.userEmail) {
      headers['x-user-email'] = this.userEmail;
    }

    const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return this.handleResponse(response);
  }


  async searchDocuments(query: string) {
    const response = await fetch(`${API_BASE_URL}/api/documents/search/${encodeURIComponent(query)}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Chat endpoints
  async sendChatMessage(message: ChatMessage) {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(message),
    });
    return this.handleResponse(response);
  }

  async getChatHistory(sessionId?: string, limit: number = 50) {
    const params = new URLSearchParams();
    if (sessionId) params.append('session_id', sessionId);
    params.append('limit', limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/chat/history?${params}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getChatSessions() {
    const response = await fetch(`${API_BASE_URL}/api/chat/sessions`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getChatSuggestions() {
    const response = await fetch(`${API_BASE_URL}/api/chat/suggestions`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // OneDrive specific endpoints
  async checkOneDriveConnection() {
    const response = await fetch(`${API_BASE_URL}/api/documents/onedrive/status`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async connectOneDrive() {
    const response = await fetch(`${API_BASE_URL}/api/auth/microsoft/connect`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Health check
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return this.handleResponse(response);
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;