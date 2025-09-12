# 📱 TelephoneManager Frontend

[![Next.js](https://img.shields.io/badge/Next.js-14.2%2B-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, responsive React frontend for the TelephoneManager system, built with Next.js 14, TypeScript, and Tailwind CSS. Provides role-based dashboards for managing corporate phone and SIM card assignments with real-time synchronization to the backend API.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- TelephoneManager Backend running on `http://localhost:8080`

### Installation & Setup
```bash
# Clone the repository
git clone <repository-url>
cd dashboard_pma

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Start development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8080/api](http://localhost:8080/api)

---

## 🏗️ Technology Stack

### **Core Framework**
- **Next.js 14**: App Router, Server Components, TypeScript support
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript 5**: Full type safety and enhanced developer experience

### **UI & Styling**
- **Tailwind CSS 3.4**: Utility-first CSS framework
- **Radix UI**: Unstyled, accessible UI primitives
- **Lucide React**: Beautiful, customizable icons
- **Next Themes**: Dark/light mode support

### **State Management & Data**
- **Axios**: HTTP client for API communication
- **React Hook Form**: Performant forms with validation
- **Zod**: TypeScript-first schema validation

### **Charts & Visualization**
- **Recharts**: Composable charting library
- **ECharts**: Professional data visualization
- **React Resizable Panels**: Flexible layout management

### **Development Tools**
- **OpenAPI Generator**: Auto-generated API client
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing and optimization

---

## 📋 Features

### **🔐 Authentication & Authorization**
- JWT-based authentication with automatic token management
- Role-based access control (ADMIN, ASSIGNER, USER)
- Secure route protection and API request authentication
- Automatic token refresh and session management

### **📊 Role-Based Dashboards**
- **Admin Dashboard**: Complete system management and analytics
- **Assigner Dashboard**: Device assignment and user management
- **User Dashboard**: Personal assignments and request management

### **📱 Device Management**
- Complete phone inventory with detailed specifications
- SIM card management with carrier plan tracking
- Assignment history and audit trails
- Real-time status updates and availability tracking

### **👥 User Management**
- User creation, editing, and role assignment
- Department-based organization and filtering
- Profile management with avatar support
- Activity tracking and audit logs

### **📈 Analytics & Reporting**
- Interactive charts and data visualization
- Real-time statistics and KPI tracking
- Export functionality (CSV, Excel)
- Custom date ranges and filtering

### **🎨 Modern UI/UX**
- Responsive design for all screen sizes
- Dark/light theme support
- Accessible components following WCAG guidelines
- Smooth animations and transitions

---

## 🏛️ Project Structure

```text
├── app/                          # Next.js App Router
│   ├── admin-dashboard/          # Admin role dashboard
│   ├── assigner-dashboard/       # Assigner role dashboard  
│   ├── user-dashboard/           # User role dashboard
│   ├── layout.tsx               # Root layout component
│   ├── page.tsx                 # Landing/login page
│   └── globals.css              # Global styles
├── components/                   # Reusable UI components
│   ├── ui/                      # Base UI components (Radix + Tailwind)
│   ├── modals/                  # Modal components
│   ├── charts/                  # Data visualization components
│   └── dashboard/               # Dashboard-specific components
├── lib/                         # Utility libraries
│   ├── apiClient.ts            # Axios API client configuration
│   └── utils.ts                # Utility functions
├── src/api/                     # API integration layer
├── hooks/                       # Custom React hooks
├── styles/                      # Additional styling
└── public/                      # Static assets
```

--- 

## 🔌 API Integration & Backend Synchronization

### **API Client Architecture**

The frontend uses a sophisticated API integration layer built on OpenAPI specifications:

#### **Auto-Generated API Client**
- **OpenAPI Generator**: Automatically generates TypeScript API clients from backend OpenAPI spec
- **Type Safety**: Full TypeScript support with auto-generated interfaces and models
- **Configuration**: Centralized API configuration with JWT token management

```typescript
// lib/apiClient.ts
export function getApiConfig(token: string | null) {
  return new Configuration({
    basePath: 'http://localhost:8080/api',
    baseOptions: {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {},
    },
  });
}
```

#### **Generated API Controllers**
- **AuthenticationApi**: Login, logout, user session management
- **UserManagementApi**: User CRUD operations and role management
- **PhoneManagementApi**: Phone inventory and assignment operations
- **SimcardManagementApi**: SIM card management and carrier plans
- **AttributionManagementApi**: Device/SIM assignment workflows
- **DashboardReportingApi**: Analytics and reporting data
- **CalendarEventControllerApi**: Event scheduling and management
- **FileUploadControllerApi**: File upload and document management
- **ExportControllerApi**: Data export functionality
- **SystemSettingsControllerApi**: System configuration management
- **UserSettingsControllerApi**: User preference management
- **RequestManagementApi**: Support ticket management
- **AssignmentHistoryApi**: Audit trail and history tracking
- **AuditLogsApi**: System audit and compliance logs

### **Real-Time Synchronization**

#### **JWT Token Management**
- **Automatic Token Inclusion**: All API requests include JWT bearer tokens
- **Token Storage**: Secure localStorage management with automatic cleanup
- **Token Parsing**: Client-side JWT parsing for user information extraction
- **Session Management**: Automatic logout on token expiration

#### **Error Handling & Resilience**
- **Centralized Error Handling**: Consistent error processing across all API calls
- **User-Friendly Messages**: French localized error messages
- **Retry Logic**: Automatic retry for network failures
- **Offline Detection**: Graceful handling of network connectivity issues

#### **Data Synchronization Patterns**
- **Optimistic Updates**: Immediate UI updates with server confirmation
- **Real-Time Refresh**: Automatic data refresh on user actions
- **Conflict Resolution**: Handling concurrent modifications
- **Cache Invalidation**: Smart cache management for data consistency

---

## 🔐 Authentication & Authorization Flow

### **Login Process**
1. **User Input**: Email/password form with role-based demo accounts
2. **API Call**: POST to `/auth/login` endpoint with credentials
3. **Token Reception**: JWT token and user data from backend
4. **Local Storage**: Secure storage of authentication data
5. **Role-Based Redirect**: Automatic navigation to appropriate dashboard

```typescript
// Login implementation
const handleLogin = async (credentials) => {
  const authApi = new AuthenticationApi(getApiConfig(null))
  const response = await authApi.login(credentials)
  
  if (response.data.success) {
    const { token, user } = response.data.data
    
    // Store authentication data
    localStorage.setItem("jwt_token", token)
    localStorage.setItem("userRole", user.role.toLowerCase())
    localStorage.setItem("userId", user.id.toString())
    // ... additional user data
    
    // Role-based navigation
    const role = user.role.toLowerCase()
    window.location.href = `/${role}-dashboard`
  }
}
```

### **Session Management**
- **Token Persistence**: JWT tokens stored in localStorage
- **Automatic Inclusion**: Tokens automatically added to all API requests
- **Session Validation**: Client-side token expiration checking
- **Secure Logout**: Complete session cleanup on logout

### **Route Protection**
- **Role-Based Routing**: Separate dashboard routes for each user role
- **Access Control**: Component-level permission checking
- **Redirect Logic**: Automatic redirection based on authentication status
- **Protected Resources**: API endpoints secured with JWT validation

---

## 👥 Role-Based Access Control (RBAC)

### **User Roles & Permissions**

#### **🔴 ADMIN Role**
- **Full System Access**: Complete administrative control
- **User Management**: Create, edit, delete users and assign roles
- **Device Management**: Full phone and SIM card inventory control
- **System Settings**: Configure system-wide parameters
- **Analytics**: Access to all reporting and analytics
- **Audit Logs**: View complete system audit trails

**Dashboard Features:**
- System analytics and KPI overview
- User management with role assignment
- Complete device inventory management
- System settings and configuration
- Comprehensive reporting and exports

#### **🟡 ASSIGNER Role**
- **Device Assignment**: Assign/unassign phones and SIM cards
- **User Oversight**: View and manage user assignments
- **Inventory Management**: Track device availability and status
- **Assignment History**: View assignment audit trails
- **Basic Reporting**: Access to assignment-related reports

**Dashboard Features:**
- Assignment management board (Kanban-style)
- Device assignment workflows
- User assignment overview
- SIM card assignment management
- Assignment history and tracking

#### **🟢 USER Role**
- **Personal View**: Access only to own assignments and data
- **Device Information**: View assigned phone and SIM details
- **Request Management**: Submit and track support requests
- **Profile Management**: Update personal information and preferences

**Dashboard Features:**
- Personal device assignment overview
- Support request submission and tracking
- Profile and settings management
- Assignment history (own devices only)

### **Permission Matrix**

| Feature | Admin | Assigner | User |
|---------|--------|----------|------|
| View All Users | ✅ | ✅ | ❌ |
| Create/Edit Users | ✅ | ❌ | ❌ |
| Delete Users | ✅ | ❌ | ❌ |
| View All Devices | ✅ | ✅ | ❌ |
| Assign Devices | ✅ | ✅ | ❌ |
| System Settings | ✅ | ❌ | ❌ |
| View Own Assignments | ✅ | ✅ | ✅ |
| Submit Requests | ✅ | ✅ | ✅ |
| View Analytics | ✅ | ✅ | ❌ |
| Export Data | ✅ | ✅ | ❌ |

### **Dynamic Navigation**
Role-based sidebar navigation adapts to user permissions:

```typescript
const getMenuItems = () => {
  if (userRole === "admin") {
    return [
      { id: "analytics", label: "Analytics", href: "/admin-dashboard" },
      { id: "users", label: "Utilisateurs", href: "/admin-dashboard/users" },
      { id: "phones", label: "Téléphones", href: "/admin-dashboard/phones" },
      // ... admin-specific items
    ]
  } else if (userRole === "assigner") {
    return [
      { id: "board", label: "Board", href: "/assigner-dashboard" },
      { id: "attributions", label: "Attributions", href: "/assigner-dashboard/attributions" },
      // ... assigner-specific items
    ]
  } else {
    return [
      { id: "dashboard", label: "Dashboard", href: "/user-dashboard" },
      { id: "my-phone", label: "Mon Téléphone", href: "/user-dashboard/my-phone" },
      // ... user-specific items
    ]
  }
}
```

--- 

## 🎨 UI Components Architecture

### **Design System**

The frontend uses a comprehensive design system built on **Radix UI** primitives and **Tailwind CSS**:

#### **Base UI Components (`components/ui/`)**
- **50+ Reusable Components**: Complete set of accessible, unstyled primitives
- **Radix UI Foundation**: Keyboard navigation, focus management, screen reader support
- **Tailwind Styling**: Utility-first CSS with consistent design tokens
- **TypeScript Support**: Full type safety and IntelliSense support

**Core Components:**
- **Form Controls**: Input, Select, Textarea, Checkbox, Radio, Switch
- **Navigation**: Button, Dropdown Menu, Navigation Menu, Breadcrumb
- **Layout**: Card, Sheet, Dialog, Accordion, Tabs, Separator
- **Feedback**: Alert, Toast, Progress, Skeleton, Badge
- **Data Display**: Table, Avatar, Calendar, Chart, Carousel
- **Interactive**: Command, Context Menu, Hover Card, Tooltip

#### **Business Components (`components/`)**
- **Modal Components**: Phone, SIM Card, User, Attribution management modals
- **Dashboard Components**: Stats cards, activity feeds, assignment queues
- **Chart Components**: Modern chart implementations with ECharts and Recharts
- **Navigation**: Role-based sidebar with dynamic menu generation
- **Data Tables**: Advanced data tables with sorting, filtering, pagination

### **Component Architecture Patterns**

#### **Modal Components**
Comprehensive form modals with API integration:

```typescript
// Phone Modal Example
export function PhoneModal({ isOpen, onClose, onSave, phone }: PhoneModalProps) {
  const [formData, setFormData] = useState<FormData>({
    model: "", brand: "", imei: "", status: "AVAILABLE"
  })
  const [users, setUsers] = useState<any[]>([])
  
  // API integration for data fetching
  useEffect(() => {
    const fetchData = async () => {
      const userApi = new UserManagementApi(getApiConfig(token))
      const usersRes = await userApi.getUsers(1, 1000)
      setUsers(usersRes.data.content)
    }
    fetchData()
  }, [isOpen])

  // Form submission with API call
  const handleSubmit = async () => {
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      // Error handling
    }
  }
}
```

#### **Smart Search Components**
Auto-complete search with keyboard navigation:

```typescript
// Attribution Modal - User Search
const [userSearch, setUserSearch] = useState("")
const [showUserSuggestions, setShowUserSuggestions] = useState(false)
const [selectedUserIndex, setSelectedUserIndex] = useState(-1)

// Keyboard navigation
const handleUserKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "ArrowDown") {
    setSelectedUserIndex(prev => 
      prev < filteredUsers.length - 1 ? prev + 1 : 0
    )
  } else if (e.key === "ArrowUp") {
    setSelectedUserIndex(prev => 
      prev > 0 ? prev - 1 : filteredUsers.length - 1
    )
  } else if (e.key === "Enter" && selectedUserIndex >= 0) {
    selectUser(filteredUsers[selectedUserIndex])
  }
}
```

### **Responsive Design**
- **Mobile-First**: Responsive design starting from mobile screens
- **Breakpoint System**: Tailwind's responsive utility classes
- **Adaptive Layouts**: Components adapt to different screen sizes
- **Touch-Friendly**: Appropriate touch targets and gestures

---

## 📊 Data Visualization & Analytics

### **Chart Libraries Integration**

#### **Recharts Implementation**
Modern, composable charting library for React:

```typescript
// Phone Chart Component
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function PhoneChart({ data }: PhoneChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="assigned" fill="#3B82F6" />
        <Bar dataKey="available" fill="#10B981" />
      </BarChart>
    </ResponsiveContainer>
  )
}
```

#### **Custom SVG Charts**
Hand-crafted SVG charts for specific visualizations:

```typescript
// Modern Chart Component - Custom Line Chart
export function ModernChart({ type, data, height }: ModernChartProps) {
  useEffect(() => {
    if (type === "line") {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      
      // Create gradients for area fills
      const blueGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient")
      blueGradient.setAttribute("id", "blueGradient")
      
      // Calculate data points and create paths
      const maxValue = Math.max(...data.map(d => Math.max(d.value1, d.value2 || 0)))
      // ... path creation logic
    }
  }, [type, data, height])
}
```

#### **ECharts Integration**
Professional data visualization for complex charts:

```typescript
import ReactECharts from 'echarts-for-react'

// Dashboard analytics with ECharts
const option = {
  title: { text: 'Device Assignment Overview' },
  tooltip: { trigger: 'axis' },
  legend: { data: ['Phones', 'SIM Cards'] },
  xAxis: { type: 'category', data: months },
  yAxis: { type: 'value' },
  series: [
    { name: 'Phones', type: 'line', data: phoneData },
    { name: 'SIM Cards', type: 'line', data: simData }
  ]
}

return <ReactECharts option={option} style={{ height: '400px' }} />
```

### **Dashboard Analytics**

#### **Real-Time Statistics**
- **KPI Cards**: Live updating statistics cards
- **Status Distribution**: Pie charts for device status breakdown
- **Assignment Trends**: Line charts showing assignment patterns over time
- **Department Analytics**: Bar charts for departmental device distribution

#### **Interactive Features**
- **Drill-Down**: Click on chart elements to view detailed data
- **Date Range Selection**: Custom date pickers for time-based analysis
- **Export Functionality**: Download charts as images or export data as CSV/Excel
- **Responsive Charts**: Charts adapt to different screen sizes

#### **Data Sources**
- **Dashboard API**: Real-time data from backend analytics endpoints
- **Caching Strategy**: Smart caching to minimize API calls
- **Error Handling**: Graceful fallbacks for data loading errors
- **Loading States**: Skeleton components during data fetching

---

## 📝 Form Management & Validation

### **React Hook Form Integration**

The application uses React Hook Form for performant, flexible form handling:

```typescript
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// Zod schema for validation
const phoneSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  imei: z.string().regex(/^\d{15}$/, "IMEI must be 15 digits"),
  status: z.enum(["AVAILABLE", "ASSIGNED", "LOST", "DAMAGED"]),
  price: z.number().positive("Price must be positive")
})

// Form component
export function PhoneForm({ onSubmit, defaultValues }: PhoneFormProps) {
  const form = useForm({
    resolver: zodResolver(phoneSchema),
    defaultValues
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
```

### **Form Features**

#### **Validation System**
- **Zod Schemas**: TypeScript-first schema validation
- **Real-Time Validation**: Instant feedback as users type
- **Custom Validators**: Business-specific validation rules
- **Error Messages**: User-friendly, localized error messages

#### **Dynamic Forms**
- **Conditional Fields**: Fields that appear/hide based on other selections
- **Dependent Dropdowns**: Cascading select menus (Brand → Model)
- **Auto-Complete**: Search-as-you-type functionality
- **File Uploads**: Drag-and-drop file upload components

#### **Form State Management**
- **Optimistic Updates**: UI updates immediately, syncs with server
- **Dirty State Tracking**: Warns users about unsaved changes
- **Form Reset**: Clean form state after successful submissions
- **Loading States**: Visual feedback during form submission

#### **Advanced Form Components**
- **Multi-Step Forms**: Wizard-style forms with progress indicators
- **Bulk Operations**: Forms for batch operations on multiple items
- **Rich Text Editors**: For notes and descriptions
- **Date/Time Pickers**: Accessible date and time selection

--- 

## 🏗️ Dashboard Architecture & Routing

### **Next.js App Router Structure**

The application uses Next.js 14 App Router for file-based routing with role-based dashboard separation:

```text
app/
├── page.tsx                     # Login/Landing page
├── layout.tsx                   # Root layout with global providers
├── globals.css                  # Global styles and CSS variables
├── admin-dashboard/             # Admin role routes
│   ├── page.tsx                # Admin analytics dashboard
│   ├── users/page.tsx          # User management
│   ├── phones/page.tsx         # Phone inventory
│   ├── sim-cards/page.tsx      # SIM card management
│   ├── attributions/page.tsx   # Assignment management
│   ├── calendar/page.tsx       # Event scheduling
│   ├── settings/page.tsx       # System settings
│   └── profile/page.tsx        # Admin profile
├── assigner-dashboard/          # Assigner role routes
│   ├── page.tsx                # Assignment board (Kanban)
│   ├── users/page.tsx          # User overview
│   ├── phones/page.tsx         # Phone management
│   ├── sim-assignments/page.tsx # SIM assignments
│   ├── attributions/page.tsx   # Attribution management
│   ├── calendar/page.tsx       # Planning calendar
│   └── profile/page.tsx        # Assigner profile
└── user-dashboard/              # User role routes
    ├── page.tsx                # Personal dashboard
    ├── my-phone/page.tsx       # Personal device info
    ├── requests/page.tsx       # Support requests
    ├── settings/page.tsx       # User preferences
    └── profile/page.tsx        # User profile
```

### **Role-Based Dashboard Features**

#### **Admin Dashboard**
- **System Analytics**: Comprehensive KPI overview with charts and metrics
- **User Management**: Complete CRUD operations for all users
- **Device Inventory**: Full phone and SIM card management
- **Assignment Oversight**: View and manage all device assignments
- **System Configuration**: Access to system settings and preferences
- **Audit Trails**: Complete system audit logs and compliance reports

```typescript
// Admin Dashboard Implementation
export default function AdminDashboard() {
  useEffect(() => {
    // Role-based authentication check
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const userRole = localStorage.getItem("userRole")

    if (!isAuthenticated || userRole !== "admin") {
      window.location.href = "/"
      return
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar activeItem="analytics" onLogout={handleLogout} />
      <div className="flex-1 ml-64">
        {/* Analytics content */}
      </div>
    </div>
  )
}
```

#### **Assigner Dashboard**
- **Assignment Board**: Kanban-style board for managing device assignments
- **Device Assignment**: Streamlined workflows for phone/SIM assignments
- **User Overview**: View users and their current assignments
- **Assignment History**: Track assignment changes and audit trails
- **Planning Calendar**: Schedule assignments and maintenance

#### **User Dashboard**
- **Personal Overview**: View own device assignments and status
- **Device Information**: Detailed info about assigned phone and SIM
- **Request Management**: Submit and track support requests
- **Profile Settings**: Manage personal information and preferences

### **Authentication & Route Protection**

#### **Client-Side Route Guards**
Every dashboard page includes authentication checks:

```typescript
useEffect(() => {
  const isAuthenticated = localStorage.getItem("isAuthenticated")
  const userRole = localStorage.getItem("userRole")
  
  // Role-specific access control
  if (!isAuthenticated || userRole !== expectedRole) {
    window.location.href = "/"
    return
  }
}, [])
```

#### **Dynamic Navigation**
Sidebar navigation adapts based on user role:

```typescript
const getMenuItems = () => {
  switch (userRole) {
    case "admin":
      return [
        { id: "analytics", label: "Analytics", href: "/admin-dashboard" },
        { id: "users", label: "Utilisateurs", href: "/admin-dashboard/users" },
        // ... admin items
      ]
    case "assigner":
      return [
        { id: "board", label: "Board", href: "/assigner-dashboard" },
        { id: "attributions", label: "Attributions", href: "/assigner-dashboard/attributions" },
        // ... assigner items
      ]
    default:
      return [
        { id: "dashboard", label: "Dashboard", href: "/user-dashboard" },
        { id: "my-phone", label: "Mon Téléphone", href: "/user-dashboard/my-phone" },
        // ... user items
      ]
  }
}
```

---

## 🔄 State Management & Data Flow

### **Local State Management**

#### **Component State with useState**
Individual components manage their own state for UI interactions:

```typescript
// Phone Modal State Management
export function PhoneModal({ isOpen, onClose, onSave, phone }: PhoneModalProps) {
  const [formData, setFormData] = useState<FormData>({
    model: "", brand: "", imei: "", status: "AVAILABLE"
  })
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
}
```

#### **Authentication State**
User authentication and session data stored in localStorage:

```typescript
// Authentication data storage
localStorage.setItem("jwt_token", token)
localStorage.setItem("userRole", user.role.toLowerCase())
localStorage.setItem("userId", user.id.toString())
localStorage.setItem("userName", user.name)
localStorage.setItem("userEmail", user.email)
localStorage.setItem("userDepartment", user.department)
localStorage.setItem("isAuthenticated", "true")
```

### **Data Fetching Patterns**

#### **API Integration with useEffect**
Components fetch data on mount and when dependencies change:

```typescript
// Dashboard data fetching
useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("jwt_token")
      const dashboardApi = new DashboardReportingApi(getApiConfig(token))
      
      const [overviewRes, phoneStatsRes, simStatsRes] = await Promise.all([
        dashboardApi.getDashboardOverview(),
        dashboardApi.getPhoneStats(),
        dashboardApi.getSimCardStats()
      ])
      
      setOverviewData(overviewRes.data)
      setPhoneStats(phoneStatsRes.data)
      setSimStats(simStatsRes.data)
    } catch (error) {
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }
  
  fetchDashboardData()
}, [])
```

#### **Optimistic Updates**
UI updates immediately while syncing with server:

```typescript
const handleAssignPhone = async (phoneId: string, userId: string) => {
  // Optimistic update
  setPhones(prev => prev.map(phone => 
    phone.id === phoneId 
      ? { ...phone, status: "ASSIGNED", assignedTo: userId }
      : phone
  ))
  
  try {
    // Sync with server
    await phoneApi.assignPhone(phoneId, userId)
    toast({ title: "Phone assigned successfully" })
  } catch (error) {
    // Revert on error
    setPhones(prev => prev.map(phone => 
      phone.id === phoneId 
        ? { ...phone, status: "AVAILABLE", assignedTo: null }
        : phone
    ))
    toast({ title: "Failed to assign phone", variant: "destructive" })
  }
}
```

### **Error Handling Strategy**

#### **Global Error Handling**
Consistent error handling across all API calls:

```typescript
const handleApiError = (error: any) => {
  let errorMessage = "An unexpected error occurred"
  
  if (error.response?.data?.message) {
    errorMessage = error.response.data.message
  } else if (error.response?.status === 401) {
    // Handle unauthorized - redirect to login
    localStorage.clear()
    window.location.href = "/"
    return
  } else if (error.response?.status === 403) {
    errorMessage = "Access denied"
  }
  
  toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive"
  })
}
```

#### **Loading States**
Visual feedback during data operations:

```typescript
// Loading state management
const [loading, setLoading] = useState(false)

const handleSubmit = async () => {
  setLoading(true)
  try {
    await apiCall()
  } finally {
    setLoading(false)
  }
}

// UI with loading state
return (
  <Button disabled={loading}>
    {loading ? <Spinner /> : "Save"}
  </Button>
)
```

### **Data Synchronization**

#### **Real-Time Updates**
Components refresh data after mutations:

```typescript
const handleCreateUser = async (userData: UserData) => {
  try {
    await userApi.createUser(userData)
    // Refresh user list
    await fetchUsers()
    toast({ title: "User created successfully" })
  } catch (error) {
    handleApiError(error)
  }
}
```

#### **Cache Invalidation**
Smart cache management to ensure data consistency:

```typescript
// Invalidate related data after operations
const handleAssignDevice = async (assignment: AssignmentData) => {
  await assignmentApi.createAssignment(assignment)
  
  // Refresh multiple related data sources
  await Promise.all([
    fetchAssignments(),
    fetchAvailableDevices(),
    fetchUserAssignments(),
    fetchDashboardStats()
  ])
}
```

--- 

## ⚡ Performance & Optimization

### **Next.js Optimizations**

#### **App Router Benefits**
- **Server Components**: Reduced client-side JavaScript bundle size
- **Automatic Code Splitting**: Pages and components loaded on demand
- **Image Optimization**: Next.js Image component with automatic optimization
- **Font Optimization**: Google Fonts with zero layout shift

#### **Bundle Optimization**
```typescript
// next.config.mjs
const nextConfig = {
  // Disable ESLint and TypeScript checks during build for faster builds
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  
  // Optimize images
  images: { unoptimized: true },
  
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  }
}
```

#### **Component Optimization**
- **React.memo**: Prevent unnecessary re-renders of expensive components
- **useMemo & useCallback**: Optimize expensive calculations and function references
- **Lazy Loading**: Dynamic imports for heavy components
- **Virtual Scrolling**: For large data lists and tables

### **API Performance**

#### **Request Optimization**
- **Parallel Requests**: Use Promise.all for independent API calls
- **Request Deduplication**: Prevent duplicate API calls
- **Optimistic Updates**: Immediate UI feedback
- **Error Boundaries**: Graceful error handling without app crashes

```typescript
// Parallel API requests for dashboard
const fetchDashboardData = async () => {
  const [overview, phoneStats, simStats, users] = await Promise.all([
    dashboardApi.getDashboardOverview(),
    dashboardApi.getPhoneStats(),
    dashboardApi.getSimCardStats(),
    userApi.getUsers(1, 10)
  ])
  
  return { overview, phoneStats, simStats, users }
}
```

#### **Caching Strategy**
- **Browser Caching**: Leverage HTTP caching headers from backend
- **Memory Caching**: Cache frequently accessed data in component state
- **Local Storage**: Persist user preferences and session data
- **SWR Pattern**: Stale-while-revalidate for better UX

### **UI Performance**

#### **Rendering Optimizations**
- **Skeleton Loading**: Immediate visual feedback during data loading
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Responsive Images**: Optimized images for different screen sizes
- **CSS Optimization**: Purged unused CSS with Tailwind

#### **Animation Performance**
- **CSS Transforms**: Use transform and opacity for smooth animations
- **Reduced Motion**: Respect user's motion preferences
- **GPU Acceleration**: Leverage hardware acceleration for smooth animations

---

## 🛠️ Development Workflow

### **Development Setup**

#### **Prerequisites**
```bash
# Node.js and package manager
node --version  # v18+
npm --version   # or yarn/pnpm

# Backend dependency
# Ensure TelephoneManager Backend is running on http://localhost:8080
```

#### **Environment Configuration**
```bash
# Clone and setup
git clone <repository-url>
cd dashboard_pma

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

#### **Development Scripts**
```json
{
  "scripts": {
    "dev": "next dev",           // Development server with hot reload
    "build": "next build",       // Production build
    "start": "next start",       // Start production server
    "lint": "next lint",         // ESLint checking
    "type-check": "tsc --noEmit" // TypeScript type checking
  }
}
```

### **Code Quality & Standards**

#### **TypeScript Configuration**
- **Strict Mode**: Full type safety enabled
- **Path Mapping**: Clean imports with `@/*` aliases
- **Type Checking**: Comprehensive type validation
- **Interface Definitions**: Strongly typed API responses

#### **ESLint & Formatting**
```json
// .eslintrc.json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "prefer-const": "error",
    "no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

#### **Component Structure**
```typescript
// Standard component structure
"use client"  // Client component directive

import type React from "react"
import { useState, useEffect } from "react"
import { ComponentApi } from "@/api/generated"
import { getApiConfig } from "@/lib/apiClient"

interface ComponentProps {
  // Strongly typed props
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // State management
  const [state, setState] = useState<StateType>()
  
  // Effects
  useEffect(() => {
    // Side effects
  }, [dependencies])
  
  // Event handlers
  const handleEvent = async () => {
    // Event handling logic
  }
  
  // Render
  return (
    // JSX with proper TypeScript types
  )
}
```

### **API Integration Workflow**

#### **OpenAPI Code Generation**
```bash
# Generate API client from backend OpenAPI spec
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:8080/api/v3/api-docs \
  -g typescript-axios \
  -o src/api/generated
```

#### **API Client Usage Pattern**
```typescript
// 1. Import generated API
import { UserManagementApi } from "@/api/generated"
import { getApiConfig } from "@/lib/apiClient"

// 2. Create API instance with auth
const token = localStorage.getItem("jwt_token")
const userApi = new UserManagementApi(getApiConfig(token))

// 3. Make API calls with error handling
try {
  const response = await userApi.getUsers(page, limit)
  setUsers(response.data.content)
} catch (error) {
  handleApiError(error)
}
```

---

## 🚀 Deployment & Production

### **Build Process**

#### **Production Build**
```bash
# Create optimized production build
npm run build

# Start production server
npm start

# Build outputs
.next/static/          # Static assets
.next/server/          # Server-side code
.next/standalone/      # Standalone deployment files
```

#### **Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.telephonemanager.com
NEXT_PUBLIC_APP_ENV=production
```

### **Docker Deployment**

#### **Dockerfile**
```dockerfile
FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build application
COPY . .
RUN npm run build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy built application
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

#### **Docker Compose**
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8080/api
    depends_on:
      - backend
      
  backend:
    image: telephonemanager-backend:latest
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=database
      - JWT_SECRET=${JWT_SECRET}
```

### **Performance Monitoring**

#### **Web Vitals**
- **Core Web Vitals**: LCP, FID, CLS monitoring
- **Performance Budgets**: Bundle size limits
- **Lighthouse Audits**: Regular performance audits
- **Real User Monitoring**: Track actual user performance

#### **Error Tracking**
- **Error Boundaries**: Catch and handle React errors
- **API Error Logging**: Comprehensive error logging
- **User Feedback**: Error reporting mechanisms
- **Performance Monitoring**: Track slow operations

---

## 🎯 Conclusion

The **TelephoneManager Frontend** represents a modern, scalable React application built with industry best practices and cutting-edge technologies. This comprehensive system provides:

### **🏆 Key Achievements**

✅ **Modern Architecture**: Next.js 14 with App Router, TypeScript, and Tailwind CSS  
✅ **Type Safety**: Full TypeScript coverage with auto-generated API clients  
✅ **Role-Based Access**: Sophisticated RBAC with dynamic navigation and permissions  
✅ **API Integration**: Seamless backend synchronization with OpenAPI code generation  
✅ **User Experience**: Intuitive, accessible UI with responsive design  
✅ **Performance**: Optimized for speed with smart caching and loading strategies  
✅ **Developer Experience**: Comprehensive tooling with hot reload and type checking  

### **🚀 Technical Excellence**

- **Component Architecture**: 50+ reusable components with Radix UI foundation
- **Data Visualization**: Professional charts with Recharts and ECharts
- **Form Management**: Robust form handling with React Hook Form and Zod validation
- **State Management**: Efficient local state with optimistic updates
- **Authentication**: Secure JWT-based auth with automatic token management
- **Error Handling**: Comprehensive error boundaries and user feedback

### **📊 Business Value**

- **Productivity**: Streamlined workflows for device and user management
- **Efficiency**: Real-time synchronization reduces manual data entry
- **Scalability**: Modular architecture supports growing organizations
- **Accessibility**: WCAG-compliant components ensure inclusive design
- **Maintainability**: Clean code structure with comprehensive documentation

### **🔮 Future-Ready**

Built with modern standards and extensible architecture, the frontend is prepared for:
- **Mobile Apps**: React Native integration possibilities
- **Progressive Web App**: Service worker implementation ready
- **Real-Time Features**: WebSocket integration for live updates
- **Advanced Analytics**: Enhanced reporting and dashboard capabilities
- **Microservices**: Ready for backend service decomposition

> *The TelephoneManager Frontend showcases how modern web technologies can create powerful, user-friendly enterprise applications that scale with business needs while maintaining exceptional user experience and developer productivity.*

---

## 📚 Additional Resources

- **[Next.js Documentation](https://nextjs.org/docs)** - Framework documentation
- **[Tailwind CSS](https://tailwindcss.com/docs)** - Styling framework
- **[Radix UI](https://www.radix-ui.com/)** - Component primitives
- **[React Hook Form](https://react-hook-form.com/)** - Form management
- **[Recharts](https://recharts.org/)** - Chart library
- **[TypeScript](https://www.typescriptlang.org/docs/)** - Type system

---

**License**: MIT License  
**Version**: 1.0.0  
**Last Updated**: December 2024

--- 