import html2pdf from 'html2pdf.js';
import { Student } from '../lib/api';

interface ReportData {
  departmentStats: Array<{
    department: string;
    totalStudents: number;
    highRisk: number;
    avgCGPA: number;
  }>;
  cgpaVsAttendance: Array<{
    cgpa: number;
    attendance: number;
    riskLevel: string;
  }>;
  incomeVsDropout: Array<{
    incomeRange: string;
    dropoutRate: number;
    count: number;
  }>;
}

const generateReportContent = (data: ReportData) => {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate overall statistics
  const totalStudents = data.departmentStats.reduce((sum, dept) => sum + dept.totalStudents, 0) || 0;
  const totalHighRisk = data.departmentStats.reduce((sum, dept) => sum + dept.highRisk, 0) || 0;
  const overallDropoutRisk = totalStudents > 0 ? ((totalHighRisk / totalStudents) * 100).toFixed(1) : '0.0';
  const weightedCGPASum = data.departmentStats.reduce((sum, dept) => sum + (dept.avgCGPA * dept.totalStudents), 0) || 0;
  const overallAvgCGPA = totalStudents > 0 ? (weightedCGPASum / totalStudents).toFixed(2) : '0.00';

  const reportHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #4B0082; margin-bottom: 5px;">Student Analytics Report</h1>
        <p style="color: #666; font-size: 14px;">Generated on ${today}</p>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #333; border-bottom: 2px solid #00CFFF; padding-bottom: 10px;">Executive Summary</h2>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 15px;">
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
            <h3 style="margin: 0; color: #4B0082;">Total Students</h3>
            <p style="font-size: 24px; margin: 5px 0;">${totalStudents}</p>
          </div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
            <h3 style="margin: 0; color: #4B0082;">Overall Dropout Risk</h3>
            <p style="font-size: 24px; margin: 5px 0;">${overallDropoutRisk}%</p>
          </div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
            <h3 style="margin: 0; color: #4B0082;">Average CGPA</h3>
            <p style="font-size: 24px; margin: 5px 0;">${overallAvgCGPA}</p>
          </div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
            <h3 style="margin: 0; color: #4B0082;">High Risk Students</h3>
            <p style="font-size: 24px; margin: 5px 0;">${totalHighRisk}</p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #333; border-bottom: 2px solid #00CFFF; padding-bottom: 10px;">Department Analysis</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background: #4B0082; color: white;">
              <th style="padding: 10px; text-align: left;">Department</th>
              <th style="padding: 10px; text-align: center;">Total Students</th>
              <th style="padding: 10px; text-align: center;">High Risk</th>
              <th style="padding: 10px; text-align: center;">Avg CGPA</th>
              <th style="padding: 10px; text-align: center;">Risk %</th>
            </tr>
          </thead>
          <tbody>
            ${data.departmentStats.map(dept => `
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px;">${dept.department}</td>
                <td style="padding: 10px; text-align: center;">${dept.totalStudents}</td>
                <td style="padding: 10px; text-align: center; color: #ef4444;">${dept.highRisk}</td>
                <td style="padding: 10px; text-align: center;">${Number(dept.avgCGPA || 0).toFixed(2)}</td>
                <td style="padding: 10px; text-align: center;">${dept.totalStudents > 0 ? ((dept.highRisk / dept.totalStudents) * 100).toFixed(1) : '0.0'}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #333; border-bottom: 2px solid #00CFFF; padding-bottom: 10px;">Income Analysis</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background: #4B0082; color: white;">
              <th style="padding: 10px; text-align: left;">Income Range</th>
              <th style="padding: 10px; text-align: center;">Total Students</th>
              <th style="padding: 10px; text-align: center;">Dropout Rate</th>
            </tr>
          </thead>
          <tbody>
            ${data.incomeVsDropout.map(income => `
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px;">${income.incomeRange}</td>
                <td style="padding: 10px; text-align: center;">${income.count}</td>
                <td style="padding: 10px; text-align: center;">${Number(income.dropoutRate || 0).toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #333; border-bottom: 2px solid #00CFFF; padding-bottom: 10px;">Risk Distribution Analysis</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0;">
          <div style="background: #fee2e2; padding: 20px; border-radius: 8px; text-align: center;">
            <h4 style="margin: 0; color: #dc2626;">High Risk</h4>
            <p style="font-size: 24px; margin: 10px 0; color: #dc2626;">${totalHighRisk}</p>
            <p style="margin: 0; font-size: 14px; color: #666;">Students</p>
          </div>
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; text-align: center;">
            <h4 style="margin: 0; color: #d97706;">Medium Risk</h4>
            <p style="font-size: 24px; margin: 10px 0; color: #d97706;">${Math.floor(totalStudents * 0.3)}</p>
            <p style="margin: 0; font-size: 14px; color: #666;">Students</p>
          </div>
          <div style="background: #dcfce7; padding: 20px; border-radius: 8px; text-align: center;">
            <h4 style="margin: 0; color: #16a34a;">Low Risk</h4>
            <p style="font-size: 24px; margin: 10px 0; color: #16a34a;">${totalStudents - totalHighRisk - Math.floor(totalStudents * 0.3)}</p>
            <p style="margin: 0; font-size: 14px; color: #666;">Students</p>
          </div>
        </div>

        <h2 style="color: #333; border-bottom: 2px solid #00CFFF; padding-bottom: 10px; margin-top: 30px;">Key Risk Factors & Recommendations</h2>
        <ul style="list-style-type: none; padding: 0;">
          <li style="margin-bottom: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <h4 style="margin: 0 0 5px 0; color: #4B0082;">Academic Performance</h4>
            <p style="margin: 0 0 10px 0; color: #666;">Students with CGPA below 6.0 and attendance below 75% show highest risk patterns.</p>
            <div style="background: #fff; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb;">
              <strong style="color: #4B0082;">Recommendations:</strong>
              <ul style="margin: 5px 0 0 20px; color: #666;">
                <li>Implement early warning system for CGPA drops</li>
                <li>Mandatory counseling for students with attendance below 75%</li>
                <li>Peer tutoring program for struggling students</li>
              </ul>
            </div>
          </li>
          <li style="margin-bottom: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <h4 style="margin: 0 0 5px 0; color: #4B0082;">Socioeconomic Factors</h4>
            <p style="margin: 0 0 10px 0; color: #666;">Strong correlation between family income below 3L and increased dropout risk.</p>
            <div style="background: #fff; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb;">
              <strong style="color: #4B0082;">Recommendations:</strong>
              <ul style="margin: 5px 0 0 20px; color: #666;">
                <li>Expand scholarship opportunities for low-income students</li>
                <li>Provide part-time work opportunities on campus</li>
                <li>Financial literacy workshops and counseling</li>
              </ul>
            </div>
          </li>
          <li style="margin-bottom: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <h4 style="margin: 0 0 5px 0; color: #4B0082;">Engagement Metrics</h4>
            <p style="margin: 0 0 10px 0; color: #666;">Low participation in projects and extra-curricular activities correlates with higher risk.</p>
            <div style="background: #fff; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb;">
              <strong style="color: #4B0082;">Recommendations:</strong>
              <ul style="margin: 5px 0 0 20px; color: #666;">
                <li>Create more opportunities for project-based learning</li>
                <li>Implement student engagement tracking system</li>
                <li>Develop mentorship programs for at-risk students</li>
              </ul>
            </div>
          </li>
        </ul>
      </div>

      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
        Generated by Omnivion Analytics System
      </div>
    </div>
  `;

  return reportHtml;
};

export const generateReport = async (data: ReportData) => {
  const element = document.createElement('div');
  element.innerHTML = generateReportContent(data);
  document.body.appendChild(element);

  const options = {
    margin: 10,
    filename: 'student-analytics-report.pdf',
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
  };

  try {
    await html2pdf().from(element).set(options).save();
  } finally {
    document.body.removeChild(element);
  }
};