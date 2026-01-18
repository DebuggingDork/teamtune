# Attendance & Leave Notifications - Frontend Integration Guide

**Date:** 2026-01-18  
**API Base URL:** `https://upea.onrender.com/api`  
**Status:** ✅ Ready for Integration

---

## 📋 Overview

This guide provides everything the frontend team needs to integrate the new attendance and leave notification system. Six new notification types have been added to keep employees and team leads informed about leave requests and attendance issues.

---

## 🆕 New Notification Types

### For Employees

| Type | Priority | Description | Has Email | Action URL |
|------|----------|-------------|-----------|------------|
| `leave_approved` | High | Your leave was approved | ✅ Yes | `/employee/leave/requests/{code}` |
| `leave_rejected` | High | Your leave was rejected | ✅ Yes | `/employee/leave/requests/{code}` |

### For Team Leads

| Type | Priority | Description | Has Email | Action URL |
|------|----------|-------------|-----------|------------|
| `leave_requested` | High | Employee submitted leave request | ❌ No | `/team-lead/leave/requests/pending` |
| `leave_cancelled` | Medium | Employee cancelled leave request | ❌ No | `/team-lead/leave/requests` |
| `late_arrival` | Medium | Employee arrived late | ❌ No | `/team-lead/attendance` |
| `absent_without_leave` | Urgent | Employee absent without approved leave | ❌ No | `/team-lead/attendance` |

---

## 🎨 UI Design Guidelines

### Priority Colors

```javascript
const PRIORITY_COLORS = {
  urgent: {
    bg: 'bg-red-100',
    border: 'border-red-500',
    text: 'text-red-800',
    icon: 'text-red-600'
  },
  high: {
    bg: 'bg-orange-100',
    border: 'border-orange-500',
    text: 'text-orange-800',
    icon: 'text-orange-600'
  },
  medium: {
    bg: 'bg-blue-100',
    border: 'border-blue-500',
    text: 'text-blue-800',
    icon: 'text-blue-600'
  },
  low: {
    bg: 'bg-gray-100',
    border: 'border-gray-500',
    text: 'text-gray-800',
    icon: 'text-gray-600'
  }
};
```

### Notification Icons

```javascript
const NOTIFICATION_ICONS = {
  leave_requested: '📝',      // or CalendarIcon
  leave_approved: '✅',        // or CheckCircleIcon
  leave_rejected: '❌',        // or XCircleIcon
  leave_cancelled: '🚫',      // or BanIcon
  late_arrival: '⏰',         // or ClockIcon
  absent_without_leave: '⚠️'  // or ExclamationTriangleIcon
};
```

---

## 📡 API Integration

### 1. Fetch Notifications (Existing Endpoint - No Changes)

```javascript
GET /api/{role}/notifications
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `is_read` (optional): Filter by read status (true/false)
- `category` (optional): Filter by category - use `'attendance'` for leave/attendance notifications
- `type` (optional): Filter by specific type (e.g., 'leave_requested')

**Example Request:**
```javascript
const response = await fetch(
  'https://upea.onrender.com/api/employee/notifications?category=attendance&is_read=false',
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);

const data = await response.json();
```

**Response Structure:**
```json
{
  "notifications": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "leave_approved",
      "priority": "high",
      "title": "Leave Approved",
      "message": "Your Vacation Leave request from 2026-02-01 to 2026-02-05 has been approved by Jane Smith",
      "action_url": "/employee/leave/requests/LR00000001",
      "actor": {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "full_name": "Jane Smith",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "is_read": false,
      "read_at": null,
      "created_at": "2026-01-18T11:00:00Z",
      "metadata": {
        "request_code": "LR00000001",
        "leave_type": "Vacation Leave",
        "start_date": "2026-02-01",
        "end_date": "2026-02-05",
        "approver_name": "Jane Smith"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "total_pages": 1
  },
  "summary": {
    "total_unread": 3,
    "by_priority": {
      "urgent": 0,
      "high": 2,
      "medium": 1,
      "low": 0
    }
  }
}
```

---

### 2. Get Unread Count (Existing Endpoint - Enhanced)

```javascript
GET /api/{role}/notifications/unread-count
```

**Example Request:**
```javascript
const response = await fetch(
  'https://upea.onrender.com/api/employee/notifications/unread-count',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const data = await response.json();
```

**Response Structure:**
```json
{
  "unread_count": 12,
  "by_priority": {
    "urgent": 1,
    "high": 5,
    "medium": 4,
    "low": 2
  },
  "by_category": {
    "task": 4,
    "github": 3,
    "attendance": 5
  }
}
```

**Note:** The `by_category.attendance` field now includes all leave and attendance notifications.

---

### 3. Mark as Read (Existing Endpoint - No Changes)

```javascript
PUT /api/{role}/notifications/{notificationId}/read
```

**Example Request:**
```javascript
const response = await fetch(
  `https://upea.onrender.com/api/employee/notifications/${notificationId}/read`,
  {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const data = await response.json();
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "is_read": true,
  "read_at": "2026-01-18T12:00:00Z"
}
```

---

## 📦 Notification Object Details

### Common Fields (All Notifications)

```typescript
interface Notification {
  id: string;                    // UUID
  type: NotificationType;        // See types below
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;                 // Display title
  message: string;               // Full message text
  action_url: string | null;     // Where to navigate on click
  actor: {                       // Who triggered this notification
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
  is_read: boolean;
  read_at: string | null;        // ISO 8601 timestamp
  created_at: string;            // ISO 8601 timestamp
  metadata: Record<string, any>; // Type-specific data
}
```

---

## 🎯 Notification Type Details

### 1. Leave Requested (Team Lead)

**Type:** `leave_requested`  
**Priority:** `high`  
**Recipient:** Team Lead

**Example:**
```json
{
  "id": "uuid",
  "type": "leave_requested",
  "priority": "high",
  "title": "Leave Request: John Doe",
  "message": "John Doe has requested Vacation Leave from 2026-02-01 to 2026-02-05 (3 days)",
  "action_url": "/team-lead/leave/requests/pending",
  "actor": {
    "id": "uuid",
    "full_name": "John Doe",
    "avatar_url": null
  },
  "is_read": false,
  "read_at": null,
  "created_at": "2026-01-18T10:30:00Z",
  "metadata": {
    "request_code": "LR00000001",
    "employee_name": "John Doe",
    "leave_type": "Vacation Leave",
    "start_date": "2026-02-01",
    "end_date": "2026-02-05",
    "total_days": 3
  }
}
```

**UI Suggestions:**
- Show employee avatar
- Display leave type with color badge
- Show date range prominently
- Add "Review" button linking to pending requests

---

### 2. Leave Approved (Employee)

**Type:** `leave_approved`  
**Priority:** `high`  
**Recipient:** Employee  
**Email:** ✅ Yes

**Example:**
```json
{
  "id": "uuid",
  "type": "leave_approved",
  "priority": "high",
  "title": "Leave Approved",
  "message": "Your Vacation Leave request from 2026-02-01 to 2026-02-05 has been approved by Jane Smith",
  "action_url": "/employee/leave/requests/LR00000001",
  "actor": {
    "id": "uuid",
    "full_name": "Jane Smith",
    "avatar_url": null
  },
  "is_read": false,
  "read_at": null,
  "created_at": "2026-01-18T11:00:00Z",
  "metadata": {
    "request_code": "LR00000001",
    "leave_type": "Vacation Leave",
    "start_date": "2026-02-01",
    "end_date": "2026-02-05",
    "approver_name": "Jane Smith"
  }
}
```

**UI Suggestions:**
- Use green/success color scheme
- Show checkmark icon
- Display approver name and avatar
- Add "View Details" button

---

### 3. Leave Rejected (Employee)

**Type:** `leave_rejected`  
**Priority:** `high`  
**Recipient:** Employee  
**Email:** ✅ Yes

**Example:**
```json
{
  "id": "uuid",
  "type": "leave_rejected",
  "priority": "high",
  "title": "Leave Request Rejected",
  "message": "Your Vacation Leave request has been rejected. Reason: Project deadline conflicts with requested dates",
  "action_url": "/employee/leave/requests/LR00000001",
  "actor": {
    "id": "uuid",
    "full_name": "Jane Smith",
    "avatar_url": null
  },
  "is_read": false,
  "read_at": null,
  "created_at": "2026-01-18T11:00:00Z",
  "metadata": {
    "request_code": "LR00000001",
    "leave_type": "Vacation Leave",
    "rejection_reason": "Project deadline conflicts with requested dates"
  }
}
```

**UI Suggestions:**
- Use red/warning color scheme
- Show X icon
- Display rejection reason prominently
- Add "View Details" button
- Consider showing "Request Again" option

---

### 4. Leave Cancelled (Team Lead)

**Type:** `leave_cancelled`  
**Priority:** `medium`  
**Recipient:** Team Lead

**Example:**
```json
{
  "id": "uuid",
  "type": "leave_cancelled",
  "priority": "medium",
  "title": "Leave Request Cancelled",
  "message": "John Doe has cancelled their Vacation Leave request for 2026-02-01 to 2026-02-05",
  "action_url": "/team-lead/leave/requests",
  "actor": {
    "id": "uuid",
    "full_name": "John Doe",
    "avatar_url": null
  },
  "is_read": false,
  "read_at": null,
  "created_at": "2026-01-18T12:00:00Z",
  "metadata": {
    "request_code": "LR00000001",
    "employee_name": "John Doe",
    "leave_type": "Vacation Leave",
    "start_date": "2026-02-01",
    "end_date": "2026-02-05"
  }
}
```

**UI Suggestions:**
- Use neutral/info color scheme
- Show ban/cancel icon
- Display employee name and dates
- Add "View All Requests" button

---

### 5. Late Arrival (Team Lead)

**Type:** `late_arrival`  
**Priority:** `medium`  
**Recipient:** Team Lead

**Example:**
```json
{
  "id": "uuid",
  "type": "late_arrival",
  "priority": "medium",
  "title": "Late Arrival: John Doe",
  "message": "John Doe arrived 25 minutes late on 2026-01-18 (Check-in: 09:25 AM)",
  "action_url": "/team-lead/attendance",
  "actor": {
    "id": "uuid",
    "full_name": "John Doe",
    "avatar_url": null
  },
  "is_read": false,
  "read_at": null,
  "created_at": "2026-01-18T09:25:00Z",
  "metadata": {
    "employee_name": "John Doe",
    "date": "2026-01-18",
    "late_minutes": 25,
    "check_in_time": "09:25 AM"
  }
}
```

**UI Suggestions:**
- Use blue/info color scheme
- Show clock icon
- Display late minutes prominently
- Add "View Attendance" button

---

### 6. Absent Without Leave (Team Lead)

**Type:** `absent_without_leave`  
**Priority:** `urgent`  
**Recipient:** Team Lead

**Example:**
```json
{
  "id": "uuid",
  "type": "absent_without_leave",
  "priority": "urgent",
  "title": "Absent Without Leave: John Doe",
  "message": "John Doe is marked absent on 2026-01-18 with no approved leave",
  "action_url": "/team-lead/attendance",
  "actor": {
    "id": "uuid",
    "full_name": "John Doe",
    "avatar_url": null
  },
  "is_read": false,
  "read_at": null,
  "created_at": "2026-01-18T12:00:00Z",
  "metadata": {
    "employee_name": "John Doe",
    "date": "2026-01-18"
  }
}
```

**UI Suggestions:**
- Use red/urgent color scheme
- Show warning/alert icon
- Make it stand out (bold, larger)
- Add "View Attendance" button
- Consider adding "Contact Employee" action

---

## 💻 Implementation Examples

### React Component Example

```typescript
import React, { useEffect, useState } from 'react';
import { Bell, Calendar, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  action_url: string | null;
  actor: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
  is_read: boolean;
  created_at: string;
  metadata: Record<string, any>;
}

const NotificationIcon = ({ type }: { type: string }) => {
  const icons = {
    leave_requested: <Calendar className="w-5 h-5" />,
    leave_approved: <CheckCircle className="w-5 h-5 text-green-600" />,
    leave_rejected: <XCircle className="w-5 h-5 text-red-600" />,
    leave_cancelled: <XCircle className="w-5 h-5" />,
    late_arrival: <Clock className="w-5 h-5" />,
    absent_without_leave: <AlertTriangle className="w-5 h-5 text-red-600" />
  };
  
  return icons[type] || <Bell className="w-5 h-5" />;
};

const NotificationItem = ({ 
  notification, 
  onRead, 
  onNavigate 
}: { 
  notification: Notification;
  onRead: (id: string) => void;
  onNavigate: (url: string) => void;
}) => {
  const priorityColors = {
    urgent: 'bg-red-100 border-red-500',
    high: 'bg-orange-100 border-orange-500',
    medium: 'bg-blue-100 border-blue-500',
    low: 'bg-gray-100 border-gray-500'
  };

  const handleClick = () => {
    if (!notification.is_read) {
      onRead(notification.id);
    }
    if (notification.action_url) {
      onNavigate(notification.action_url);
    }
  };

  return (
    <div
      className={`p-4 border-l-4 ${priorityColors[notification.priority]} ${
        !notification.is_read ? 'bg-opacity-100' : 'bg-opacity-50'
      } cursor-pointer hover:shadow-md transition-shadow`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <NotificationIcon type={notification.type} />
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className={`font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
              {notification.title}
            </h4>
            <span className="text-xs text-gray-500">
              {formatTimeAgo(notification.created_at)}
            </span>
          </div>
          
          <p className="text-sm text-gray-700 mt-1">
            {notification.message}
          </p>
          
          {notification.actor && (
            <div className="flex items-center gap-2 mt-2">
              {notification.actor.avatar_url ? (
                <img
                  src={notification.actor.avatar_url}
                  alt={notification.actor.full_name}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                  {notification.actor.full_name.charAt(0)}
                </div>
              )}
              <span className="text-xs text-gray-600">
                {notification.actor.full_name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NotificationList = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        'https://upea.onrender.com/api/employee/notifications?limit=20',
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.summary.total_unread);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(
        'https://upea.onrender.com/api/employee/notifications/unread-count',
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await response.json();
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(
        `https://upea.onrender.com/api/employee/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleNavigate = (url: string) => {
    // Use your router to navigate
    window.location.href = url;
  };

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Notifications</h2>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
            {unreadCount} unread
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRead={markAsRead}
            onNavigate={handleNavigate}
          />
        ))}
      </div>
    </div>
  );
};

// Helper function
function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default NotificationList;
```

---

## 🔔 Notification Badge Component

```typescript
import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

const NotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [attendanceCount, setAttendanceCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(
        'https://upea.onrender.com/api/employee/notifications/unread-count',
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await response.json();
      setUnreadCount(data.unread_count);
      setAttendanceCount(data.by_category.attendance || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  return (
    <button className="relative p-2 hover:bg-gray-100 rounded-full">
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      {attendanceCount > 0 && (
        <span className="absolute bottom-0 right-0 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
          {attendanceCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBadge;
```

---

## 🎯 Filter by Category Example

```typescript
const AttendanceNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchAttendanceNotifications();
  }, []);

  const fetchAttendanceNotifications = async () => {
    try {
      const response = await fetch(
        'https://upea.onrender.com/api/employee/notifications?category=attendance&limit=50',
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await response.json();
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Failed to fetch attendance notifications:', error);
    }
  };

  return (
    <div>
      <h2>Attendance & Leave Notifications</h2>
      {/* Render notifications */}
    </div>
  );
};
```

---

## 📱 Mobile Considerations

### Reduce Polling Frequency
```javascript
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const pollInterval = isMobile ? 60000 : 30000; // 60s for mobile, 30s for desktop
```

### Pause When App in Background
```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearInterval(pollTimer);
  } else {
    startPolling();
  }
});
```

---

## ✅ Testing Checklist

### Notification Display
- [ ] All 6 notification types render correctly
- [ ] Priority colors display properly
- [ ] Icons show for each type
- [ ] Actor avatars display (or initials if no avatar)
- [ ] Timestamps format correctly
- [ ] Unread notifications are visually distinct

### Functionality
- [ ] Clicking notification marks it as read
- [ ] Action URLs navigate to correct pages
- [ ] Badge count updates in real-time
- [ ] Category filter works (attendance)
- [ ] Polling updates badge without page refresh
- [ ] Mark all as read works

### Edge Cases
- [ ] Handle empty notification list
- [ ] Handle API errors gracefully
- [ ] Handle expired tokens
- [ ] Handle slow network
- [ ] Handle 99+ notifications

---

## 🐛 Common Issues & Solutions

### Issue: Notifications not appearing
**Solution:** Check if notification orchestrator is initialized on backend

### Issue: Badge not updating
**Solution:** Verify polling interval is running and not paused

### Issue: Wrong action URL
**Solution:** Check role in URL path matches user role

### Issue: CORS errors
**Solution:** Verify `CORS_ORIGINS` includes your frontend URL

---

## 📞 Support

For questions or issues:
1. Check this documentation
2. Test endpoints with Postman/Thunder Client
3. Check browser console for errors
4. Verify authentication token is valid

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-18  
**Status:** ✅ Ready for Integration
