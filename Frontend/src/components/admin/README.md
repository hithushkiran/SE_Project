# Admin Moderation System

A comprehensive admin moderation system for the ResearchHub platform that provides administrators with powerful tools to manage users, papers, comments, and notifications.

## Features

### 🔐 Admin Authentication
- Role-based access control with ADMIN role
- Secure admin panel access
- Automatic redirect for non-admin users

### 📊 Admin Dashboard
- Real-time statistics overview
- Quick action buttons
- Visual indicators for pending items
- Responsive design

### 👥 User Management
- View all users with pagination
- Suspend/activate user accounts
- Delete user accounts
- User role management
- Detailed user information modal

### 📄 Paper Moderation
- Review pending paper submissions
- Approve/reject papers with reasons
- Filter papers by status
- Sort papers by various criteria
- Detailed paper review interface

### 💬 Comment Moderation
- Review all comments
- Approve/reject comments
- Filter by moderation status
- Comment content review
- Moderation reason tracking

### 🔔 Notification System
- Real-time notifications for admins
- User notification management
- Notification categorization
- Mark as read functionality

## Components

### Core Components

#### `AdminPanel.tsx`
Main admin panel container with sidebar navigation and content area.

#### `AdminDashboard.tsx`
Dashboard with statistics cards and quick actions.

#### `UserManagement.tsx`
User management interface with table view and actions.

#### `PaperModeration.tsx`
Paper moderation interface with review capabilities.

#### `CommentModeration.tsx`
Comment moderation interface with approval/rejection.

#### `NotificationCenter.tsx`
Notification management and viewing interface.

### Services

#### `adminService.ts`
Frontend service for admin API calls including:
- Dashboard statistics
- User management operations
- Paper moderation actions
- Comment moderation actions
- Notification management

#### `notificationService.ts`
Service for user notification management.

## Backend Integration

### New Models
- `PaperStatus` enum (PENDING, APPROVED, REJECTED)
- `CommentStatus` enum (APPROVED, REJECTED, PENDING_REVIEW)
- `Notification` entity with types and related entities
- Extended `Paper` and `Comment` models with moderation fields

### New Services
- `AdminService` - Core admin operations
- `NotificationService` - Notification management

### New Controllers
- `AdminController` - Admin API endpoints
- `NotificationController` - User notification endpoints

### Database Schema Updates
- Added moderation fields to papers and comments tables
- Created notifications table
- Added foreign key relationships

## API Endpoints

### Admin Endpoints
```
GET /api/admin/dashboard/stats - Dashboard statistics
GET /api/admin/users - Get all users (paginated)
GET /api/admin/users/{id} - Get user by ID
POST /api/admin/users/{id}/suspend - Suspend user
POST /api/admin/users/{id}/activate - Activate user
DELETE /api/admin/users/{id} - Delete user
GET /api/admin/papers - Get all papers (paginated)
GET /api/admin/papers/pending - Get pending papers
POST /api/admin/papers/{id}/approve - Approve paper
POST /api/admin/papers/{id}/reject - Reject paper
GET /api/admin/comments - Get all comments (paginated)
POST /api/admin/comments/{id}/approve - Approve comment
POST /api/admin/comments/{id}/reject - Reject comment
GET /api/admin/notifications - Get admin notifications
POST /api/admin/notifications/{id}/read - Mark notification as read
```

### User Notification Endpoints
```
GET /api/notifications - Get user notifications
GET /api/notifications/unread - Get unread notifications
GET /api/notifications/count - Get unread count
POST /api/notifications/{id}/read - Mark as read
POST /api/notifications/read-all - Mark all as read
DELETE /api/notifications/{id} - Delete notification
```

## Security Features

- Role-based access control
- Admin action logging
- Secure API endpoints
- Input validation
- CSRF protection

## Usage

### Accessing Admin Panel
1. Login with an admin account
2. Click on your profile dropdown
3. Select "Admin Panel"
4. Or navigate directly to `/admin`

### Managing Users
1. Go to Users tab
2. View user list with pagination
3. Click "View" to see user details
4. Use action buttons to suspend/activate/delete users

### Moderating Papers
1. Go to Papers tab
2. Filter by status (Pending/Approved/Rejected)
3. Click "Review" to see paper details
4. Approve or reject with reasons

### Moderating Comments
1. Go to Comments tab
2. Filter by moderation status
3. Click "Review" to see comment details
4. Approve or reject with reasons

### Managing Notifications
1. Go to Notifications tab
2. View all notifications
3. Mark as read individually or in bulk
4. Filter by notification type

## Styling

The admin panel uses a professional design with:
- Clean, modern interface
- Responsive layout
- Intuitive navigation
- Status indicators
- Action buttons with clear states
- Modal dialogs for detailed views

## Responsive Design

The admin panel is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

Mobile features:
- Collapsible sidebar
- Touch-friendly buttons
- Optimized table layouts
- Stacked navigation

## Future Enhancements

- Bulk operations for users/papers/comments
- Advanced filtering and search
- Export functionality
- Audit logs
- Email notifications
- Real-time updates with WebSockets
- Advanced analytics and reporting
