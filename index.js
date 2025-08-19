import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config()
  //  GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbyf2sotopkgFeDzr1Ag33lnukBr3GoYVEMSgZWbCKrjfUGJ-OCH3ZfWAd_EOO_G2Eg3fQ/exec
  //  PORT=4000

const app = express();
const PORT = process.env.PORT || 4000;
const GOOGLE_SCRIPT_URL =
  process.env.GOOGLE_SCRIPT_URL || "YOUR_NEW_DEPLOYMENT_URL_HERE";

const STUDENT_SUBMISSION_SCRIPT = process.env.STUDENT_SUBMISSION_SCRIPT || "";

console.log("🔍 GOOGLE_SCRIPT_URL:", GOOGLE_SCRIPT_URL);
console.log("🔍 STUDENT_SUBMISSION_SCRIPT:", STUDENT_SUBMISSION_SCRIPT);


// Middleware
app.use(express.json());
app.use(cors()); // Handles CORS automatically





// Health check route
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Proxy server is running" });
});

// Proxy endpoint for inserting rows into Google Sheets via Apps Script
app.post("/api/insert-rows", async (req, res) => {
  try {
    // Forward the payload to the Google Apps Script endpoint
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    // Try to parse as JSON, fallback to text if not JSON
    let data;
    const text = await response.text();

    
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    res.json(data);
  } catch (err) {
    console.error("❌ Proxy error:", err);
    res.status(500).json({ error: err.toString() });
  }
});

// Student form submission endpoint 
app.post("/api/student-submission", async (req, res) => { 
  try { 
    console.log("🔍 Received student submission request"); 
    console.log("🔍 Request body:", JSON.stringify(req.body, null, 2)); 
     
    const submissionData = req.body;
    
    // Validate that we have the required fields 
    if (!submissionData.registrationNumber || !submissionData.name) { 
      console.log("❌ Validation failed - Missing required fields"); 
      return res.status(400).json({  
        success: false,  
        error: 'Missing required fields: registrationNumber and name are mandatory'  
      }); 
    } 

    // Transform the object into the array format expected by Google Apps Script
    const studentDataArray = [
      submissionData.registrationNumber || '',
      submissionData.name || '',
      submissionData.company || '',
      submissionData.course || '',
      submissionData.phone || '',
      submissionData.email || '',
      submissionData.placementDate || '',
      submissionData.package ? `${submissionData.package} LPA` : '',
      submissionData.feedback || '',
      submissionData.submissionDate || new Date().toISOString(),
      'false', // Is Verified - default to false
      'Pending' // Status - default to Pending
    ];

    // Create the payload expected by Google Apps Script
    const payload = {
      action: 'addStudentSubmission', // CHANGED: This was 'handleStudentSubmission' before
      studentData: studentDataArray
    };
 
    console.log("✅ Validation passed, forwarding to Google Apps Script"); 
    console.log("🔍 Transformed payload:", JSON.stringify(payload, null, 2)); 
 
    // Forward the payload to the Google Apps Script endpoint 
    // REMOVED the query parameter since action is in the body
    const response = await fetch(STUDENT_SUBMISSION_SCRIPT, { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(payload),
    }); 
 
    // Try to parse as JSON, fallback to text if not JSON 
    let data; 
    const text = await response.text(); 
    console.log("🔍 Google Apps Script response:", text); 
     
    try { 
      data = JSON.parse(text); 
    } catch { 
      data = { raw: text }; 
    } 
     
    console.log("🔍 Final response data:", JSON.stringify(data, null, 2)); 
    res.json(data); 
  } catch (err) { 
    console.error("❌ Student submission error:", err); 
    res.status(500).json({ error: err.toString() }); 
  } 
});

// Get existing students endpoint
app.get("/api/students", async (req, res) => {
  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getStudents`);
    const result = await response.json();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error || "Failed to fetch students" 
      });
    }
  } catch (err) {
    console.error("❌ Get students error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.toString() 
    });
  }
});

// Check if student exists endpoint
app.get("/api/check-student/:registrationNumber", async (req, res) => {
  try {
    const { registrationNumber } = req.params;
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=checkStudentExists&registrationNumber=${registrationNumber}`);
    const result = await response.json();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error || "Failed to check student" 
      });
    }
  } catch (err) {
    console.error("❌ Check student error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.toString() 
    });
  }
});

// Get companies endpoint
app.get("/api/companies", async (req, res) => {
  try {
    const response = await fetch(`${STUDENT_SUBMISSION_SCRIPT}?action=getCompanies`);
    const result = await response.json();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error || "Failed to fetch companies" 
      });
    }
  } catch (err) {
    console.error("❌ Get companies error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.toString() 
    });
  }
});

// Get students by company endpoint
app.get("/api/students/company/:companyName", async (req, res) => {
  try {
    const { companyName } = req.params;
    const response = await fetch(`${STUDENT_SUBMISSION_SCRIPT}?action=getStudentsByCompany&company=${encodeURIComponent(companyName)}`);
    const result = await response.json();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error || "Failed to fetch students by company" 
      });
    }
  } catch (err) {
    console.error("❌ Get students by company error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.toString() 
    });
  }
});

// Verify student endpoint
app.post("/api/verify-student", async (req, res) => {
  try {
    console.log("🔍 Received student verification request");
    console.log("🔍 Request body:", JSON.stringify(req.body, null, 2));
    
    const { verificationData } = req.body;
    
    // Validate that we have the required fields
    if (!verificationData || !verificationData.registrationNumber) {
      console.log("❌ Validation failed - Missing verification data");
      return res.status(400).json({ 
        success: false, 
        error: 'Missing verification data. Required: registrationNumber' 
      });
    }

    console.log("✅ Validation passed, forwarding to Google Apps Script");

    // Forward the payload to the Google Apps Script endpoint
    const response = await fetch(STUDENT_SUBMISSION_SCRIPT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "verifyStudent",
        verificationData: verificationData
      }),
    });

    // Try to parse as JSON, fallback to text if not JSON
    let data;
    const text = await response.text();
    console.log("🔍 Google Apps Script response:", text);
    
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    
    console.log("🔍 Final response data:", JSON.stringify(data, null, 2));
    res.json(data);
  } catch (err) {
    console.error("❌ Student verification error:", err);
    res.status(500).json({ error: err.toString() });
  }
});

// Handle CORS preflight requests (optional, since cors() handles most cases)
app.options("/api/insert-rows", (req, res) => {
  res.sendStatus(204);
});

app.listen(PORT, () => {
  console.log(`✅ Proxy server running on http://localhost:${PORT}`);
});
