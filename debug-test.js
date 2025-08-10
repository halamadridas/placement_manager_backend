// Debug test script to see what's happening
import fetch from 'node-fetch';

async function debugTest() {
  const payload = {
    action: "addStudentSubmission",
    studentData: [
      "PGD202349882",
      "Neeraj Chauhan", 
      "Shoolini University",
      "M. Tech CSE",
      "+918219072744",
      "chauhanneeraj866@gmail.com",
      "2024-11-28",
      "5.5",
      "",
      new Date().toISOString(),
      "false",
      "Pending"
    ]
  };

  console.log("🔍 Debug Test - Sending payload:");
  console.log(JSON.stringify(payload, null, 2));

  try {
    // Test 1: Direct to Google Apps Script
    console.log("\n🧪 Test 1: Direct to Google Apps Script");
    const directResponse = await fetch("https://script.google.com/macros/s/AKfycbyf2sotopkgFeDzr1Ag33lnukBr3GoYVEMSgZWbCKrjfUGJ-OCH3ZfWAd_EOO_G2Eg3fQ/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const directResult = await directResponse.text();
    console.log("Direct response:", directResult);

    // Test 2: Through backend
    console.log("\n🧪 Test 2: Through backend");
    const backendResponse = await fetch("http://localhost:4000/api/student-submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const backendResult = await backendResponse.text();
    console.log("Backend response:", backendResult);

  } catch (error) {
    console.error("❌ Debug test error:", error.message);
  }
}

debugTest(); 