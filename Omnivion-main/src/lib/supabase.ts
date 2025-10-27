// Mock data service to replace Supabase
export type UserRole = 'admin' | 'hod' | 'teacher';
export type RiskLevel = 'high' | 'medium' | 'low';
export type UploadStatus = 'processing' | 'completed' | 'failed';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  department: string | null;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  hod_id: string | null;
  created_at: string;
}

export interface Student {
  id: string;
  student_id: string;
  name: string;
  email: string | null;
  department_id: string;
  semester: number;
  cgpa: number;
  attendance_percentage: number;
  family_income: number;
  distance_from_home: number;
  previous_backlogs: number;
  created_at: string;
  updated_at: string;
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

export interface Upload {
  id: string;
  uploaded_by: string;
  filename: string;
  total_students: number;
  processed_count: number;
  status: UploadStatus;
  uploaded_at: string;
}

// Mock data
const mockDepartments: Department[] = [
  { id: '1', name: 'Computer Science', code: 'CS', hod_id: 'dev-hod-cs', created_at: new Date().toISOString() },
  { id: '2', name: 'Electronics and Communication', code: 'ECE', hod_id: 'dev-hod-ece', created_at: new Date().toISOString() },
  { id: '3', name: 'Mechanical Engineering', code: 'Mech', hod_id: 'dev-hod-mech', created_at: new Date().toISOString() },
  { id: '4', name: 'Civil Engineering', code: 'Civil', hod_id: 'dev-hod-civil', created_at: new Date().toISOString() },
  { id: '5', name: 'Commerce', code: 'Commerce', hod_id: 'dev-hod-commerce', created_at: new Date().toISOString() },
  { id: '6', name: 'Arts', code: 'Arts', hod_id: 'dev-hod-arts', created_at: new Date().toISOString() },
  { id: '7', name: 'Biology', code: 'Bio', hod_id: 'dev-hod-bio', created_at: new Date().toISOString() },
];

const mockStudents: Student[] = [
  {
    id: '1',
    student_id: 'CS001',
    name: 'John Doe',
    email: 'john.doe@college.edu',
    department_id: '1',
    semester: 6,
    cgpa: 7.5,
    attendance_percentage: 85,
    family_income: 50000,
    distance_from_home: 25,
    previous_backlogs: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    student_id: 'CS002',
    name: 'Jane Smith',
    email: 'jane.smith@college.edu',
    department_id: '1',
    semester: 4,
    cgpa: 6.2,
    attendance_percentage: 70,
    family_income: 30000,
    distance_from_home: 45,
    previous_backlogs: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Add more mock students as needed
];

const mockPredictions: Prediction[] = [
  {
    id: '1',
    student_id: '1',
    risk_level: 'low',
    dropout_probability: 0.15,
    contributing_factors: [
      { factor: 'CGPA', weight: 0.3, description: 'Good academic performance' },
      { factor: 'Attendance', weight: 0.25, description: 'Regular attendance' },
    ],
    recommendations: [
      { action: 'Continue current performance', priority: 'low', description: 'Student is performing well' },
    ],
    predicted_at: new Date().toISOString(),
    model_version: '1.0',
  },
  {
    id: '2',
    student_id: '2',
    risk_level: 'high',
    dropout_probability: 0.75,
    contributing_factors: [
      { factor: 'CGPA', weight: 0.3, description: 'Below average performance' },
      { factor: 'Attendance', weight: 0.25, description: 'Poor attendance' },
      { factor: 'Previous Backlogs', weight: 0.2, description: 'Multiple backlogs' },
    ],
    recommendations: [
      { action: 'Academic counseling', priority: 'high', description: 'Immediate intervention required' },
      { action: 'Attendance monitoring', priority: 'high', description: 'Track and improve attendance' },
    ],
    predicted_at: new Date().toISOString(),
    model_version: '1.0',
  },
];

// Mock API functions
export const mockApi = {
  from: (table: string) => ({
    select: (_columns = '*') => ({
      eq: (_column: string, _value: unknown) => ({
        maybeSingle: async () => {
          if (table === 'profiles') {
            // Return null for mock - auth context will handle mock profiles
            return { data: null, error: null };
          }
          return { data: null, error: null };
        },
        single: async () => {
          return { data: null, error: null };
        },
      }),
      order: (_column: string, _options?: unknown) => ({
        async then(resolve: (value: { data: unknown[]; error: null }) => void) {
          let data: unknown[] = [];
          switch (table) {
            case 'departments':
              data = mockDepartments;
              break;
            case 'students':
              data = mockStudents;
              break;
            case 'predictions':
              data = mockPredictions;
              break;
            default:
              data = [];
          }
          return resolve({ data, error: null });
        }
      }),
      async then(resolve: (value: { data: unknown[]; error: null }) => void) {
        let data: unknown[] = [];
        switch (table) {
          case 'departments':
            data = mockDepartments;
            break;
          case 'students':
            data = mockStudents;
            break;
          case 'predictions':
            data = mockPredictions;
            break;
          default:
            data = [];
        }
        return resolve({ data, error: null });
      }
    }),
    insert: async (data: unknown) => ({ data, error: null }),
    update: async (data: unknown) => ({ data, error: null }),
    delete: async () => ({ data: null, error: null }),
  }),
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (_callback: unknown) => ({
      data: { subscription: { unsubscribe: () => {} } }
    }),
    signInWithPassword: async ({ email: _email, password: _password }: { email: string; password: string }) => {
      return { error: new Error('Use mock authentication in development') };
    },
    signOut: async () => ({ error: null }),
  }
};

// Export the mock API as the default export
export const supabase = mockApi;
