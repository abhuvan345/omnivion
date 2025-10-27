import multer from "multer";
import fs from "fs";
import FormData from "form-data";
import axios from "axios";
import path from "path";

const upload = multer({ dest: "uploads/" });

export const uploadCSV = [
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "CSV file required" });

      const filePath = path.resolve(req.file.path);
      const form = new FormData();
      form.append("file", fs.createReadStream(filePath));

      const response = await axios.post(process.env.PYTHON_API_URL, form, {
        headers: {
          ...form.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      // cleanup file
      fs.unlinkSync(filePath);

      // Response is array of student objects with dropout_risk field
      res.json(response.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
      res.status(500).json({ message: err.message });
    }
  }
];
