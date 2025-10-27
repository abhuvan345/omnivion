import { Student } from '../lib/api';

/**
 * Calculate comprehensive dropout prediction risk percentage for a student
 * Based on weighted factors: CGPA, Attendance, Family Income, Past Failures, 
 * Study Hours, Projects, Assignments, and Activities
 * 
 * @param student Student object with academic and engagement metrics
 * @returns Risk percentage (0-100)
 */
export const calculateDropoutRisk = (student: Student): number => {
  let riskScore = 0;

  // CGPA factor (lower CGPA = higher risk) - 25% weight
  if (student.cgpa != null) {
    const cgpaRisk = Math.max(0, (8.0 - Number(student.cgpa)) / 8.0) * 100;
    riskScore += cgpaRisk * 0.25;
  }

  // Attendance factor (lower attendance = higher risk) - 25% weight
  if (student.attendance_rate != null) {
    const attendanceRisk =
      Math.max(0, (85 - Number(student.attendance_rate)) / 85) * 100;
    riskScore += attendanceRisk * 0.25;
  }

  // Family income factor (lower income = higher risk) - 15% weight
  if (student.family_income != null) {
    const familyIncomeRisk =
      Math.max(0, (500000 - Number(student.family_income)) / 500000) * 100;
    riskScore += familyIncomeRisk * 0.15;
  }

  // Past failures factor (more failures = higher risk) - 15% weight
  if (student.past_failures != null) {
    const pastFailuresRisk = Math.min(
      100,
      Number(student.past_failures) * 20
    );
    riskScore += pastFailuresRisk * 0.15;
  }

  // Study hours factor (fewer hours = higher risk) - 10% weight
  if (student.study_hours_per_week != null) {
    const studyHoursRisk =
      Math.max(0, (15 - Number(student.study_hours_per_week)) / 15) * 100;
    riskScore += studyHoursRisk * 0.1;
  }

  // Projects completed factor (fewer projects = higher risk) - 5% weight
  if (student.projects_completed != null) {
    const projectsRisk =
      Math.max(0, (10 - Number(student.projects_completed)) / 10) * 100;
    riskScore += projectsRisk * 0.05;
  }

  // Assignments submitted factor (fewer assignments = higher risk) - 3% weight
  if (student.assignments_submitted != null) {
    const assignmentsRisk =
      Math.max(0, (15 - Number(student.assignments_submitted)) / 15) * 100;
    riskScore += assignmentsRisk * 0.03;
  }

  // Activities factor (fewer activities = higher risk) - 2% weight
  if (student.total_activities != null) {
    const activitiesRisk =
      Math.max(0, (5 - Number(student.total_activities)) / 5) * 100;
    riskScore += activitiesRisk * 0.02;
  }

  return Math.round(Math.min(100, Math.max(0, riskScore)));
};

/**
 * Classify dropout risk level based on percentage
 * @param riskPercentage Risk percentage (0-100)
 * @returns Risk level: 'high' | 'medium' | 'low'
 */
export const getRiskLevel = (riskPercentage: number): 'high' | 'medium' | 'low' => {
  if (riskPercentage >= 70) return 'high';
  if (riskPercentage >= 40) return 'medium';
  return 'low';
};

/**
 * Get Tailwind CSS classes for risk level badge styling
 * @param riskPercentage Risk percentage (0-100)
 * @returns Tailwind CSS class string for styling
 */
export const getRiskColor = (riskPercentage: number): string => {
  if (riskPercentage >= 70)
    return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800';
  if (riskPercentage >= 40)
    return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800';
  return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800';
};
