# What Was Added for Attendance & Leave Notifications

**Date:** 2026-01-18  
**For:** Frontend Integration Team

---

## 🎯 Quick Summary

We added **6 new notification types** to the existing notification system for attendance and leave management. **No new endpoints were created** - all existing notification endpoints now support these new types.

---

## 🆕 New Notification Types

### 1. `leave_requested`
- **Who gets it:** Team Lead
- **When:** Employee submits a leave request
- **Priority:** High
- **Email:** No
- **Navigate to:** `/team-lead/leave/requests/pending`

### 2. `leave_approved`
- **Who gets it:** Employee
- **When:** Team lead approves their leave request
- **Priority:** High
- **Email:** Yes ✉️
- **Navigate to:** `/employee/leave/requests/{REQUEST_CODE}`

### 3. `leave_rejected`
- **Who gets it:** Employee
- **When:** Team lead rejects their leave request
- **Priority:** High
- **Email:** Yes ✉️
- **Navigate to:** `/employee/leave/requests/{REQUEST_CODE}`

### 4. `leave_cancelled`
- **Who gets it:** Team Lead
- **When:** Employee cancels their pending leave request
- **Priority:** Medium
- **Email:** No
- **Navigate to:** `/team-lead/leave/requests`

### 5. `late_arrival`
- **Who gets it:** Team Lead
- **When:** Employee checks in late
- **Priority:** Medium
- **Email:** No
- **Navigate to:** `/team-lead/attendance`

### 6. `absent_without_leave`
- **Who gets it:** Team Lead
- **When:** Employee is absent without approved leave
- **Priority:** Urgent ⚠️
- **Email:** No
- **Navigate to:** `/team-lead/attendance`

---

## 📡 API Changes

### ✅ No New Endpoints!

All existing notification endpoints work with the new types:

```
GET  /api/{role}/notifications
GET  /api/{role}/notifications/unread-count
PUT  /api/{role}/notifications/{id}/read
PUT  /api/{role}/notifications/read-all
DELETE /api/{role}/notifications/{id}
```

### ✨ Enhanced Response

The `unread-count` endpoint now includes attendance category:

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
    "attendance": 5  // ← NEW!
  }
}
```

---

## 📦 Notification Object Structure

### Common Fields (Same as Before)
```typescript
{
  id: string;
  type: string;              // One of the 6 new types
  priority: string;          // 'urgent' | 'high' | 'medium' | 'low'
  title: string;
  message: string;
  action_url: string | null;
  actor: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  metadata: object;          // Type-specific data
}
```

### Metadata by Type

**leave_requested:**
```json
{
  "request_code": "LR00000001",
  "employee_name": "John Doe",
  "leave_type": "Vacation Leave",
  "start_date": "2026-02-01",
  "end_date": "2026-02-05",
  "total_days": 3
}
```

**leave_approved:**
```json
{
  "request_code": "LR00000001",
  "leave_type": "Vacation Leave",
  "start_date": "2026-02-01",
  "end_date": "2026-02-05",
  "approver_name": "Jane Smith"
}
```

**leave_rejected:**
```json
{
  "request_code": "LR00000001",
  "leave_type": "Vacation Leave",
  "rejection_reason": "Project deadline conflicts"
}
```

**leave_cancelled:**
```json
{
  "request_code": "LR00000001",
  "employee_name": "John Doe",
  "leave_type": "Vacation Leave",
  "start_date": "2026-02-01",
  "end_date": "2026-02-05"
}
```

**late_arrival:**
```json
{
  "employee_name": "John Doe",
  "date": "2026-01-18",
  "late_minutes": 25,
  "check_in_time": "09:25 AM"
}
```

**absent_without_leave:**
```json
{
  "employee_name": "John Doe",
  "date": "2026-01-18"
}
```

---

## 🎨 UI Recommendations

### Priority Colors
```javascript
const colors = {
  urgent: 'bg-red-100 border-red-500',    // Absent without leave
  high: 'bg-orange-100 border-orange-500', // Leave requested/approved/rejected
  medium: 'bg-blue-100 border-blue-500',   // Leave cancelled, late arrival
  low: 'bg-gray-100 border-gray-500'
};
```

### Icons
```javascript
const icons = {
  leave_requested: '📝',      // or CalendarIcon
  leave_approved: '✅',        // or CheckCircleIcon
  leave_rejected: '❌',        // or XCircleIcon
  leave_cancelled: '🚫',      // or BanIcon
  late_arrival: '⏰',         // or ClockIcon
  absent_without_leave: '⚠️'  // or AlertTriangleIcon
};
```

---

## 💻 Code Examples

### Filter Attendance Notifications
```javascript
const response = await fetch(
  '/api/employee/notifications?category=attendance',
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
```

### Show Attendance Badge
```javascript
const { by_category } = await fetch('/api/employee/notifications/unread-count')
  .then(r => r.json());

if (by_category.attendance > 0) {
  showAttendanceBadge(by_category.attendance);
}
```

### Handle Notification Click
```javascript
function handleClick(notification) {
  // Mark as read
  if (!notification.is_read) {
    fetch(`/api/employee/notifications/${notification.id}/read`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
  
  // Navigate
  if (notification.action_url) {
    router.push(notification.action_url);
  }
}
```

---

## ✅ What You Need to Do

### 1. Update Notification Type Handling
Add the 6 new types to your notification type switch/if statements:
- `leave_requested`
- `leave_approved`
- `leave_rejected`
- `leave_cancelled`
- `late_arrival`
- `absent_without_leave`

### 2. Add Icons
Add icons for each new notification type in your icon mapping.

### 3. Add Colors
Ensure priority colors are applied correctly (especially `urgent` for absent_without_leave).

### 4. Test Navigation
Verify action URLs navigate to the correct pages:
- `/team-lead/leave/requests/pending`
- `/employee/leave/requests/{code}`
- `/team-lead/leave/requests`
- `/team-lead/attendance`

### 5. Show Attendance Badge (Optional)
Display a separate badge for attendance notifications using `by_category.attendance`.

---

## 📄 Full Documentation

For complete details, see:
- **`ATTENDANCE_LEAVE_NOTIFICATIONS_FRONTEND_GUIDE.md`** - Full integration guide with React examples
- **`ATTENDANCE_ENDPOINTS_QUICK_REFERENCE.md`** - All attendance/leave API endpoints
- **`NOTIFICATION_QUICK_REFERENCE.md`** - Updated with new notification types

---

## 🧪 Testing

### Test These Scenarios:
1. Employee submits leave → Team lead sees notification
2. Team lead approves leave → Employee sees notification + receives email
3. Team lead rejects leave → Employee sees notification + receives email
4. Employee cancels leave → Team lead sees notification
5. Employee arrives late → Team lead sees notification
6. Employee absent without leave → Team lead sees urgent notification

### Verify:
- [ ] Notifications appear in list
- [ ] Badge count updates
- [ ] Clicking marks as read
- [ ] Action URLs work
- [ ] Icons display correctly
- [ ] Priority colors show correctly
- [ ] Metadata displays properly

---

## 🚀 Ready to Integrate!

Everything is ready on the backend. Just:
1. Handle the 6 new notification types in your UI
2. Add appropriate icons and colors
3. Test the notification flow
4. Deploy!

**No backend changes needed. No new API endpoints. Just UI updates!** ✨

---

