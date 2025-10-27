import axios, { AxiosInstance } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Types
export type UserRole = 'admin' | 'hod' | 'teacher';
export type RiskLevel = 'high' | 'medium' | 'low';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
}

export interface AuthResponse {
  token: string;
  role: UserRole;
  name: string;
  department?: string;
  email: string;
}

export interface Student {
  _id: string;
  student_id: string;
  gender: number; // 0=Female, 1=Male, 2=Other
  department: number; // 0=ARTS, 1=BIOLOGY, 2=CIVIL, 3=COMMERCE, 4=COMPUTER SCIENCE, 5=ELECTRONICS, 6=MECHANICAL
  scholarship: number; // 0=No, 1=Partial, 2=Yes
  parental_education?: number;
  extra_curricular?: number;
  age?: number;
  cgpa?: number;
  attendance_rate?: number;
  family_income?: number;
  past_failures?: number;
  study_hours_per_week?: number;
  assignments_submitted?: number;
  projects_completed?: number;
  total_activities?: number;
  sports_participation?: number;
  dropout?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Prediction {
  id: string;
  student_id: string;
  risk_level: RiskLevel;
  dropout_probability: number;
  contributing_factors: Array<{ factor: string; weight: number; description: string }>;
  recommendations: Array<{ action: string; priority: string; description: string }>;
  predicted_at: string;
  model_version: string;
}

// API Client Setup
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('omnivion_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('omnivion_token');
          localStorage.removeItem('omnivion_user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    department?: string;
  }): Promise<{ message: string }> {
    const response = await this.client.post('/auth/register', userData);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async getAllUsers(): Promise<User[]> {
    const response = await this.client.get('/auth/users');
    return response.data;
  }

  // Student methods
  async getAllStudents(): Promise<Student[]> {
    const response = await this.client.get('/students');
    return response.data;
  }

  async getDepartmentStudents(): Promise<Student[]> {
    const response = await this.client.get('/students/dept');
    return response.data;
  }

  async getClassStudents(): Promise<Student[]> {
    const response = await this.client.get('/students/class');
    return response.data;
  }

  async createStudent(studentData: Partial<Student>): Promise<Student> {
    const response = await this.client.post('/students', studentData);
    return response.data;
  }

  // Upload methods
  async uploadStudentData(file: File): Promise<{ message: string; studentsProcessed: number }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Analytics methods (placeholder - you may need to implement these in backend)
  async getAnalyticsData(): Promise<any> {
    try {
      const response = await this.client.get('/analytics');
      return response.data;
    } catch (error) {
      // Return mock data if analytics endpoint doesn't exist yet
      return this.getMockAnalyticsData();
    }
  }

  // Prediction methods
  async getPrediction(studentData: Partial<Student>): Promise<Prediction> {
    const response = await this.client.post('/predictions/predict', studentData);
    return response.data;
  }

  async getBatchPredictions(students: Student[]): Promise<{ predictions: Prediction[]; total_processed: number; model_version: string }> {
    const response = await this.client.post('/predictions/predict-batch', { students });
    return response.data;
  }

  async checkMLHealth(): Promise<{ status: string; ml_service?: { status: string; model_loaded: boolean } }> {
    const response = await this.client.get('/predictions/health');
    return response.data;
  }

  // Mock data methods (fallback for development)
  private getMockAnalyticsData() {
    return {
      totalStudents: 1250,
      highRiskStudents: 89,
      mediumRiskStudents: 156,
      lowRiskStudents: 1005,
      departmentStats: [
        { department: 'Computer Science', total: 250, highRisk: 15 },
        { department: 'Electronics', total: 200, highRisk: 12 },
        { department: 'Mechanical', total: 180, highRisk: 18 },
        { department: 'Civil', total: 150, highRisk: 10 },
        { department: 'Commerce', total: 220, highRisk: 20 },
        { department: 'Arts', total: 150, highRisk: 8 },
        { department: 'Biology', total: 100, highRisk: 6 },
      ],
      riskTrends: [
        { month: 'Jan', high: 45, medium: 120, low: 785 },
        { month: 'Feb', high: 52, medium: 135, low: 763 },
        { month: 'Mar', high: 61, medium: 142, low: 747 },
        { month: 'Apr', high: 73, medium: 151, low: 726 },
        { month: 'May', high: 85, medium: 158, low: 707 },
        { month: 'Jun', high: 89, medium: 156, low: 705 },
      ],
    };
  }
}

// Create and export API instance
export const api = new ApiClient();

// Utility functions
export const setAuthToken = (token: string) => {
  localStorage.setItem('omnivion_token', token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('omnivion_token');
};

export const removeAuthToken = () => {
  localStorage.removeItem('omnivion_token');
  localStorage.removeItem('omnivion_user');
};

// Export types for use in components
export type { Student as ApiStudent, User as ApiUser };