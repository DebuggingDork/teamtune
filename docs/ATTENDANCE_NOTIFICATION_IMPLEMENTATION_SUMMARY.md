# Attendance & Leave Notification System - Implementation Summary

**Date:** 2026-01-18  
**Status:** ✅ Completed  
**Build Status:** ✅ Successful

---

## Overview

Successfully integrated the attendance and leave management system with the notification system to provide real-time alerts for leave requests, approvals, rejections, cancellations, and attendance issues.

---

## What Was Implemented

### 1. Event Types Updated ✅
**File:** `src/events/event-types.ts`

Added/Updated event types:
- `LeaveCancelledEvent` - New event for when employees cancel leave
- `LateArrivalEvent` - Enhanced with employee name and check-in time
- `AbsentWithoutLeaveEvent` - Enhanced with employee name

Updated event map to include:
- `leave.cancelled`
- All leave and attendance events properly typed

### 2. Notification Types Added ✅
**File:** `src/entities/user/models/notification.model.ts`

Added 6 new notification types:
- `leave_requested` - Team lead notified when employee submits leave
- `leave_approved` - Employee notified when leave is approved
- `leave_rejected` - Employee notified when leave is rejected
- `leave_cancelled` - Team lead notified when employee cancels leave
- `late_arrival` - Team lead notified of late arrivals
- `absent_without_leave` - Team lead notified of absences without leave

Added new category:
- `attendance` - For all attendance and leave notifications

Added new related entity types:
- `leave_request` - Links notification to leave request
- `attendance_record` - Links notification to attendance record

### 3. Notification Orchestrator Updated ✅
**File:** `src/services/notification/notification-orchestrator.ts`

Registered 6 new event handlers:
- `handleLeaveRequested()` - Creates notification for team lead
- `handleLeaveApproved()` - Creates notification + email for employee
- `handleLeaveRejected()` - Creates notification + email for employee
- `handleLeaveCancelled()` - Creates notification for team lead
- `handleLateArrival()` - Creates notification for team lead
- `handleAbsentWithoutLeave()` - Creates urgent notification for team lead

### 4. Leave Service Updated ✅
**File:** `src/services/attendance/leave.service.ts`

Enhanced `cancelRequest()` method to:
- Fetch user and team information
- Fetch leave type details
- Emit `leave.cancelled` event with complete data
- Notify team lead of cancellation

### 5. Documentation Updated ✅

**Created:**
- `docs/ATTENDANCE_NOTIFICATION_PLAN.md` - Comprehensive implementation plan
- `docs/ATTENDANCE_NOTIFICATION_IMPLEMENTATION_SUMMARY.md` - This document

**Updated:**
- `docs/ATTENDANCE_ENDPOINTS_QUICK_REFERENCE.md` - Added notifications section with:
  - Notification types table
  - JSON examples for each notification type
  - Frontend integration code samples
  - Email notification templates

---

## Notification Flow

### Leave Request Workflow

```
┌─────────────┐                    ┌──────────┐                    ┌────────────┐
│  Employee   │                    │  System  │                    │ Team Lead  │
└──────┬──────┘                    └────┬─────┘                    └─────┬──────┘
       │                                │                                 │
       │ 1. Submit Leave Request        │                                 │
       │───────────────────────────────>│                                 │
       │                                │                                 │
       │                                │ 2. Create Notification          │
       │                                │    (leave_requested)            │
       │                                │────────────────────────────────>│
       │                                │                                 │
       │                                │ 3. Approve/Reject               │
       │                                │<────────────────────────────────│
       │                                │                                 │
       │ 4. Create Notification         │                                 │
       │    (leave_approved/rejected)   │                                 │
       │    + Send Email                │                                 │
       │<───────────────────────────────│                                 │
       │                                │                                 │
```

### Leave Cancellation Workflow

```
┌─────────────┐                    ┌──────────┐                    ┌────────────┐
│  Employee   │                    │  System  │                    │ Team Lead  │
└──────┬──────┘                    └────┬─────┘                    └─────┬──────┘
       │                                │                                 │
       │ 1. Cancel Leave Request        │                                 │
       │───────────────────────────────>│                                 │
       │                                │                                 │
       │                                │ 2. Create Notification          │
       │                                │    (leave_cancelled)            │
       │                                │────────────────────────────────>│
       │                                │                                 │
```

### Attendance Alert Workflow

```
┌──────────┐                                              ┌────────────┐
│  System  │                                              │ Team Lead  │
└────┬─────┘                                              └─────┬──────┘
     │                                                           │
     │ 1. Detect Late Arrival                                   │
     │      (Employee checks in after grace period)             │
     │                                                           │
     │ 2. Create Notification (late_arrival)                    │
     │──────────────────────────────────────────────────────────>│
     │                                                           │
     │ 3. Detect Absent Without Leave                           │
     │      (No check-in by noon, no approved leave)            │
     │                                                           │
     │ 4. Create Notification (absent_without_leave)            │
     │──────────────────────────────────────────────────────────>│
     │                                                           │
```

---

## Notification Details

### 1. Leave Requested
- **Recipient:** Team Lead
- **Priority:** High
- **Email:** No
- **Action URL:** `/team-lead/leave/requests/pending`
- **Metadata:** request_code, employee_name, leave_type, dates, total_days

### 2. Leave Approved
- **Recipient:** Employee
- **Priority:** High
- **Email:** Yes ✉️
- **Action URL:** `/employee/leave/requests/{REQUEST_CODE}`
- **Metadata:** request_code, leave_type, dates, approver_name

### 3. Leave Rejected
- **Recipient:** Employee
- **Priority:** High
- **Email:** Yes ✉️
- **Action URL:** `/employee/leave/requests/{REQUEST_CODE}`
- **Metadata:** request_code, leave_type, rejection_reason

### 4. Leave Cancelled
- **Recipient:** Team Lead
- **Priority:** Medium
- **Email:** No
- **Action URL:** `/team-lead/leave/requests`
- **Metadata:** request_code, employee_name, leave_type, dates

### 5. Late Arrival
- **Recipient:** Team Lead
- **Priority:** Medium
- **Email:** No
- **Action URL:** `/team-lead/attendance`
- **Metadata:** employee_name, date, late_minutes, check_in_time

### 6. Absent Without Leave
- **Recipient:** Team Lead
- **Priority:** Urgent ⚠️
- **Email:** No
- **Action URL:** `/team-lead/attendance`
- **Metadata:** employee_name, date

---

## Frontend Integration Guide

### 1. Poll for Notifications
```javascript
// Poll every 30 seconds
setInterval(async () => {
  const res = await fetch('/api/employee/notifications/unread-count', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { unread_count, by_category } = await res.json();
  
  // Update badge
  updateBadge(unread_count);
  
  // Show attendance badge if any
  if (by_category.attendance > 0) {
    showAttendanceBadge(by_category.attendance);
  }
}, 30000);
```

### 2. Display Notifications
```javascript
// Fetch notifications
const res = await fetch('/api/employee/notifications?limit=20', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { notifications } = await res.json();

// Render with priority colors
const PRIORITY_COLORS = {
  urgent: 'bg-red-100 border-red-500',
  high: 'bg-orange-100 border-orange-500',
  medium: 'bg-blue-100 border-blue-500',
  low: 'bg-gray-100 border-gray-500'
};

notifications.forEach(notif => {
  const colorClass = PRIORITY_COLORS[notif.priority];
  renderNotification(notif, colorClass);
});
```

### 3. Handle Notification Click
```javascript
async function handleNotificationClick(notification) {
  // Mark as read
  if (!notification.is_read) {
    await fetch(`/api/employee/notifications/${notification.id}/read`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
  
  // Navigate to action URL
  if (notification.action_url) {
    router.push(notification.action_url);
  }
}
```

### 4. Filter by Category
```javascript
// Get only attendance notifications
const res = await fetch('/api/employee/notifications?category=attendance', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { notifications } = await res.json();
```

---

## Email Templates

### Leave Approved
```
Subject: Leave Request Approved - {Leave Type}

Hi {Employee Name},

Good news! Your leave request has been approved.

Leave Details:
- Type: {Leave Type}
- Dates: {Start Date} to {End Date}
- Duration: {X} days
- Approved by: {Approver Name}

Comments: {Approver Comments}

View Details: {Action URL}

Best regards,
UPEA Team
```

### Leave Rejected
```
Subject: Leave Request Update - {Leave Type}

Hi {Employee Name},

Your leave request has been reviewed.

Leave Details:
- Type: {Leave Type}
- Dates: {Start Date} to {End Date}
- Duration: {X} days
- Status: Rejected

Reason: {Rejection Reason}

Please contact your team lead if you have any questions.

Best regards,
UPEA Team
```