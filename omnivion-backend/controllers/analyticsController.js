import Student from "../models/Student.js";

/* College-wide stats */
export const getCollegeStats = async (req, res) => {
  try {
    const total = await Student.countDocuments();
    const avgAttendance = await Student.aggregate([
      { $group: { _id: null, avg: { $avg: "$attendance_rate" } } }
    ]);
    const avgCgpa = await Student.aggregate([
      { $group: { _id: null, avg: { $avg: "$cgpa" } } }
    ]);
    const dropoutAvg = await Student.aggregate([
      { $group: { _id: null, avg: { $avg: "$last_prediction.risk_score" } } }
    ]);

    res.json({
      total,
      avgAttendance: avgAttendance[0]?.avg ?? 0,
      avgCgpa: avgCgpa[0]?.avg ?? 0,
      avgRisk: dropoutAvg[0]?.avg ?? 0
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* Dept stats (for HOD) */
export const getDeptStats = async (req, res) => {
  try {
    const dept = req.user.department;
    const total = await Student.countDocuments({ department: dept });
    const avgAttendance = await Student.aggregate([
      { $match: { department: dept } },
      { $group: { _id: null, avg: { $avg: "$attendance_rate" } } }
    ]);
    const avgCgpa = await Student.aggregate([
      { $match: { department: dept } },
      { $group: { _id: null, avg: { $avg: "$cgpa" } } }
    ]);
    res.json({
      total,
      avgAttendance: avgAttendance[0]?.avg ?? 0,
      avgCgpa: avgCgpa[0]?.avg ?? 0
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
