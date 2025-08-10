// Test backend validation only
import fetch from 'node-fetch';

async function testBackendValidation() {
  const testPayloads = [
    // Test 1: Valid payload
    {
      name: "Valid Payload",
      payload: {
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
      }
    },
    // Test 2: Missing action
    {
      name: "Missing Action",
      payload: {
        studentData: ["test", "test", "test", "test", "test", "test"]
      }
    },
    // Test 3: Missing studentData
    {
      name: "Missing StudentData",
      payload: {
        action: "addStudentSubmission"
      }
    },
    // Test 4: studentData not array
    {
      name: "StudentData Not Array",
      payload: {
        action: "addStudentSubmission",
        studentData: "not an array"
      }
    },
    // Test 5: Array too short
    {
      name: "Array Too Short",
      payload: {
        action: "addStudentSubmission",
        studentData: ["test", "test", "test", "test", "test"] // Only 5 elements
      }
    }
  ];

  for (const test of testPayloads) {
    console.log(`\n🧪 Testing: ${test.name}`);
    console.log("📤 Sending payload:", JSON.stringify(test.payload, null, 2));

    try {
      const response = await fetch("http://localhost:4000/api/student-submission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(test.payload),
      });

      const result = await response.text();
      console.log("📥 Response:", result);
      
      try {
        const parsedResult = JSON.parse(result);
        if (parsedResult.success) {
          console.log("✅ Test passed");
        } else {
          console.log("❌ Test failed:", parsedResult.error);
        }
      } catch {
        console.log("⚠️ Response is not JSON");
      }
    } catch (error) {
      console.error("❌ Test error:", error.message);
    }
  }
}

testBackendValidation(); 