// Test script for student submission API
const fetch = require('node-fetch');

async function testStudentSubmission() {
  // Convert the form data to array format for Google Sheets
  const rowData = [
    "TEST123",                    // registrationNumber
    "Test Student",               // name
    "Test Company",               // company (since isPlaced is yes)
    "Computer Science",           // course
    "1234567890",                 // phone
    "test@example.com",           // email
    "2024-01-15",                 // placementDate
    "4.5 LPA",                    // package
    "Great placement process!",   // feedback
    new Date().toISOString(),     // submissionDate
    'false',                      // Is Verified
    'Pending'                     // Status
  ];

  const payload = {
    action: "addStudentSubmission",
    studentData: rowData
  };

  try {
    console.log("🧪 Testing student submission API...");
    console.log("📤 Sending data:", JSON.stringify(payload, null, 2));

    const response = await fetch("http://localhost:4000/api/student-submission", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log("📥 Response:", JSON.stringify(result, null, 2));

    if (result.success) {
      console.log("✅ Test submission successful!");
      console.log("📊 Row added:", result.data?.rowNumber);
      console.log("👤 Student:", result.data?.studentName);
    } else {
      console.log("❌ Test submission failed:", result.error);
    }
  } catch (error) {
    console.error("❌ Test error:", error.message);
  }
}

// Run the test
testStudentSubmission(); 