// Check authentication status
// Copy and paste this in browser console

const checkAuth = () => {
  console.log("=== Authentication Check ===");
  
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  console.log("Is Authenticated:", isAuthenticated);
  
  // Check user role
  const userRole = localStorage.getItem("userRole");
  console.log("User Role:", userRole);
  
  // Check JWT token
  const jwtToken = localStorage.getItem("jwt_token");
  console.log("JWT Token exists:", !!jwtToken);
  console.log("JWT Token length:", jwtToken ? jwtToken.length : 0);
  
  if (jwtToken) {
    // Decode JWT token (basic decode, not validation)
    try {
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      console.log("JWT Payload:", payload);
      console.log("Token expires at:", new Date(payload.exp * 1000));
      console.log("Token is expired:", Date.now() > payload.exp * 1000);
    } catch (error) {
      console.log("Could not decode JWT token");
    }
  }
  
  // Test API access
  testApiAccess();
};

const testApiAccess = async () => {
  console.log("\n=== Testing API Access ===");
  
  const token = localStorage.getItem("jwt_token");
  
  try {
    // Test users endpoint
    const response = await fetch("http://localhost:8080/api/users", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    console.log("Users API Status:", response.status);
    console.log("Users API OK:", response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log("Users API Response:", data);
    } else {
      const errorText = await response.text();
      console.log("Users API Error:", errorText);
    }
    
  } catch (error) {
    console.log("API Test Error:", error);
  }
};

// Run the check
checkAuth(); 