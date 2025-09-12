# 📞 TelephoneManager Backend

[![Java](https://img.shields.io/badge/Java-17%2B-blue.svg)](https://www.oracle.com/java/)
[![Maven](https://img.shields.io/badge/Maven-3.6%2B-brightgreen.svg)](https://maven.apache.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A robust Spring Boot backend for managing corporate phone and SIM card assignments, user roles, and inventory. Designed for IT departments and asset managers to streamline device and SIM allocation, tracking, and reporting.

---

## 🚀 Quick Start

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- SQL Server 2019 or higher
- Postman (for API testing)

### Database Setup
1. **Install SQL Server** ([Download](https://www.microsoft.com/en-us/sql-server/sql-server-downloads))
2. **Create Database**
   ```sql
   CREATE DATABASE TelephoneManager;
   ```
3. **Configure Connection**
   - Edit `src/main/resources/application.yml`:
     ```yaml
     spring:
       datasource:
         url: jdbc:sqlserver://localhost:1433;databaseName=TelephoneManager;encrypt=true;trustServerCertificate=true
         username: sa
         password: YourStrong@Passw0rd
     ```

### Build & Run
```bash
mvn clean install
mvn spring-boot:run
```
- App runs at: [http://localhost:8080](http://localhost:8080)
- Swagger UI: [http://localhost:8080/api/swagger-ui.html](http://localhost:8080/api/swagger-ui.html)

---

## 🧪 API Testing with Postman
- Import: `postman/TelephoneManager_API.postman_collection.json`
- Set environment variables:
  - `baseUrl`: `http://localhost:8080/api`
  - `authToken`: (auto-set after login)

### Test Users
| Email                | Password   | Role     |
|----------------------|------------|----------|
| admin@company.com    | admin123   | ADMIN    |
| assigner@company.com | assigner123| ASSIGNER |
| john@company.com     | user123    | USER     |

---

## 📋 Features
- **Authentication**: JWT, role-based (ADMIN, ASSIGNER, USER)
- **User Management**: CRUD, search, filtering
- **Phone Management**: Inventory, status, usage
- **SIM Card Management**: Inventory, carrier, assignment
- **Audit Logging**: Track changes and assignments
- **API Documentation**: Swagger/OpenAPI

---

## 🏗️ Project Structure
```text
src/main/java/com/telephonemanager/
├── config/         # Configuration classes
├── controller/     # REST controllers
├── dto/            # Data Transfer Objects
├── entity/         # JPA entities
├── repository/     # Data access layer
├── security/       # Security config
└── service/        # Business logic

src/main/resources/
├── application.yml # App config
└── data.sql        # Initial data (optional)

postman/
└── TelephoneManager_API.postman_collection.json
```

---

## ⚙️ Configuration Classes (`config/`)

This folder contains core configuration classes for the backend:

- **DatabaseMigration.java**: Handles database schema migrations at startup, ensuring new columns are added to the `phone` table if they do not exist.
- **DataInitializer.java**: Seeds the database with initial test users and phones if the database is empty. Useful for development and testing.
- **SecurityConfig.java**: Configures Spring Security, JWT authentication, CORS, and endpoint access rules. Sets up stateless session management and password encoding.
- **WebConfig.java**: Configures CORS for the application, allowing requests from local frontend development servers and exposing the `Authorization` header.

These classes ensure the backend is secure, properly initialized, and ready for both development and production environments.

---

## 🎮 REST Controllers (`controller/`)

The controller layer provides RESTful API endpoints for all system functionality:

### **AssignmentHistoryController** (`/assignment-history`)
- **Purpose**: Track assignment and transfer history for phones, SIM cards, and users
- **Endpoints**:
  - `GET /phone/{phoneId}` - Get phone assignment history
  - `GET /sim/{simId}` - Get SIM card assignment history  
  - `GET /user/{userId}` - Get user assignment history
- **Access**: Admin/Assigner only

### **AttributionController** (`/attributions`)
- **Purpose**: Manage device and SIM card assignments to users
- **Key Features**: CRUD operations, assignment history, bulk operations
- **Main Endpoints**:
  - `GET /` - List all attributions with pagination/filtering
  - `POST /` - Create new attribution (assign device/SIM to user)
  - `PUT /{id}` - Update attribution details
  - `POST /{id}/return` - Mark attribution as returned
  - `GET /history/phone/{phoneId}` - Get phone attribution history
  - `GET /history/sim/{simCardId}` - Get SIM card attribution history
  - `GET /user/{userId}/active` - Get active attributions for user
- **Access**: Admin/Assigner (create/update), Users (view own)

### **AuditLogController** (`/audit-logs`)
- **Purpose**: View and export system audit logs for compliance and monitoring
- **Endpoints**:
  - `GET /` - Get audit logs with filtering (action, entity type, date range)
  - `GET /user/{userId}` - Get audit logs for specific user
  - `GET /entity/{entityType}/{entityId}` - Get logs for specific entity
  - `GET /summary` - Get audit statistics and summary
  - `GET /export` - Export audit logs to CSV
- **Access**: Admin only

### **AuthController** (`/auth`)
- **Purpose**: Handle user authentication and session management
- **Endpoints**:
  - `POST /login` - Authenticate user and return JWT token
  - `POST /logout` - Logout user and invalidate token
  - `GET /me` - Get current user information
- **Access**: Public (login), Authenticated (logout, me)

### **CalendarEventController** (`/events`)
- **Purpose**: Manage calendar events for scheduling and planning
- **Key Features**: Full CRUD, date range queries, search by location/title
- **Main Endpoints**:
  - `GET /` - List events with pagination and sorting
  - `POST /` - Create new event (Admin/Assigner)
  - `PUT /{id}` - Update event (Admin/Assigner)
  - `DELETE /{id}` - Delete event (Admin/Assigner)
  - `GET /date-range` - Get events by date range
  - `GET /organizer/{organizerId}` - Get events by organizer
  - `GET /upcoming` - Get upcoming events for user
  - `GET /search/location` - Search events by location
  - `GET /search/title` - Search events by title
- **Access**: All roles (view), Admin/Assigner (create/update/delete)

### **DashboardController** (`/dashboard`)
- **Purpose**: Provide dashboard statistics and reporting data
- **Endpoints**:
  - `GET /overview` - Get overall dashboard statistics
  - `GET /phones/stats` - Get detailed phone statistics
  - `GET /simcards/stats` - Get detailed SIM card statistics  
  - `GET /users/stats` - Get user statistics and distribution
  - `GET /recent-activity` - Get recent assignments and activities
  - `GET /alerts` - Get system alerts and items needing attention
- **Access**: Admin/Assigner only

### **ExportController** (`/export`)
- **Purpose**: Export system data to CSV and Excel formats
- **Endpoints**:
  - `GET /users` - Export users data
  - `GET /phones` - Export phones data
  - `GET /simcards` - Export SIM cards data
  - `GET /attributions` - Export attributions data
  - `GET /requests` - Export requests data
  - `GET /audit-logs` - Export audit logs (CSV only)
- **Format Support**: CSV and Excel (XLSX)
- **Access**: Admin/Assigner only

### **FileUploadController** (`/files`)
- **Purpose**: Handle file uploads, storage, and downloads
- **Key Features**: Multi-type uploads, access control, metadata management
- **Main Endpoints**:
  - `POST /upload` - Upload file with metadata
  - `GET /{id}/download` - Download file by ID
  - `GET /{id}` - Get file metadata
  - `GET /` - List all files (Admin/Assigner)
  - `GET /type/{uploadType}` - Get files by type
  - `GET /user/{userId}` - Get files by user
  - `GET /related/{entityType}/{entityId}` - Get files related to entity
  - `GET /public` - Get public files
  - `GET /search/filename` - Search files by name
- **Supported Types**: Documents, images, avatars, attachments
- **Access**: All roles (upload/download own), Admin/Assigner (manage all)

### **PhoneController** (`/phones`)
- **Purpose**: Complete phone inventory and lifecycle management
- **Key Features**: CRUD operations, status tracking, assignment management, usage statistics
- **Main Endpoints**:
  - `GET /` - List phones with filtering (status, brand, model)
  - `GET /{id}` - Get phone details
  - `POST /` - Create new phone (Admin)
  - `PUT /{id}` - Update phone (Admin)
  - `DELETE /{id}` - Delete phone (Admin)
  - `GET /{id}/usage-stats` - Get phone usage statistics
  - `POST /{id}/assign` - Assign phone to user
  - `POST /{id}/unassign` - Unassign phone from user
  - `GET /available` - Get available phones
  - `GET /assigned` - Get assigned phones
- **Access**: Admin (full CRUD), Assigner (assign/unassign), Users (view assigned)


### **SimCardController** (`/simcards`)
- **Purpose**: Complete SIM card inventory and lifecycle management
- **Key Features**: CRUD operations, carrier management, plan tracking, assignment
- **Main Endpoints**:
  - `GET /` - List SIM cards with filtering
  - `GET /{id}` - Get SIM card details
  - `POST /` - Create new SIM card (Admin)
  - `PUT /{id}` - Update SIM card (Admin)
  - `DELETE /{id}` - Delete SIM card (Admin)
  - `POST /{id}/assign` - Assign SIM to user
  - `POST /{id}/unassign` - Unassign SIM from user
  - `GET /available` - Get available SIM cards
  - `GET /assigned` - Get assigned SIM cards
- **Access**: Admin (full CRUD), Assigner (assign/unassign), Users (view assigned)

### **SystemSettingsController** (`/settings/system`)
- **Purpose**: Manage system-wide configuration settings
- **Key Features**: Category-based settings, data type validation, bulk operations
- **Main Endpoints**:
  - `GET /` - List all settings with pagination
  - `GET /{id}` - Get setting by ID
  - `GET /key/{key}` - Get setting by key
  - `GET /value/{key}` - Get setting value only
  - `POST /` - Create new setting
  - `PUT /{id}` - Update setting
  - `PUT /key/{key}` - Update setting by key
  - `DELETE /{id}` - Delete setting
  - `GET /category/{category}` - Get settings by category
  - `GET /editable` - Get editable settings
- **Access**: Admin only

### **UserController** (`/users`)
- **Purpose**: Complete user management and administration
- **Key Features**: User lifecycle, role management, department organization
- **Main Endpoints**:
  - `GET /` - List users with filtering (department, status, role)
  - `GET /{id}` - Get user details
  - `POST /` - Create new user (Admin)
  - `PUT /{id}` - Update user (Admin)
  - `DELETE /{id}` - Delete user (Admin)
  - `GET /search` - Search users by name/email
  - `PUT /{id}/status` - Update user status
  - `PUT /{id}/role` - Update user role
  - `GET /departments` - Get list of departments
- **User Roles**: ADMIN, ASSIGNER, USER
- **Access**: Admin (full CRUD), Assigner (view/search)

### **UserSettingsController** (`/settings/user`)
- **Purpose**: Manage individual user preferences and settings
- **Key Features**: Theme, language, UI preferences
- **Endpoints**:
  - `GET /{userId}` - Get user settings
  - `PUT /{userId}` - Update user settings
  - `DELETE /{userId}` - Delete user settings
  - `POST /{userId}/reset` - Reset to defaults
  - `PUT /{userId}/theme` - Update theme preference
  - `PUT /{userId}/language` - Update language preference
  - `PUT /{userId}/timezone` - Update timezone
  - `PUT /{userId}/page-size` - Update page size preference
- **Access**: All roles (own settings), Admin (all users)

### **Security & Access Control**
- **JWT Authentication**: All endpoints (except login) require valid JWT token
- **Role-Based Access**: 
  - **ADMIN**: Full system access, user management, system settings
  - **ASSIGNER**: Device/SIM management, user assignments, reporting
  - **USER**: View own assignments, create requests, manage own settings
- **Resource-Level Security**: Users can only access their own assigned devices and data

---

## 📋 Data Transfer Objects (`dto/`)

DTOs define the structure of data exchanged between the API and clients, providing validation and clean data contracts:

### **AssignmentHistoryDto**
- **Purpose**: Transfer assignment/transfer history data
- **Key Fields**: 
  - `type` (PHONE/SIM_CARD), `action` (ASSIGN/TRANSFER/RETURN)
  - `itemId`, `fromUserId`, `toUserId`, `date`, `notes`
- **Usage**: Track device/SIM movement between users

### **AttributionDto**
- **Purpose**: Transfer device/SIM assignment data with user information
- **Key Fields**:
  - User info: `userId`, `userName`, `userEmail`
  - Device info: `phoneId`, `phoneModel`, `phoneBrand`
  - SIM info: `simCardId`, `simCardNumber`
  - Assignment info: `assignedById`, `assignmentDate`, `returnDate`, `status`
- **Status Values**: ACTIVE, PENDING, RETURNED
- **Usage**: Complete attribution records with related entity details

### **CalendarEventDto**
- **Purpose**: Transfer calendar event data for scheduling
- **Key Fields**:
  - Event details: `title`, `description`, `location`, `type`, `status`
  - Timing: `startTime`, `endTime`, `isAllDay`, `recurrence`
  - People: `organizerId`, `organizerName`, `attendeeIds`, `attendeeNames`
  - UI: `color` for display customization
- **Usage**: Meeting/event management with attendee tracking

### **FileUploadDto**
- **Purpose**: Transfer file metadata and upload information
- **Key Fields**:
  - File info: `fileName`, `originalName`, `fileSize`, `contentType`, `fileExtension`
  - Storage: `filePath`, `downloadUrl`, `downloadCount`
  - Context: `uploadType`, `relatedEntityType`, `relatedEntityId`
  - Access: `isPublic`, `uploadedById`, `uploadedByName`
- **Upload Types**: DOCUMENT, IMAGE, AVATAR, ATTACHMENT
- **Usage**: File management with context linking

### **LoginRequest**
- **Purpose**: Authentication request data
- **Fields**: `email` (validated), `password` (required)
- **Validation**: Email format validation, required field constraints
- **Usage**: User authentication

### **LoginResponse**
- **Purpose**: Authentication response with user data and token
- **Structure**: 
  - `success` boolean flag
  - `data.token` JWT authentication token
  - `data.user` nested user information (id, name, email, role, department, avatar)
- **Usage**: Client authentication state management

### **PhoneDto**
- **Purpose**: Transfer phone inventory and assignment data
- **Key Fields**:
  - Device info: `brand`, `model`, `imei`, `serialNumber`
  - Specifications: `storage`, `color`, `price`, `condition`
  - Status: `status` (AVAILABLE/ASSIGNED/LOST/DAMAGED)
  - Assignment: `assignedToId`, `assignedToName`, `assignedToDepartment`, `assignedDate`
  - Dates: `purchaseDate`
- **Validation**: Required fields for brand, model, IMEI
- **Usage**: Phone inventory management

### **RequestDto**
- **Purpose**: Transfer user request data for support/devices
- **Key Fields**:
  - Request info: `type`, `title`, `description`, `priority`, `status`
  - Users: `userId`, `userName`, `userEmail`, `assignedToId`, `assignedToName`
  - Timeline: `createdAt`, `updatedAt`, `resolvedAt`, `resolution`
- **Request Types**: DEVICE_REQUEST, SUPPORT, CHANGE, MAINTENANCE
- **Priority Levels**: LOW, MEDIUM, HIGH, URGENT
- **Status Values**: OPEN, IN_PROGRESS, RESOLVED, CLOSED
- **Usage**: Support ticket and device request management

### **SimCardDto**
- **Purpose**: Transfer SIM card inventory and assignment data
- **Key Fields**:
  - SIM info: `number`, `iccid`, `pin`, `puk`, `poke`
  - Carrier info: `carrier`, `plan`, `monthlyFee`, `dataLimit`
  - Status: `status` (AVAILABLE/ASSIGNED/LOST/BLOCKED)
  - Assignment: `assignedToId`, `assignedToName`, `assignedDate`
  - Dates: `activationDate`, `expiryDate`
- **Validation**: Required fields for number, ICCID, PIN, PUK, carrier, plan
- **Usage**: SIM card inventory and plan management

### **SystemSettingsDto**
- **Purpose**: Transfer system configuration settings
- **Key Fields**:
  - Setting info: `key`, `value`, `description`, `category`
  - Metadata: `dataType`, `isEncrypted`, `isEditable`
  - Timestamps: `createdAt`, `updatedAt`
- **Categories**: SECURITY, UI, INTEGRATION, etc.
- **Data Types**: STRING, INTEGER, BOOLEAN, JSON
- **Usage**: System configuration management

### **UserDto**
- **Purpose**: Transfer user account and profile data
- **Key Fields**:
  - Identity: `name`, `email`, `password` (write-only)
  - Role: `role` (ADMIN/ASSIGNER/USER), `status` (ACTIVE/INACTIVE/SUSPENDED)
  - Organization: `department`, `position`, `manager`
  - Contact: `phone`, `address`, `avatar`
  - Dates: `joinDate`
- **Validation**: Email format, required fields for name/email/role/department
- **Usage**: User management and profiles

### **UserSettingsDto**
- **Purpose**: Transfer user preference and UI settings
- **Key Fields**:
  - Appearance: `theme`, `language`, `timezone`, `compactMode`
  - Formats: `dateFormat`, `timeFormat`
  - UI Behavior: `autoRefreshInterval`, `pageSize`, `showHelpTooltips`, `sidebarCollapsed`
  - Layout: `dashboardLayout`
- **Usage**: Personalized user experience settings

### **DTO Design Patterns**
- **Validation**: Jakarta Bean Validation annotations (@NotBlank, @Email, @NotNull)
- **Entity Conversion**: Constructor-based conversion from JPA entities
- **Flat Structure**: Denormalized data for API efficiency (e.g., `assignedToName` instead of nested objects)
- **Null Safety**: Optional fields properly handled
- **Timestamps**: Consistent `createdAt`/`updatedAt` patterns

---

## 🗄️ Database Entities (`entity/`)

JPA entities define the database schema and relationships for the TelephoneManager system:

### **Database Schema Overview**

```sql
-- Core Tables
users                    -- User accounts and profiles
phones                   -- Phone inventory 
sim_cards               -- SIM card inventory
attributions            -- Device/SIM assignments to users
requests                -- User requests and support tickets
assignment_history      -- Audit trail for assignments

-- System Tables  
calendar_events         -- Calendar and scheduling
file_uploads           -- File storage metadata
system_settings        -- System configuration
user_settings          -- User preferences

-- Junction Tables
event_attendees        -- Many-to-many: events ↔ users
```

### **AssignmentHistory Entity**
- **Table**: `assignment_history`
- **Purpose**: Audit trail for device/SIM assignments and transfers
- **Key Fields**:
  - `type` (PHONE/SIM) - Item type being tracked
  - `action` (ASSIGN/UNASSIGN/TRANSFER) - Action performed
  - `itemId` - Reference to phone or SIM card ID
  - `fromUserId`, `toUserId` - Source and destination users
  - `date` - When action occurred
  - `notes` - Additional details
- **Indexes**: Recommended on `itemId`, `type`, `date` for performance

### **Attribution Entity**
- **Table**: `attributions`
- **Purpose**: Current and historical device/SIM assignments
- **Key Fields**:
  - `user` (ManyToOne → User) - Assigned user
  - `phone` (ManyToOne → Phone) - Assigned phone (optional)
  - `simCard` (ManyToOne → SimCard) - Assigned SIM (optional)
  - `assignedBy` (ManyToOne → User) - Admin/Assigner who made assignment
  - `assignmentDate`, `returnDate` - Assignment lifecycle dates
  - `status` (ACTIVE/PENDING/RETURNED) - Current state
  - `notes` - Assignment details
- **Relationships**: Central entity connecting users with their devices
- **Lifecycle**: Automatic timestamp management with @PrePersist/@PreUpdate

### **CalendarEvent Entity**
- **Table**: `calendar_events`
- **Purpose**: Event scheduling and calendar management
- **Key Fields**:
  - `title`, `description`, `location` - Event details
  - `startTime`, `endTime` - Event timing
  - `type` (MEETING/MAINTENANCE/TRAINING/CONFERENCE/OTHER) - Event category
  - `status` (SCHEDULED/IN_PROGRESS/COMPLETED/CANCELLED) - Event state
  - `organizer` (ManyToOne → User) - Event creator
  - `attendees` (ManyToMany → User) - Event participants
  - `color` - UI display color
  - `isAllDay` - All-day event flag
  - `recurrence` - Recurring event pattern
- **Junction Table**: `event_attendees` for attendee relationships
- **Features**: Full calendar functionality with attendee management

### **FileUpload Entity**
- **Table**: `file_uploads`
- **Purpose**: File storage metadata and access control
- **Key Fields**:
  - File info: `fileName`, `originalName`, `filePath`, `fileSize`, `contentType`, `fileExtension`
  - Context: `uploadType` (AVATAR/ATTACHMENT/DOCUMENT/IMAGE/VIDEO/AUDIO/OTHER)
  - Relationships: `uploadedBy` (User), `relatedEntityType`, `relatedEntityId`
  - Access: `isPublic` - Public vs private file access
  - Usage: `downloadCount` - Download tracking
- **Features**: Generic file attachment system with entity linking

### **Phone Entity**
- **Table**: `phone`
- **Purpose**: Phone inventory and lifecycle management
- **Key Fields**:
  - Identity: `brand`, `model`, `imei` (unique), `serialNumber`
  - Status: `status` (AVAILABLE/ASSIGNED/LOST/DAMAGED)
  - Condition: `condition` (EXCELLENT/GOOD/FAIR/POOR)
  - Specs: `storage`, `color`, `price`
  - Assignment: `assignedTo` (ManyToOne → User), `assignedDate`
  - Dates: `purchaseDate`
  - `notes` - Additional information
- **Constraints**: IMEI must be unique
- **Business Rules**: Status changes tracked in AssignmentHistory

### **Request Entity**
- **Table**: `requests`
- **Purpose**: User requests, support tickets, and issue tracking
- **Key Fields**:
  - Request: `type` (PROBLEM/REPLACEMENT/SUPPORT/CHANGE), `title`, `description`
  - Status: `status` (PENDING/IN_PROGRESS/APPROVED/REJECTED/RESOLVED)
  - Priority: `priority` (LOW/NORMAL/HIGH/URGENT)
  - People: `user` (requestor), `assignedTo` (handler)
  - Timeline: `createdAt`, `updatedAt`, `resolvedAt`
  - Resolution: `resolution` - Final outcome
- **Workflow**: Complete ticket lifecycle management
- **Auto-timestamps**: Managed via JPA lifecycle callbacks

### **SimCard Entity**
- **Table**: `sim_card`
- **Purpose**: SIM card inventory and carrier plan management
- **Key Fields**:
  - Identity: `number`, `iccid` (unique), `pin`, `puk`, `poke`
  - Status: `status` (AVAILABLE/ASSIGNED/LOST/BLOCKED)
  - Assignment: `assignedTo` (ManyToOne → User), `assignedDate`
  - Carrier: `carrier`, `plan`, `monthlyFee`, `dataLimit`
  - Lifecycle: `activationDate`, `expiryDate`
  - `notes` - Additional information
- **Constraints**: ICCID and PUK must be unique
- **Plan Management**: Full carrier plan and cost tracking

### **SystemSettings Entity**
- **Table**: `system_settings`
- **Purpose**: System-wide configuration management
- **Key Fields**:
  - Identity: `key` (unique), `value`, `description`
  - Organization: `category` (security/ui/integration/etc.)
  - Metadata: `dataType` (string/integer/boolean/json)
  - Security: `isEncrypted` - Sensitive data flag
  - Management: `isEditable` - Admin editability control
- **Categories**: Logical grouping of related settings
- **Security**: Encryption support for sensitive configuration

### **User Entity**
- **Table**: `users`
- **Purpose**: User accounts, authentication, and profiles
- **Key Fields**:
  - Identity: `name`, `email` (unique), `password` (encrypted)
  - Authorization: `role` (ADMIN/ASSIGNER/USER), `status` (ACTIVE/INACTIVE)
  - Organization: `department`, `position`, `manager`
  - Profile: `phone`, `address`, `avatar`, `joinDate`, `lastLogin`
- **Validation**: Bean validation for email format and required fields
- **Auditing**: Automatic timestamp management via Spring Data JPA
- **Security**: Password stored encrypted, email uniqueness enforced

### **UserSettings Entity**
- **Table**: `user_settings`
- **Purpose**: Individual user preferences and UI customization
- **Key Fields**:
  - Reference: `user` (OneToOne → User) - Settings owner
  - Appearance: `theme` (light/dark), `language`, `timezone`
  - Formats: `dateFormat`, `timeFormat`
  - UI Behavior: `autoRefreshInterval`, `pageSize`, `showHelpTooltips`
  - Layout: `compactMode`, `sidebarCollapsed`, `dashboardLayout`
- **Defaults**: Sensible default values for all preferences
- **Relationship**: One-to-one with User entity

### **Entity Design Patterns**

#### **Relationships**
- **ManyToOne**: User assignments (Phone→User, SimCard→User, Attribution→User)
- **OneToOne**: User preferences (UserSettings→User)
- **ManyToMany**: Event attendees (CalendarEvent↔User)

#### **Lifecycle Management**
- **@PrePersist/@PreUpdate**: Automatic timestamp management
- **@EntityListeners**: Spring Data JPA auditing for User entity
- **Cascade Operations**: Controlled entity relationship management

#### **Database Constraints**
- **Unique Constraints**: Email, IMEI, ICCID, PUK, system setting keys
- **Not Null**: Critical business fields enforced at DB level
- **Foreign Keys**: Referential integrity for all relationships

#### **Indexing Strategy**
- **Primary Keys**: Auto-generated identity columns
- **Foreign Keys**: Automatic indexing on relationship columns
- **Business Keys**: Unique indexes on IMEI, ICCID, email
- **Query Optimization**: Consider indexes on frequently filtered fields

#### **Data Types**
- **Enums**: Stored as STRING for readability and flexibility
- **Dates**: LocalDate for dates, LocalDateTime for timestamps
- **Text Fields**: TEXT type for large content (descriptions, notes)
- **Booleans**: Default values specified for clear behavior

---

## 🔍 Data Access Layer (`repository/`)

Spring Data JPA repositories provide type-safe data access with custom query methods:

### **AssignmentHistoryRepository**
- **Purpose**: Query assignment/transfer audit trails
- **Key Methods**:
  - `findByTypeAndItemId()` - Get history for specific phone/SIM
  - `findByToUserIdOrFromUserId()` - Get user-related assignments
  - `countByDateAfter()` - Count recent activities (dashboard)
  - `findTop10ByOrderByDateDesc()` - Recent assignment activities
- **Use Cases**: Audit trails, compliance reporting, activity tracking

### **AttributionRepository**
- **Purpose**: Complex attribution queries with filtering and relationships
- **Key Methods**:
  - `findByUserId()` - User's current attributions
  - `findByStatus()` - Filter by attribution status
  - `findByPhoneIdAndStatus()` / `findBySimCardIdAndStatus()` - Device assignment lookup
  - `findWithFilters()` - Advanced search with multiple criteria
  - `findHistoryByPhoneId()` / `findHistoryBySimCardId()` - Complete device history
  - `countByUserIdAndStatus()` - User assignment counts
- **Features**: 
  - Full-text search across user names, emails, notes
  - Status-based filtering (ACTIVE/PENDING/RETURNED)
  - Historical tracking for devices
- **Performance**: Indexed queries for efficient filtering

### **CalendarEventRepository**
- **Purpose**: Event scheduling and calendar functionality
- **Key Methods**:
  - `findByDateRange()` - Events within time period
  - `findByOrganizer()` - Events created by user
  - `findByAttendeeId()` - Events user is attending
  - `findUpcomingEventsForUser()` - User's upcoming events (as organizer or attendee)
  - `findByType()` / `findByStatus()` - Filter by event category/state
  - `findByLocationContainingIgnoreCase()` / `findByTitleContainingIgnoreCase()` - Text search
  - `findByIsAllDayTrue()` - All-day events
  - `findByRecurrenceIsNotNull()` - Recurring events
- **Features**: 
  - Complex date range queries
  - Many-to-many attendee relationships
  - Case-insensitive text search
- **Calendar Integration**: Full calendar view support

### **FileUploadRepository**
- **Purpose**: Comprehensive file management with metadata queries
- **Key Methods**:
  - `findByUploadType()` - Filter by file category
  - `findByUploadedById()` - User's uploaded files
  - `findByRelatedEntityTypeAndRelatedEntityId()` - Files linked to entities
  - `findByIsPublicTrue()` - Public files
  - `findByContentType()` / `findByFileExtension()` - File type filtering
  - `findByFileNameContainingIgnoreCase()` - File search
  - `findByFileSizeBetween()` - Size-based filtering
  - `getTotalFileSizeByUser()` / `getFileCountByUser()` - User storage stats
  - `findAllUploadTypes()` / `findAllContentTypes()` - Available file types
- **Features**:
  - Advanced file filtering and search
  - Storage analytics and reporting
  - Multi-criteria file discovery
- **Use Cases**: File management, storage monitoring, content organization

### **PhoneRepository**
- **Purpose**: Phone inventory management with business intelligence
- **Key Methods**:
  - `findByImei()` - Unique device lookup
  - `findPhonesWithFilters()` - Multi-criteria search (status, brand, model)
  - `countByAssignedToIsNotNull()` - Assigned phone count
  - `countByStatus()` - Status distribution
  - `findBrandDistribution()` - Brand analytics
  - `findByStatusAndAssignedDateBefore()` - Long-term assignments
- **Features**:
  - Case-insensitive brand/model search
  - Business intelligence queries
  - Assignment analytics
- **Analytics**: Brand distribution, status tracking, assignment patterns

### **RequestRepository**
- **Purpose**: Support ticket and request management with advanced filtering
- **Key Methods**:
  - `findByUserId()` / `findByAssignedToId()` - User-specific requests
  - `findByStatus()` / `findByType()` / `findByPriority()` - Category filtering
  - `findWithFilters()` - Advanced multi-criteria search
  - `countByStatus()` / `countByPriority()` - Request analytics
  - `findByPriorityOrderByCreatedAtDesc()` - Urgent requests
  - `findByStatusOrderByCreatedAtDesc()` - Pending requests
- **Features**:
  - Full-text search across title, description, user names
  - Comprehensive filtering by all request attributes
  - Priority-based querying for urgent issues
- **Workflow**: Complete request lifecycle support

### **SimCardRepository**
- **Purpose**: SIM card inventory with carrier plan management
- **Key Methods**:
  - `findByIccid()` / `findByPuk()` - Unique SIM identification
  - `findSimCardsWithFilters()` - Multi-criteria search (status, number, ICCID)
  - `countByAssignedToIsNotNull()` - Assigned SIM count
  - `countByStatus()` - Status distribution
  - `findByStatusAndAssignedDateBefore()` - Long-term assignments
- **Features**:
  - Partial number/ICCID matching
  - Assignment tracking
  - Status analytics
- **Business Intelligence**: Assignment patterns, inventory management

### **SystemSettingsRepository**
- **Purpose**: System configuration management with categorization
- **Key Methods**:
  - `findByKey()` - Direct setting lookup
  - `findByCategory()` - Category-based settings
  - `findByDataType()` - Type-based filtering
  - `findByIsEditableTrue()` / `findByIsEncryptedTrue()` - Security filtering
  - `findByKeyContainingIgnoreCase()` - Setting search
  - `findByCategoryAndEditable()` - Admin-editable settings
  - `existsByKey()` - Setting existence check
  - `findAllCategories()` - Available categories
- **Features**:
  - Hierarchical setting organization
  - Security-aware queries
  - Administrative control
- **Security**: Encrypted setting handling, editability control

### **UserRepository**
- **Purpose**: User management with comprehensive search and analytics
- **Key Methods**:
  - `findByEmail()` - Authentication lookup
  - `existsByEmail()` / `existsByEmailAndNotId()` - Email uniqueness validation
  - `findUsersWithFilters()` - Advanced user search
  - `findByDepartment()` / `findByStatus()` / `findByRole()` - Category filtering
  - `countActiveUsers()` / `countByRole()` - User analytics
  - `findDepartmentDistribution()` - Organizational analytics
- **Features**:
  - Multi-field text search (name, email, department)
  - Role-based filtering
  - Organizational reporting
- **Security**: Email uniqueness enforcement, status-based access control

### **UserSettingsRepository**
- **Purpose**: Simple user preference management
- **Key Methods**:
  - `findByUser()` / `findByUserId()` - User settings lookup
  - `existsByUser()` / `existsByUserId()` - Settings existence check
- **Features**:
  - One-to-one user relationship
  - Efficient preference retrieval
- **Use Cases**: User customization, UI personalization

### **Repository Design Patterns**

#### **Query Methods**
- **Derived Queries**: Method name-based query generation
- **Custom Queries**: @Query annotation for complex JPQL
- **Native Queries**: SQL for database-specific operations
- **Dynamic Queries**: Criteria API for runtime query building

#### **Performance Optimization**
- **Pagination**: Pageable parameter for large result sets
- **Projections**: DTO projections for efficient data transfer
- **Lazy Loading**: @ManyToOne and @OneToMany fetch strategies
- **Query Optimization**: Strategic use of JOIN FETCH

#### **Search Capabilities**
- **Full-Text Search**: LIKE queries with wildcards
- **Case-Insensitive**: IgnoreCase methods for user-friendly search
- **Multi-Criteria**: Complex WHERE clauses with multiple parameters
- **Range Queries**: BETWEEN operations for dates and numbers

#### **Business Intelligence**
- **Aggregation**: COUNT, SUM, GROUP BY for analytics
- **Distribution Queries**: Statistical data for dashboards
- **Trend Analysis**: Time-based queries for reporting
- **KPI Tracking**: Key performance indicator calculations

#### **Data Integrity**
- **Existence Checks**: Boolean methods for validation
- **Uniqueness Validation**: Duplicate prevention queries
- **Referential Integrity**: Foreign key relationship queries
- **Soft Deletes**: Status-based record management

---

## 🔒 Security Layer (`security/`)

JWT-based authentication and authorization system:

### **JwtAuthenticationFilter**
- **Purpose**: Servlet filter for JWT token validation on each request
- **Key Features**:
  - **Token Extraction**: Retrieves JWT from `Authorization: Bearer <token>` header
  - **User Authentication**: Validates token and loads user from database
  - **Role Assignment**: Sets Spring Security authorities based on user role
  - **Request Filtering**: Skips authentication for public endpoints (`/auth/login`, `/ws`, `/test`)
  - **Security Context**: Establishes authentication context for request processing
- **Flow**:
  1. Extract JWT token from Authorization header
  2. Validate token signature and expiration
  3. Extract username (email) from token claims
  4. Load user from database and verify status
  5. Create Spring Security authentication object
  6. Set authentication in SecurityContext for request
- **Error Handling**: Graceful handling of invalid/expired tokens
- **Debugging**: Extensive logging for troubleshooting authentication issues

### **JwtUtil**
- **Purpose**: JWT token generation, parsing, and validation utility
- **Key Features**:
  - **Token Generation**: Creates signed JWT tokens with user claims
  - **Token Validation**: Verifies signature, expiration, and format
  - **Claim Extraction**: Retrieves user information from token payload
  - **Security**: Uses HMAC-SHA256 signing with configurable secret key
- **Token Structure**:
  - **Header**: Algorithm and token type
  - **Payload**: User email, role, issued/expiration dates
  - **Signature**: HMAC-SHA256 with secret key
- **Configuration**: Configurable secret key and expiration time via `application.yml`
- **Methods**:
  - `generateToken(User)` - Create JWT for authenticated user
  - `validateToken(String)` - Verify token validity
  - `extractUsername(String)` - Get email from token
  - `extractExpiration(String)` - Get token expiration
- **Security Best Practices**: Strong secret key, reasonable expiration times

---

## 🏢 Business Logic Layer (`service/`)

Service classes implement core business logic and coordinate between controllers and repositories:

### **AuthService**
- **Purpose**: Authentication and user session management
- **Key Methods**:
  - `login(LoginRequest)` - Authenticate user and generate JWT
  - `getCurrentUser(String)` - Get user details by email
  - `logout(String)` - Handle user logout (placeholder for token blacklisting)
  - `getUserIdByEmail(String)` - Utility for ID lookup
- **Features**:
  - Password validation using BCrypt
  - User status verification (ACTIVE users only)
  - Last login timestamp tracking
  - JWT token generation
  - Comprehensive error handling
- **Security**: Secure password comparison, account status validation

### **UserService**
- **Purpose**: Complete user lifecycle management
- **Key Methods**:
  - `getUsers()` - Paginated user listing with filtering
  - `createUser(UserDto)` - New user registration
  - `updateUser(Long, UserDto)` - User profile updates
  - `deleteUser(Long)` - User account removal
  - `getUsersByDepartment/Status/Role()` - Filtered user queries
  - `getActiveUserCount()` - Analytics support
- **Features**:
  - Email uniqueness validation
  - Password encryption (BCrypt)
  - Comprehensive user search and filtering
  - Department and role-based organization
  - User analytics and reporting
- **Business Rules**: Email uniqueness, password security, role management

### **PhoneService**
- **Purpose**: Phone inventory and lifecycle management
- **Key Methods**:
  - `getPhones()` - Inventory listing with filtering
  - `createPhone(PhoneDto)` - Add new phone to inventory
  - `updatePhone(Long, PhoneDto)` - Update phone details and assignments
  - `deletePhone(Long)` - Remove phone from inventory
  - `assignPhone(Long, Long)` - Assign phone to user
  - `unassignPhone(Long)` - Return phone to available pool
- **Features**:
  - IMEI uniqueness validation
  - Assignment history tracking
  - Status management (AVAILABLE/ASSIGNED/LOST/DAMAGED)
  - Comprehensive device specifications tracking
  - Business intelligence for inventory management
- **Integration**: Assignment history logging, user validation

### **SimCardService**
- **Purpose**: SIM card inventory and carrier plan management
- **Key Methods**:
  - `getSimCards()` - SIM inventory with filtering
  - `createSimCard(SimCardDto)` - Add new SIM to inventory
  - `updateSimCard(Long, SimCardDto)` - Update SIM details and assignments
  - `assignSimCard(Long, Long)` - Assign SIM to user
  - `unassignSimCard(Long)` - Return SIM to available pool
- **Features**:
  - ICCID and PUK uniqueness validation
  - Carrier plan and cost tracking
  - Assignment lifecycle management
  - Expiration date monitoring
  - Status management (AVAILABLE/ASSIGNED/LOST/BLOCKED)

### **AttributionService**
- **Purpose**: Device and SIM assignment orchestration
- **Key Methods**:
  - `createAttribution()` - Create new device/SIM assignment
  - `updateAttribution()` - Modify assignment details
  - `returnAttribution()` - Process device/SIM returns
  - `getAttributionHistory()` - Historical assignment tracking
  - `getActiveAttributionsByUser()` - User's current assignments
- **Features**:
  - Complex assignment workflows
  - Historical tracking and audit trails
  - Multi-device assignments (phone + SIM)
  - Return processing with notes
  - Assignment analytics and reporting

### **DashboardService**
- **Purpose**: Business intelligence and analytics
- **Key Methods**:
  - `getDashboardOverview()` - High-level system statistics
  - `getPhoneStats()` - Phone inventory analytics
  - `getSimCardStats()` - SIM card distribution analysis
  - `getUserStats()` - User and department analytics
  - `getRecentActivity()` - Recent assignment activities
  - `getAlerts()` - Items requiring attention
- **Features**:
  - Real-time statistics calculation
  - Brand and status distribution analysis
  - Assignment rate calculations
  - Trend analysis and reporting
  - Alert generation for management

### **RequestService**
- **Purpose**: Support ticket and request management
- **Key Methods**:
  - `createRequest()` - Submit new user request
  - `updateRequest()` - Modify request details and status
  - `assignRequest()` - Assign request to support staff
  - `resolveRequest()` - Close request with resolution
  - `getRequestsByUser/Priority/Status()` - Request filtering
- **Features**:
  - Complete request lifecycle management
  - Priority-based routing (LOW/NORMAL/HIGH/URGENT)
  - Assignment to support staff
  - Resolution tracking and documentation
  - Request analytics and reporting

### **ExportService**
- **Purpose**: Data export and reporting
- **Key Methods**:
  - `exportUsers/Phones/SimCards()` - Entity data export
  - `exportAttributions/Requests()` - Relationship data export
  - `exportAuditLogs()` - Compliance reporting
- **Features**:
  - Multiple format support (CSV, Excel)
  - Filtered data export
  - Formatted reports with styling
  - Large dataset handling
  - Compliance and audit reporting

### **Service Design Patterns**
- **Transaction Management**: @Transactional for data consistency
- **Error Handling**: Comprehensive exception handling with meaningful messages
- **Validation**: Business rule validation before database operations
- **Integration**: Coordinated operations across multiple entities
- **Caching**: Strategic caching for performance optimization
- **Audit Logging**: Automatic tracking of business operations

---

## 🛠️ Utilities (`utils/`)

Helper classes for common functionality:

### **CsvExportUtil**
- **Purpose**: CSV file generation utility
- **Features**:
  - **OpenCSV Integration**: Uses OpenCSV library for standards-compliant CSV generation
  - **UTF-8 Encoding**: Proper character encoding for international content
  - **Memory Efficient**: Stream-based processing for large datasets
  - **Configurable Formatting**: Standard CSV delimiters and escaping
- **Usage**: Used by ExportService for CSV data exports
- **Error Handling**: Graceful handling of encoding and I/O errors

### **ExcelExportUtil**
- **Purpose**: Excel file generation utility
- **Features**:
  - **Apache POI Integration**: Uses POI library for XLSX file creation
  - **Professional Styling**: Header formatting, alternating row colors
  - **Auto-sizing**: Automatic column width adjustment
  - **Memory Management**: Efficient workbook creation and cleanup
- **Styling**:
  - **Headers**: Bold white text on blue background
  - **Alternating Rows**: Light gray background for readability
  - **Auto-fit Columns**: Optimal column widths
- **Usage**: Used by ExportService for Excel data exports
- **Performance**: Optimized for large datasets with streaming support

### **Utility Design Patterns**
- **Static Methods**: Utility functions as static methods for easy access
- **Resource Management**: Proper try-with-resources for file handling
- **Error Handling**: Runtime exceptions with descriptive messages
- **Memory Efficiency**: Stream-based processing to minimize memory usage
- **Format Standards**: Compliance with CSV and Excel format specifications

---

## 🗃️ Database Schema

Complete database schema with all tables, relationships, and constraints:

### **Core Tables**

```sql
-- Users table - User accounts and authentication
CREATE TABLE users (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL DEFAULT 'USER',
    department NVARCHAR(255) NOT NULL,
    position NVARCHAR(255),
    status NVARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    join_date DATE,
    last_login DATETIME2,
    phone NVARCHAR(50),
    address NVARCHAR(500),
    manager NVARCHAR(255),
    avatar NVARCHAR(500),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2
);

-- Phones table - Phone inventory
CREATE TABLE phone (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    brand NVARCHAR(100) NOT NULL,
    model NVARCHAR(100) NOT NULL,
    imei NVARCHAR(50) UNIQUE NOT NULL,
    serial_number NVARCHAR(100),
    status NVARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    condition NVARCHAR(50) NOT NULL DEFAULT 'EXCELLENT',
    storage NVARCHAR(50),
    color NVARCHAR(50),
    price DECIMAL(10,2),
    assigned_to_id BIGINT,
    assigned_date DATE,
    purchase_date DATE,
    notes NVARCHAR(MAX),
    FOREIGN KEY (assigned_to_id) REFERENCES users(id)
);

-- SIM Cards table - SIM card inventory
CREATE TABLE sim_card (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    number NVARCHAR(50) NOT NULL,
    iccid NVARCHAR(50) UNIQUE NOT NULL,
    pin NVARCHAR(10) NOT NULL,
    puk NVARCHAR(20) UNIQUE NOT NULL,
    poke NVARCHAR(50) NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    carrier NVARCHAR(100),
    [plan] NVARCHAR(100),
    monthly_fee DECIMAL(10,2),
    data_limit NVARCHAR(50),
    activation_date DATE,
    expiry_date DATE,
    assigned_to_id BIGINT,
    assigned_date DATE,
    notes NVARCHAR(MAX),
    FOREIGN KEY (assigned_to_id) REFERENCES users(id)
);

-- Attributions table - Device/SIM assignments
CREATE TABLE attributions (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    phone_id BIGINT,
    sim_card_id BIGINT,
    assigned_by_id BIGINT NOT NULL,
    assignment_date DATE NOT NULL,
    return_date DATE,
    status NVARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    notes NVARCHAR(MAX),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (phone_id) REFERENCES phone(id),
    FOREIGN KEY (sim_card_id) REFERENCES sim_card(id),
    FOREIGN KEY (assigned_by_id) REFERENCES users(id)
);

-- Assignment History table - Audit trail
CREATE TABLE assignment_history (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    type NVARCHAR(50) NOT NULL, -- 'PHONE' or 'SIM'
    item_id BIGINT NOT NULL,
    from_user_id BIGINT,
    to_user_id BIGINT,
    action NVARCHAR(50) NOT NULL, -- 'ASSIGN', 'UNASSIGN', 'TRANSFER'
    date DATETIME2 NOT NULL,
    notes NVARCHAR(MAX)
);
```

### **System Tables**

```sql
-- Requests table - Support tickets
CREATE TABLE requests (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type NVARCHAR(50) NOT NULL, -- 'PROBLEM', 'REPLACEMENT', 'SUPPORT', 'CHANGE'
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'PENDING',
    priority NVARCHAR(50) NOT NULL DEFAULT 'NORMAL',
    assigned_to_id BIGINT,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2,
    resolved_at DATETIME2,
    resolution NVARCHAR(MAX),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (assigned_to_id) REFERENCES users(id)
);

-- Calendar Events table - Event scheduling
CREATE TABLE calendar_events (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    start_time DATETIME2 NOT NULL,
    end_time DATETIME2 NOT NULL,
    location NVARCHAR(255),
    type NVARCHAR(50) NOT NULL, -- 'MEETING', 'MAINTENANCE', 'TRAINING', etc.
    status NVARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    organizer_id BIGINT NOT NULL,
    color NVARCHAR(20),
    is_all_day BIT NOT NULL DEFAULT 0,
    recurrence NVARCHAR(255),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2,
    FOREIGN KEY (organizer_id) REFERENCES users(id)
);

-- Event Attendees junction table
CREATE TABLE event_attendees (
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (event_id, user_id),
    FOREIGN KEY (event_id) REFERENCES calendar_events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- File Uploads table - File management
CREATE TABLE file_uploads (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    file_name NVARCHAR(255) NOT NULL,
    original_name NVARCHAR(255) NOT NULL,
    file_path NVARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    content_type NVARCHAR(255) NOT NULL,
    file_extension NVARCHAR(10),
    upload_type NVARCHAR(50) NOT NULL, -- 'AVATAR', 'ATTACHMENT', 'DOCUMENT', etc.
    uploaded_by BIGINT NOT NULL,
    related_entity_type NVARCHAR(100),
    related_entity_id BIGINT,
    description NVARCHAR(MAX),
    is_public BIT NOT NULL DEFAULT 0,
    download_count INT NOT NULL DEFAULT 0,
    uploaded_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- System Settings table - Configuration
CREATE TABLE system_settings (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    setting_key NVARCHAR(255) UNIQUE NOT NULL,
    setting_value NVARCHAR(MAX),
    description NVARCHAR(500),
    category NVARCHAR(100) NOT NULL DEFAULT 'general',
    data_type NVARCHAR(50) NOT NULL DEFAULT 'string',
    is_encrypted BIT NOT NULL DEFAULT 0,
    is_editable BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2
);

-- User Settings table - User preferences
CREATE TABLE user_settings (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    theme NVARCHAR(50) NOT NULL DEFAULT 'light',
    language NVARCHAR(10) NOT NULL DEFAULT 'en',
    timezone NVARCHAR(50) NOT NULL DEFAULT 'UTC',
    date_format NVARCHAR(50) NOT NULL DEFAULT 'yyyy-MM-dd',
    time_format NVARCHAR(50) NOT NULL DEFAULT 'HH:mm',
    auto_refresh_interval INT DEFAULT 30,
    page_size INT NOT NULL DEFAULT 10,
    show_help_tooltips BIT NOT NULL DEFAULT 1,
    compact_mode BIT NOT NULL DEFAULT 0,
    sidebar_collapsed BIT NOT NULL DEFAULT 0,
    dashboard_layout NVARCHAR(50) DEFAULT 'default',
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### **Database Migrations**

The system uses Flyway for database migrations:

#### **V2__add_phone_fields.sql**
```sql
-- Add missing phone fields for comprehensive inventory management
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'phone' AND COLUMN_NAME = 'serial_number')
    ALTER TABLE phone ADD serial_number NVARCHAR(100);

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'phone' AND COLUMN_NAME = 'storage')
    ALTER TABLE phone ADD storage NVARCHAR(50);

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'phone' AND COLUMN_NAME = 'color')
    ALTER TABLE phone ADD color NVARCHAR(50);

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'phone' AND COLUMN_NAME = 'price')
    ALTER TABLE phone ADD price DECIMAL(10,2);

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'phone' AND COLUMN_NAME = 'condition')
    ALTER TABLE phone ADD condition NVARCHAR(50) NOT NULL DEFAULT 'EXCELLENT';
```

#### **V3__add_simcard_fields.sql**
```sql
-- Add carrier plan management fields to SIM cards
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'sim_card' AND COLUMN_NAME = 'carrier')
    ALTER TABLE sim_card ADD carrier NVARCHAR(100);

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'sim_card' AND COLUMN_NAME = 'plan')
    ALTER TABLE sim_card ADD [plan] NVARCHAR(100);

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'sim_card' AND COLUMN_NAME = 'monthly_fee')
    ALTER TABLE sim_card ADD monthly_fee DECIMAL(10,2);

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'sim_card' AND COLUMN_NAME = 'data_limit')
    ALTER TABLE sim_card ADD data_limit NVARCHAR(50);

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'sim_card' AND COLUMN_NAME = 'activation_date')
    ALTER TABLE sim_card ADD activation_date DATE;

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'sim_card' AND COLUMN_NAME = 'expiry_date')
    ALTER TABLE sim_card ADD expiry_date DATE;
```

#### **V4__add_phone_purchase_date.sql**
```sql
-- Add purchase date tracking for phones
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'phone' AND COLUMN_NAME = 'purchase_date')
    ALTER TABLE phone ADD purchase_date DATE;
```

### **Indexes and Performance**

```sql
-- Performance indexes for common queries
CREATE INDEX IX_users_email ON users(email);
CREATE INDEX IX_users_department ON users(department);
CREATE INDEX IX_users_role ON users(role);
CREATE INDEX IX_users_status ON users(status);

CREATE INDEX IX_phone_imei ON phone(imei);
CREATE INDEX IX_phone_status ON phone(status);
CREATE INDEX IX_phone_brand ON phone(brand);
CREATE INDEX IX_phone_assigned_to ON phone(assigned_to_id);

CREATE INDEX IX_sim_card_iccid ON sim_card(iccid);
CREATE INDEX IX_sim_card_status ON sim_card(status);
CREATE INDEX IX_sim_card_assigned_to ON sim_card(assigned_to_id);

CREATE INDEX IX_attributions_user ON attributions(user_id);
CREATE INDEX IX_attributions_status ON attributions(status);
CREATE INDEX IX_attributions_assignment_date ON attributions(assignment_date);

CREATE INDEX IX_assignment_history_type_item ON assignment_history(type, item_id);
CREATE INDEX IX_assignment_history_date ON assignment_history(date);

CREATE INDEX IX_requests_user ON requests(user_id);
CREATE INDEX IX_requests_status ON requests(status);
CREATE INDEX IX_requests_priority ON requests(priority);

CREATE INDEX IX_calendar_events_organizer ON calendar_events(organizer_id);
CREATE INDEX IX_calendar_events_date_range ON calendar_events(start_time, end_time);

CREATE INDEX IX_file_uploads_uploaded_by ON file_uploads(uploaded_by);
CREATE INDEX IX_file_uploads_type ON file_uploads(upload_type);
CREATE INDEX IX_file_uploads_entity ON file_uploads(related_entity_type, related_entity_id);
```

---

## 🚀 Deployment & Production

### **Environment Configuration**

```yaml
# Production application.yml
spring:
  profiles:
    active: production
  
  datasource:
    url: jdbc:sqlserver://prod-server:1433;databaseName=TelephoneManager;encrypt=true;trustServerCertificate=false
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: com.microsoft.sqlserver.jdbc.SQLServerDriver
  
  jpa:
    hibernate:
      ddl-auto: validate  # Never auto-create in production
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.SQLServerDialect
        format_sql: false
  
  flyway:
    enabled: true
    baseline-on-migrate: true
    validate-on-migrate: true

jwt:
  secret: ${JWT_SECRET}  # Strong 256-bit secret
  expiration: 86400000   # 24 hours

logging:
  level:
    com.telephonemanager: INFO
    org.springframework.security: WARN
  file:
    name: logs/telephone-manager.log
  pattern:
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"

server:
  port: 8080
  servlet:
    context-path: /api
```

### **Docker Deployment**

```dockerfile
# Dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/telephone-manager-*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DB_USERNAME=sa
      - DB_PASSWORD=YourStrong@Password
      - JWT_SECRET=your-256-bit-secret-key-here
    depends_on:
      - db
    
  db:
    image: mcr.microsoft.com/mssql/server:2019-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrong@Password
    ports:
      - "1433:1433"
    volumes:
      - sqlserver_data:/var/opt/mssql

volumes:
  sqlserver_data:
```

### **Production Checklist**

- [ ] **Security**: Strong JWT secret, HTTPS enabled, SQL injection protection
- [ ] **Database**: Connection pooling, backup strategy, monitoring
- [ ] **Logging**: Structured logging, log rotation, centralized collection
- [ ] **Monitoring**: Application metrics, health checks, alerting
- [ ] **Performance**: JVM tuning, database indexes, caching strategy
- [ ] **Backup**: Database backups, file storage backups, disaster recovery
- [ ] **SSL/TLS**: Certificate installation, HTTPS redirection
- [ ] **Firewall**: Network security, port restrictions, VPN access

---

## 🔧 Configuration

### **Application Properties**

```yaml
# Complete application.yml reference
spring:
  application:
    name: telephone-manager
  
  datasource:
    url: jdbc:sqlserver://localhost:1433;databaseName=TelephoneManager;encrypt=true;trustServerCertificate=true
    username: sa
    password: YourStrong@Passw0rd
    driver-class-name: com.microsoft.sqlserver.jdbc.SQLServerDriver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 20000
      idle-timeout: 300000
      max-lifetime: 1200000
  
  jpa:
    hibernate:
      ddl-auto: update
      naming:
        physical-strategy: org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.SQLServerDialect
        format_sql: true
        use_sql_comments: true
  
  flyway:
    enabled: true
    baseline-on-migrate: true
    locations: classpath:db/migration
  
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB

jwt:
  secret: mySecretKey123456789012345678901234567890
  expiration: 86400000  # 24 hours in milliseconds

logging:
  level:
    com.telephonemanager: DEBUG
    org.springframework.security: DEBUG
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
  pattern:
    console: "%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"

server:
  port: 8080
  servlet:
    context-path: /api
  error:
    include-message: always
    include-binding-errors: always
```

---

## 🐛 Troubleshooting

### **Common Issues**

#### **Database Connection Issues**
```bash
# Check SQL Server status
sqlcmd -S localhost -U sa -P YourPassword -Q "SELECT @@VERSION"

# Test connection from Java
telnet localhost 1433
```

**Solutions:**
- Verify SQL Server is running and accepting connections
- Check firewall settings (port 1433)
- Validate connection string and credentials
- Ensure database exists and user has permissions

#### **JWT Authentication Problems**
```json
// Invalid token response
{
  "timestamp": "2024-01-15T10:30:00.000+00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "JWT token is expired",
  "path": "/api/users"
}
```

**Solutions:**
- Check JWT secret key configuration
- Verify token expiration settings
- Ensure proper Authorization header format: `Bearer <token>`
- Check system clock synchronization

#### **Port Conflicts**
```bash
# Find process using port 8080
netstat -ano | findstr :8080
taskkill /PID <process_id> /F

# Use alternative port
server.port=8081
```

#### **Memory Issues**
```bash
# Increase JVM heap size
java -Xmx2g -Xms1g -jar telephone-manager.jar

# Monitor memory usage
jstat -gc <pid> 5s
```

### **Log Analysis**

```bash
# View application logs
tail -f logs/application.log

# Filter authentication logs
grep "JWT FILTER" logs/application.log

# Database query logs
grep "org.hibernate.SQL" logs/application.log

# Error tracking
grep "ERROR" logs/application.log | tail -20
```

### **Performance Monitoring**

```bash
# Database connection pool monitoring
grep "HikariPool" logs/application.log

# Response time analysis
grep "Completed" logs/application.log | awk '{print $NF}' | sort -n

# Memory usage tracking
jcmd <pid> VM.info
```

---

## 📈 Performance & Scalability

### **Database Optimization**
- **Connection Pooling**: HikariCP with optimized settings
- **Query Optimization**: Proper indexing on frequently queried columns
- **Pagination**: All list endpoints support pagination
- **Lazy Loading**: JPA relationships configured for optimal loading

### **Caching Strategy**
- **Application Cache**: Spring Cache for frequently accessed data
- **Database Cache**: SQL Server query plan caching
- **Static Resources**: CDN for file downloads

### **Monitoring & Metrics**
- **Application Metrics**: Micrometer with Prometheus integration
- **Database Monitoring**: Connection pool metrics, query performance
- **Health Checks**: Spring Boot Actuator endpoints
- **Alerting**: Integration with monitoring systems

---

## 🤝 Contributing

### **Development Setup**
1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch
4. **Implement** your changes with tests
5. **Submit** a pull request

### **Code Standards**
- **Java Style**: Follow Google Java Style Guide
- **Documentation**: Comprehensive JavaDoc for public APIs
- **Testing**: Unit tests for services, integration tests for controllers
- **Security**: Security review for authentication/authorization changes

### **Pull Request Process**
1. Update documentation for API changes
2. Add/update tests for new functionality
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request code review

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For support and questions:
- **Documentation**: This comprehensive README
- **API Documentation**: [Swagger UI](http://localhost:8080/api/swagger-ui.html)
- **Issues**: GitHub Issues for bug reports and feature requests
- **Email**: Contact the development team

---

## 🎯 Conclusion

The **TelephoneManager Backend** is a comprehensive, enterprise-grade solution for managing corporate device and SIM card assignments. Built with Spring Boot and following industry best practices, it provides:

✅ **Complete Feature Set**: User management, device inventory, assignment tracking, reporting  
✅ **Security First**: JWT authentication, role-based access, data protection  
✅ **Scalable Architecture**: Layered design, optimized queries, performance monitoring  
✅ **Production Ready**: Docker support, comprehensive logging, error handling  
✅ **Developer Friendly**: Extensive documentation, API specs, testing support  

**Perfect for:**
- IT departments managing corporate devices
- Asset managers tracking inventory
- Organizations requiring audit trails
- Teams needing comprehensive reporting

**Key Strengths:**
- **Robust**: Comprehensive error handling and data validation
- **Flexible**: Configurable roles, permissions, and workflows  
- **Maintainable**: Clean architecture with extensive documentation
- **Extensible**: Modular design supporting future enhancements

> *Developed to streamline device and SIM management in modern organizations, providing the tools needed for efficient IT asset management and user support.*

--- 