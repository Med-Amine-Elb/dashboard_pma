# TéléphoneManager - API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Phone Management](#phone-management)
4. [SIM Card Management](#sim-card-management)
5. [Attribution Management](#attribution-management)
6. [Request Management](#request-management)
7. [Notification Management](#notification-management)
8. [Calendar/Events Management](#calendar-events-management)
9. [Messages Management](#messages-management)
10. [Dashboard Analytics](#dashboard-analytics)
11. [Settings Management](#settings-management)
12. [File Upload](#file-upload)

---

## Authentication

### POST /api/auth/login
**Description**: Authenticate user and return JWT token
**Request Body**:
\`\`\`json
{
  "email": "user@company.com",
  "password": "password123"
}
\`\`\`
**Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "user@company.com",
      "role": "admin|assigner|user",
      "department": "IT",
      "avatar": "avatar_url"
    }
  }
}
\`\`\`

### POST /api/auth/logout
**Description**: Logout user and invalidate token
**Headers**: `Authorization: Bearer <token>`
**Response**:
\`\`\`json
{
  "success": true,
  "message": "Logged out successfully"
}
\`\`\`

### GET /api/auth/me
**Description**: Get current user information
**Headers**: `Authorization: Bearer <token>`
**Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "user@company.com",
    "role": "admin|assigner|user",
    "department": "IT",
    "avatar": "avatar_url",
    "joinDate": "2023-01-15",
    "lastLogin": "2024-01-20T10:30:00Z"
  }
}
\`\`\`

---

## User Management

### GET /api/users
**Description**: Get all users (Admin/Assigner only)
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term
- `department`: Filter by department
- `status`: Filter by status (active|inactive)
- `role`: Filter by role

**Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@company.com",
        "department": "IT",
        "position": "Developer",
        "role": "user",
        "status": "active",
        "joinDate": "2023-01-15",
        "phone": "+33 6 12 34 56 78",
        "address": "123 Main St, Paris",
        "manager": "Jane Smith",
        "avatar": "avatar_url",
        "assignedPhone": "iPhone 15 Pro",
        "assignedSim": "+33 6 12 34 56 78"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
\`\`\`

### GET /api/users/:id
**Description**: Get user by ID
**Headers**: `Authorization: Bearer <token>`
**Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@company.com",
    "department": "IT",
    "position": "Developer",
    "role": "user",
    "status": "active",
    "joinDate": "2023-01-15",
    "phone": "+33 6 12 34 56 78",
    "address": "123 Main St, Paris",
    "manager": "Jane Smith",
    "avatar": "avatar_url"
  }
}
\`\`\`

### POST /api/users
**Description**: Create new user (Admin only)
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
\`\`\`json
{
  "name": "John Doe",
  "email": "john@company.com",
  "department": "IT",
  "position": "Developer",
  "role": "user",
  "phone": "+33 6 12 34 56 78",
  "address": "123 Main St, Paris",
  "manager": "Jane Smith",
  "password": "temporary_password"
}
\`\`\`

### PUT /api/users/:id
**Description**: Update user information
**Headers**: `Authorization: Bearer <token>`
**Request Body**: Same as POST /api/users

### DELETE /api/users/:id
**Description**: Delete user (Admin only)
**Headers**: `Authorization: Bearer <token>`

---

## Phone Management

### GET /api/phones
**Description**: Get all phones
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `page`, `limit`, `search`
- `status`: available|assigned|maintenance|retired
- `brand`: Filter by brand
- `condition`: excellent|good|fair|poor

**Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "phones": [
      {
        "id": "phone_id",
        "model": "iPhone 15 Pro",
        "brand": "Apple",
        "serialNumber": "APL123456789",
        "imei": "123456789012345",
        "status": "available",
        "condition": "excellent",
        "purchaseDate": "2024-01-15",
        "warrantyExpiry": "2026-01-15",
        "price": 1299,
        "storage": "256GB",
        "color": "Titanium Blue",
        "assignedTo": null,
        "assignedDate": null,
        "osVersion": "iOS 17.1.2",
        "batteryHealth": 98,
        "lastSync": "2024-01-20T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
\`\`\`

### GET /api/phones/:id
**Description**: Get phone by ID
**Headers**: `Authorization: Bearer <token>`

### POST /api/phones
**Description**: Add new phone (Admin only)
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
\`\`\`json
{
  "model": "iPhone 15 Pro",
  "brand": "Apple",
  "serialNumber": "APL123456789",
  "imei": "123456789012345",
  "condition": "excellent",
  "purchaseDate": "2024-01-15",
  "price": 1299,
  "storage": "256GB",
  "color": "Titanium Blue"
}
\`\`\`

### PUT /api/phones/:id
**Description**: Update phone information
**Headers**: `Authorization: Bearer <token>`

### DELETE /api/phones/:id
**Description**: Delete phone (Admin only)
**Headers**: `Authorization: Bearer <token>`

### GET /api/phones/:id/usage-stats
**Description**: Get phone usage statistics
**Headers**: `Authorization: Bearer <token>`
**Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "callsThisMonth": 127,
    "smsThisMonth": 89,
    "dataUsedGB": 12.5,
    "dataLimitGB": 50,
    "averageCallDuration": "3m 45s",
    "mostUsedApp": "Teams",
    "screenTime": "6h 32m",
    "batteryHealth": 98,
    "storageUsed": 45
  }
}
\`\`\`

### GET /api/phones/:id/maintenance-history
**Description**: Get phone maintenance history
**Headers**: `Authorization: Bearer <token>`
**Response**:
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "maint_id",
      "date": "2024-01-15",
      "type": "Mise à jour logicielle",
      "description": "iOS 17.1.2 - Corrections de sécurité",
      "status": "Terminé",
      "technician": "Jean Dupont"
    }
  ]
}
\`\`\`

---

## SIM Card Management

### GET /api/sim-cards
**Description**: Get all SIM cards
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `page`, `limit`, `search`
- `status`: available|assigned|suspended|expired
- `carrier`: Filter by carrier

**Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "simCards": [
      {
        "id": "sim_id",
        "number": "+33 6 12 34 56 78",
        "carrier": "Orange",
        "plan": "Pro 50GB",
        "status": "available",
        "activationDate": "2024-01-15",
        "expiryDate": "2025-01-15",
        "monthlyFee": 45.99,
        "dataLimit": "50GB",
        "iccid": "89330123456789012345",
        "pin": "1234",
        "puk": "12345678",
        "assignedTo": null,
        "assignedPhone": null,
        "notes": "Plan professionnel"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2
    }
  }
}
\`\`\`

### GET /api/sim-cards/:id
**Description**: Get SIM card by ID

### POST /api/sim-cards
**Description**: Add new SIM card (Admin only)
**Request Body**:
\`\`\`json
{
  "number": "+33 6 12 34 56 78",
  "carrier": "Orange",
  "plan": "Pro 50GB",
  "activationDate": "2024-01-15",
  "expiryDate": "2025-01-15",
  "monthlyFee": 45.99,
  "dataLimit": "50GB",
  "iccid": "89330123456789012345",
  "pin": "1234",
  "puk": "12345678",
  "notes": "Plan professionnel"
}
\`\`\`

### PUT /api/sim-cards/:id
**Description**: Update SIM card information

### DELETE /api/sim-cards/:id
**Description**: Delete SIM card (Admin only)

---

## Attribution Management

### GET /api/attributions
**Description**: Get all attributions
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `page`, `limit`, `search`
- `status`: active|pending|returned
- `userId`: Filter by user
- `assignedBy`: Filter by assigner

**Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "attributions": [
      {
        "id": "attr_id",
        "userId": "user_id",
        "userName": "John Doe",
        "userEmail": "john@company.com",
        "phoneId": "phone_id",
        "phoneModel": "iPhone 15 Pro",
        "simCardId": "sim_id",
        "simCardNumber": "+33 6 12 34 56 78",
        "assignedBy": "Admin User",
        "assignmentDate": "2024-01-15",
        "returnDate": null,
        "status": "active",
        "notes": "Attribution complète"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 30,
      "totalPages": 3
    }
  }
}
\`\`\`

### GET /api/attributions/:id
**Description**: Get attribution by ID

### POST /api/attributions
**Description**: Create new attribution (Admin/Assigner)
**Request Body**:
\`\`\`json
{
  "userId": "user_id",
  "phoneId": "phone_id",
  "simCardId": "sim_id",
  "notes": "Attribution complète"
}
\`\`\`

### PUT /api/attributions/:id
**Description**: Update attribution

### DELETE /api/attributions/:id
**Description**: Delete attribution

### POST /api/attributions/:id/return
**Description**: Mark attribution as returned
**Request Body**:
\`\`\`json
{
  "returnDate": "2024-01-20",
  "notes": "Retour pour changement de poste"
}
\`\`\`

### GET /api/attributions/history/:simCardId
**Description**: Get attribution history for SIM card
**Response**:
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "history_id",
      "simCardId": "sim_id",
      "phoneId": "phone_id",
      "userId": "user_id",
      "userName": "John Doe",
      "assignedBy": "Admin User",
      "assignmentDate": "2024-01-15",
      "returnDate": "2024-01-20",
      "status": "returned",
      "notes": "Changement de poste"
    }
  ]
}
\`\`\`

---

## Request Management

### GET /api/requests
**Description**: Get requests (filtered by user role)
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `page`, `limit`, `search`
- `status`: En attente|En cours|Approuvé|Rejeté|Résolu
- `type`: Problème|Remplacement|Support|Changement
- `priority`: Faible|Normale|Élevée|Urgente
- `userId`: Filter by user (Admin/Assigner only)

**Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "req_id",
        "userId": "user_id",
        "userName": "John Doe",
        "type": "Remplacement",
        "title": "Écran cassé - iPhone 14",
        "description": "L'écran s'est fissuré suite à une chute",
        "status": "Approuvé",
        "priority": "Élevée",
        "createdDate": "2024-01-15T10:30:00Z",
        "updatedDate": "2024-01-16T09:15:00Z",
        "assignedTo": "Jean Dupont",
        "phoneId": "phone_id",
        "simCardId": "sim_id"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 20,
      "totalPages": 2
    }
  }
}
\`\`\`

### GET /api/requests/:id
**Description**: Get request by ID with comments
**Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "id": "req_id",
    "userId": "user_id",
    "userName": "John Doe",
    "type": "Remplacement",
    "title": "Écran cassé - iPhone 14",
    "description": "L'écran s'est fissuré suite à une chute",
    "status": "Approuvé",
    "priority": "Élevée",
    "createdDate": "2024-01-15T10:30:00Z",
    "updatedDate": "2024-01-16T09:15:00Z",
    "assignedTo": "Jean Dupont",
    "comments": [
      {
        "id": "comment_id",
        "authorId": "user_id",
        "authorName": "John Doe",
        "message": "Demande de remplacement pour écran cassé",
        "timestamp": "2024-01-15T10:30:00Z",
        "isUser": true
      }
    ]
  }
}
\`\`\`

### POST /api/requests
**Description**: Create new request
**Request Body**:
\`\`\`json
{
  "type": "Remplacement",
  "title": "Écran cassé - iPhone 14",
  "description": "L'écran s'est fissuré suite à une chute",
  "priority": "Élevée",
  "phoneId": "phone_id"
}
\`\`\`

### PUT /api/requests/:id
**Description**: Update request (Admin/Assigner)
**Request Body**:
\`\`\`json
{
  "status": "Approuvé",
  "assignedTo": "Jean Dupont",
  "notes": "Nouveau téléphone disponible demain"
}
\`\`\`

### POST /api/requests/:id/comments
**Description**: Add comment to request
**Request Body**:
\`\`\`json
{
  "message": "J'ai essayé mais le problème persiste"
}
\`\`\`

### DELETE /api/requests/:id
**Description**: Delete request

---

## Notification Management

### GET /api/notifications
**Description**: Get user notifications
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `page`, `limit`
- `read`: true|false
- `type`: success|warning|error|info

**Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_id",
        "userId": "user_id",
        "title": "Demande approuvée",
        "message": "Votre demande de remplacement a été approuvée",
        "type": "success",
        "read": false,
        "createdAt": "2024-01-20T10:30:00Z",
        "actionUrl": "/user-dashboard/requests/req_id",
        "icon": "CheckCircle"
      }
    ],
    "unreadCount": 5,
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
\`\`\`

### PUT /api/notifications/:id/read
**Description**: Mark notification as read
**Headers**: `Authorization: Bearer <token>`

### PUT /api/notifications/mark-all-read
**Description**: Mark all notifications as read
**Headers**: `Authorization: Bearer <token>`

### DELETE /api/notifications/:id
**Description**: Delete notification
**Headers**: `Authorization: Bearer <token>`

### DELETE /api/notifications/clear-all
**Description**: Clear all notifications
**Headers**: `Authorization: Bearer <token>`

### POST /api/notifications
**Description**: Create notification (System/Admin)
**Request Body**:
\`\`\`json
{
  "userId": "user_id",
  "title": "Nouveau téléphone attribué",
  "message": "iPhone 15 Pro vous a été attribué",
  "type": "success",
  "actionUrl": "/user-dashboard/my-phone",
  "icon": "Phone"
}
\`\`\`

---

## Calendar/Events Management

### GET /api/events
**Description**: Get calendar events
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**:
- `startDate`: Filter from date (YYYY-MM-DD)
- `endDate`: Filter to date (YYYY-MM-DD)
- `type`: assignment|return|maintenance|meeting
- `status`: scheduled|completed|cancelled

**Response**:
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "event_id",
      "title": "Attribution iPhone 15 Pro",
      "description": "Attribution d'un iPhone 15 Pro à Jean Dupont",
      "date": "2024-01-15",
      "time": "10:00",
      "type": "assignment",
      "status": "scheduled",
      "priority": "medium",
      "participants": ["Jean Dupont", "Randy Riley"],
      "createdBy": "admin_id",
      "phoneId": "phone_id",
      "userId": "user_id"
    }
  ]
}
\`\`\`

### GET /api/events/:id
**Description**: Get event by ID

### POST /api/events
**Description**: Create new event
**Request Body**:
\`\`\`json
{
  "title": "Attribution iPhone 15 Pro",
  "description": "Attribution d'un iPhone 15 Pro à Jean Dupont",
  "date": "2024-01-15",
  "time": "10:00",
  "type": "assignment",
  "priority": "medium",
  "participants": ["Jean Dupont", "Randy Riley"],
  "phoneId": "phone_id",
  "userId": "user_id"
}
\`\`\`

### PUT /api/events/:id
**Description**: Update event

### DELETE /api/events/:id
**Description**: Delete event

---



## Dashboard Analytics

### GET /api/dashboard/stats
**Description**: Get dashboard statistics (role-based)
**Headers**: `Authorization: Bearer <token>`
**Response** (Admin):
\`\`\`json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalPhones": 200,
    "totalSimCards": 180,
    "activeAttributions": 145,
    "pendingRequests": 12,
    "maintenanceScheduled": 5,
    "monthlyStats": {
      "newAttributions": 25,
      "resolvedRequests": 18,
      "newUsers": 8
    },
    "phonesByBrand": [
      { "brand": "Apple", "count": 120 },
      { "brand": "Samsung", "count": 60 },
      { "brand": "Google", "count": 20 }
    ],
    "requestsByType": [
      { "type": "Support", "count": 15 },
      { "type": "Remplacement", "count": 8 },
      { "type": "Problème", "count": 12 }
    ]
  }
}
\`\`\`

### GET /api/dashboard/recent-activity
**Description**: Get recent activity feed
**Response**:
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "activity_id",
      "type": "attribution",
      "title": "Nouvelle attribution",
      "description": "iPhone 15 Pro attribué à Jean Dupont",
      "timestamp": "2024-01-20T10:30:00Z",
      "userId": "user_id",
      "userName": "Jean Dupont",
      "icon": "Phone"
    }
  ]
}
\`\`\`

### GET /api/dashboard/charts/:type
**Description**: Get chart data for dashboard
**Parameters**: `type` = phones|requests|attributions|usage
**Query Parameters**:
- `period`: week|month|quarter|year
- `startDate`, `endDate`

**Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May"],
    "datasets": [
      {
        "label": "Attributions",
        "data": [12, 19, 15, 25, 22],
        "backgroundColor": "rgba(59, 130, 246, 0.5)"
      }
    ]
  }
}
\`\`\`

---

## Settings Management

### GET /api/settings
**Description**: Get user settings
**Headers**: `Authorization: Bearer <token>`
**Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "notifications": {
      "email": true,
      "push": true,
      "sms": false,
      "maintenance": true,
      "requests": true
    },
    "privacy": {
      "profileVisible": true,
      "activityVisible": false,
      "dataSharing": false
    },
    "preferences": {
      "language": "fr",
      "timezone": "Europe/Paris",
      "theme": "light",
      "dateFormat": "dd/mm/yyyy"
    },
    "security": {
      "twoFactor": false,
      "sessionTimeout": "30",
      "loginAlerts": true
    }
  }
}
\`\`\`

### PUT /api/settings
**Description**: Update user settings
**Request Body**: Same structure as GET response

### PUT /api/settings/password
**Description**: Change user password
**Request Body**:
\`\`\`json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
\`\`\`

### GET /api/settings/export-data
**Description**: Export user data
**Headers**: `Authorization: Bearer <token>`
**Response**: File download or email notification

### DELETE /api/settings/delete-account
**Description**: Request account deletion
**Headers**: `Authorization: Bearer <token>`

---

## File Upload

### POST /api/upload/avatar
**Description**: Upload user avatar
**Headers**: `Authorization: Bearer <token>`
**Content-Type**: `multipart/form-data`
**Request Body**: Form data with `avatar` file
**Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "url": "https://example.com/avatars/user_id.jpg"
  }
}
\`\`\`

### POST /api/upload/attachment
**Description**: Upload file attachment for requests
**Headers**: `Authorization: Bearer <token>`
**Content-Type**: `multipart/form-data`
**Request Body**: Form data with `file`
**Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "id": "file_id",
    "filename": "screenshot.png",
    "url": "https://example.com/attachments/file_id.png",
    "size": 1024000,
    "mimeType": "image/png"
  }
}
\`\`\`

---

## Error Responses

All endpoints return consistent error responses:

\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (optional)"
  }
}
\`\`\`

### Common Error Codes:
- `UNAUTHORIZED`: Invalid or missing authentication token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Request validation failed
- `CONFLICT`: Resource conflict (e.g., duplicate email)
- `RATE_LIMITED`: Too many requests
- `SERVER_ERROR`: Internal server error

---

## Authentication & Authorization

### JWT Token Structure:
\`\`\`json
{
  "sub": "user_id",
  "email": "user@company.com",
  "role": "admin|assigner|user",
  "iat": 1642694400,
  "exp": 1642780800
}
\`\`\`

### Role Permissions:
- **Admin**: Full access to all endpoints
- **Assigner**: Read/write access to users, phones, SIM cards, attributions, requests
- **User**: Read access to own data, create/read own requests, read assigned phone/SIM

### Rate Limiting:
- Authentication endpoints: 5 requests per minute
- General API: 100 requests per minute per user
- File upload: 10 requests per minute

---



This API documentation covers all the endpoints needed to make the TéléphoneManager system work exactly as implemented in the frontend. Each endpoint includes proper authentication, role-based access control, pagination, filtering, and error handling.
