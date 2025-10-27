import Student from "../models/Student.js";

/* Admin: get all students */
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ student_id: 1 });
    res.json(students);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* HOD: get only department students */
export const getDeptStudents = async (req, res) => {
  try {
    const dept = req.user.department;
    const students = await Student.find({ department: dept }).sort({ student_id: 1 });
    res.json(students);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* Teacher: get students of a particular class - we will accept query param classId or department+filter */
export const getClassStudents = async (req, res) => {
  try {
    const { department, classId } = req.query; // adapt to your dataset fields
    const filter = {};
    if (department) filter.department = department;
    if (classId) filter.class_id = classId;
    const students = await Student.find(filter).sort({ student_id: 1 });
    res.json(students);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* Create student (admin) */
export const createStudent = async (req, res) => {
  try {
    const s = new Student(req.body);
    await s.save();
    res.status(201).json(s);
  } catch (err) { res.status(400).json({ message: err.message }); }
};
