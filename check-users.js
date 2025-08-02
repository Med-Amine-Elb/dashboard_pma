// Check if test users already exist
// Copy and paste this in browser console

const checkExistingUsers = async () => {
  console.log("=== Checking Existing Users ===");
  
  const token = localStorage.getItem("jwt_token");
  
  try {
    const response = await fetch("http://localhost:8080/api/users", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("All users:", data);
      
      // Check for specific test users
      const testEmails = [
        "jean.dupont@company.com",
        "marie.martin@company.com", 
        "pierre.durand@company.com",
        "sophie.dubois@company.com"
      ];
      
      const users = data.content || data || [];
      console.log("Total users found:", users.length);
      
      testEmails.forEach(email => {
        const user = users.find(u => u.email === email);
        if (user) {
          console.log(`✅ Found user: ${user.firstName} ${user.lastName} (${email})`);
        } else {
          console.log(`❌ User not found: ${email}`);
        }
      });
      
    } else {
      console.log("Failed to fetch users:", response.status);
    }
    
  } catch (error) {
    console.log("Error checking users:", error);
  }
};

// Run the check
checkExistingUsers(); 