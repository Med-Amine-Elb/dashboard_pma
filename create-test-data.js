// Test script to create users and conversations
// Run this in your browser console or use it as a reference

const API_BASE = 'http://localhost:8080/api';

// Test users to create
const testUsers = [
  {
    firstName: "Test",
    lastName: "User1",
    email: "user1@test.com",
    password: "password123",
    role: "USER"
  },
  {
    firstName: "Test",
    lastName: "User2", 
    email: "user2@test.com",
    password: "password123",
    role: "USER"
  },
  {
    firstName: "Test",
    lastName: "Assigner",
    email: "assigner@test.com", 
    password: "password123",
    role: "ASSIGNER"
  }
];

// Function to create a user
async function createUser(userData) {
  try {
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
      },
      body: JSON.stringify(userData)
    });
    
    if (response.ok) {
      const user = await response.json();
      console.log('Created user:', user);
      return user;
    } else {
      console.error('Failed to create user:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

// Function to create a conversation
async function createConversation(userId) {
  try {
    const response = await fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
      },
      body: JSON.stringify({ userId: userId })
    });
    
    if (response.ok) {
      const conversation = await response.json();
      console.log('Created conversation:', conversation);
      return conversation;
    } else {
      console.error('Failed to create conversation:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
}

// Function to create test data
async function createTestData() {
  console.log('Creating test data...');
  
  // Create test users
  const createdUsers = [];
  for (const userData of testUsers) {
    const user = await createUser(userData);
    if (user) {
      createdUsers.push(user);
    }
  }
  
  // Create conversations with the created users
  for (const user of createdUsers) {
    await createConversation(user.id);
  }
  
  console.log('Test data creation completed!');
  console.log('Created users:', createdUsers);
}

// Run the script
// createTestData(); 