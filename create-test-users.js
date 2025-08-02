// Simple script to create test users
// Copy and paste this into your browser console when logged in as admin

const createTestUsers = async () => {
  const users = [
    {
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean.dupont@company.com",
      password: "password123",
      role: "USER"
    },
    {
      firstName: "Marie",
      lastName: "Martin",
      email: "marie.martin@company.com", 
      password: "password123",
      role: "USER"
    },
    {
      firstName: "Pierre",
      lastName: "Durand",
      email: "pierre.durand@company.com",
      password: "password123", 
      role: "USER"
    },
    {
      firstName: "Sophie",
      lastName: "Dubois",
      email: "sophie.dubois@company.com",
      password: "password123",
      role: "USER"
    }
  ];

  const token = localStorage.getItem('jwt_token');
  
  for (const user of users) {
    try {
      const response = await fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(user)
      });
      
      if (response.ok) {
        const createdUser = await response.json();
        console.log(`✅ Created user: ${user.firstName} ${user.lastName}`);
      } else {
        console.log(`❌ Failed to create user: ${user.firstName} ${user.lastName}`);
      }
    } catch (error) {
      console.error(`Error creating user ${user.firstName}:`, error);
    }
  }
  
  console.log('Test users creation completed!');
};

// Run this function in browser console
// createTestUsers(); 