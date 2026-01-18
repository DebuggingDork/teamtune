# Attendance & Leave Management - API Quick Reference

**Last Updated:** 2026-01-18  
**Status:** ✅ Implemented (Handlers & Routes)

This document provides a quick reference for all attendance and leave management endpoints.

---

## 📋 Table of Contents

- [Employee Endpoints](#employee-endpoints)
- [Team Lead Endpoints](#team-lead-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Common Response Codes](#common-response-codes)

---

## Employee Endpoints

### Leave Management

#### Get Leave Types
```http
GET /api/employee/leave/types
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "code": "VACATION",
    "name": "Vacation Leave",
    "description": "Annual paid vacation",
    "default_days_per_year": 15,
    "is_paid": true,
    "requires_approval": true,
    "requires_document": false,
    "max_consecutive_days": 10,
    "min_advance_notice_days": 7,
    "allow_carryover": false,
    "max_carryover_days": 0,
    "color_code": "#10B981"
  }
]
```

#### Get Leave Balances
```http
GET /api/employee/leave/balances
GET /api/employee/leave/balances/:year
Authorization: Bearer <token>
```

**Response:**
```json
{
  "year": 2026,
  "balances": [
    {
      "leave_type": {
        "code": "VACATION",
        "name": "Vacation Leave",
        "color": "#10B981"
      },
      "total_days": 15,
      "used_days": 5,
      "pending_days": 3,
      "remaining_days": 7,
      "carried_over": 2
    }
  ],
  "summary": {
    "total_leaves_available": 25,
    "total_leaves_used": 6,
    "total_leaves_pending": 3
  }
}
```

#### Submit Leave Request
```http
POST /api/employee/leave/requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "leave_type_code": "VACATION",
  "start_date": "2026-02-01",
  "end_date": "2026-02-05",
  "is_half_day": false,
  "half_day_type": null,
  "reason": "Family vacation trip",
  "supporting_document_url": null
}
```

**Response (201):**
```json
{
  "request_code": "LR00000001",
  "leave_type": {
    "code": "VACATION",
    "name": "Vacation Leave",
    "color": "#10B981"
  },
  "start_date": "2026-02-01",
  "end_date": "2026-02-05",
  "total_days": 3,
  "is_half_day": false,
  "half_day_type": null,
  "reason": "Family vacation trip",
  "supporting_document_url": null,
  "status": "pending",
  "reviewed_at": null,
  "reviewer_comments": null,
  "created_at": "2026-01-18T10:30:00Z"
}
```

#### Get My Leave Requests
```http
GET /api/employee/leave/requests?page=1&limit=20&status=pending
Authorization: Bearer <token>

Query Parameters:
- page (optional): Page number (default: 1)
- limit (optional): Items per page (default: 20, max: 100)
- status (optional): pending | approved | rejected | cancelled
- leave_type_code (optional): Filter by leave type
- from_date (optional): YYYY-MM-DD
- to_date (optional): YYYY-MM-DD
```

**Response:**
```json
{
  "requests": [
    {
      "request_code": "LR00000001",
      "employee": {
        "user_code": "USER00000005",
        "full_name": "John Doe",
        "email": "john@example.com",
        "avatar_url": "https://..."
      },
      "leave_type": {
        "code": "VACATION",
        "name": "Vacation Leave",
        "color": "#10B981"
      },
      "start_date": "2026-02-01",
      "end_date": "2026-02-05",
      "total_days": 3,
      "is_half_day": false,
      "half_day_type": null,
      "reason": "Family vacation trip",
      "supporting_document_url": null,
      "status": "pending",
      "reviewer": null,
      "reviewed_at": null,
      "reviewer_comments": null,
      "created_at": "2026-01-18T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "total_pages": 1
  }
}
```

#### Get Leave Request by Code
```http
GET /api/employee/leave/requests/:code
Authorization: Bearer <token>
```

#### Cancel Leave Request
```http
PUT /api/employee/leave/requests/:code/cancel
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Leave request cancelled successfully"
}
```

---

### Attendance

#### Get Today's Attendance
```http
GET /api/employee/attendance/today
Authorization: Bearer <token>
```

**Response:**
```json
{
  "date": "2026-01-18",
  "status": "present",
  "check_in_time": "2026-01-18T09:05:00Z",
  "check_out_time": null,
  "worked_hours": null,
  "is_late": false,
  "late_minutes": 0
}
```

#### Check In
```http
POST /api/employee/attendance/check-in
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Checked in from office"
}
```

#### Check Out
```http
POST /api/employee/attendance/check-out
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Leaving for the day"
}
```

#### Get My Attendance Records
```http
GET /api/employee/attendance?from_date=2026-01-01&to_date=2026-01-31
Authorization: Bearer <token>

Query Parameters:
- page (optional): Page number
- limit (optional): Items per page (default: 31)
- from_date (optional): YYYY-MM-DD
- to_date (optional): YYYY-MM-DD
- status (optional): present | absent | on_leave | wfh | holiday
- is_late (optional): true | false
```

**Response:**
```json
{
  "records": [
    {
      "id": "uuid",
      "date": "2026-01-18",
      "check_in_time": "2026-01-18T09:05:00Z",
      "check_out_time": "2026-01-18T18:10:00Z",
      "worked_hours": 9.08,
      "status": "present",
      "is_late": false,
      "late_minutes": 0,
      "is_early_departure": false,
      "early_departure_minutes": 0,
      "notes": null,
      "leave_type": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 31,
    "total": 22,
    "total_pages": 1
  }
}
```

#### Get Attendance Summary
```http
GET /api/employee/attendance/summary?month=1&year=2026
Authorization: Bearer <token>
```

**Response:**
```json
{
  "month": 1,
  "year": 2026,
  "working_days": 22,
  "summary": {
    "present": 18,
    "absent": 1,
    "on_leave": 2,
    "wfh": 1,
    "holidays": 2,
    "half_day": 0
  },
  "punctuality": {
    "on_time": 16,
    "late_arrivals": 2,
    "average_late_minutes": 15
  },
  "hours": {
    "expected": 176,
    "worked": 172,
    "overtime": 4
  }
}
```

---

### Sessions

#### Get My Sessions
```http
GET /api/employee/sessions?page=1&limit=20
Authorization: Bearer <token>

Query Parameters:
- page (optional)
- limit (optional)
- from_date (optional): YYYY-MM-DD
- to_date (optional): YYYY-MM-DD
- is_active (optional): true | false
```

**Response:**
```json
{
  "sessions": [
    {
      "login_code": "LOG0000000001",
      "login_at": "2026-01-18T09:00:00Z",
      "logout_at": "2026-01-18T18:00:00Z",
      "session_duration_minutes": 540,
      "device_type": "desktop",
      "ip_address": "192.168.1.100",
      "is_active": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

#### Get Current Session
```http
GET /api/employee/sessions/current
Authorization: Bearer <token>
```

**Response:**
```json
{
  "login_code": "LOG0000000001",
  "login_at": "2026-01-18T09:00:00Z",
  "device_type": "desktop",
  "ip_address": "192.168.1.100",
  "duration_minutes": 125
}
```

#### Get Session Summary
```http
GET /api/employee/sessions/summary?month=1&year=2026
Authorization: Bearer <token>
```

**Response:**
```json
{
  "month": 1,
  "year": 2026,
  "total_sessions": 22,
  "total_hours": 176.5,
  "average_session_hours": 8.02,
  "by_device": {
    "desktop": 20,
    "mobile": 2,
    "tablet": 0
  }
}
```

---

### Holidays

#### Get Holidays
```http
GET /api/employee/holidays?year=2026
Authorization: Bearer <token>
```

**Response:**
```json
{
  "year": 2026,
  "holidays": [
    {
      "id": "uuid",
      "name": "New Year's Day",
      "date": "2026-01-01",
      "year": 2026,
      "is_optional": false,
      "description": "New Year celebration"
    }
  ],
  "total": 10
}
```

---

## Team Lead Endpoints

### Leave Management

#### Get Team Leave Requests
```http
GET /api/team-lead/teams/:teamCode/leave/requests?status=pending
Authorization: Bearer <token>

Query Parameters:
- page, limit, status, user_code, leave_type_code, from_date, to_date
```

#### Get Pending Leave Requests
```http
GET /api/team-lead/teams/:teamCode/leave/requests/pending
Authorization: Bearer <token>
```

**Response:**
```json
{
  "pending_requests": [
    {
      "request_code": "LR00000001",
      "employee": {
        "user_code": "USER00000005",
        "full_name": "John Doe",
        "email": "john@example.com",
        "avatar_url": "https://..."
      },
      "leave_type": {
        "code": "VACATION",
        "name": "Vacation Leave",
        "color": "#10B981"
      },
      "start_date": "2026-02-01",
      "end_date": "2026-02-05",
      "total_days": 3,
      "reason": "Family vacation trip",
      "status": "pending",
      "created_at": "2026-01-18T10:30:00Z",
      "days_until_start": 14
    }
  ],
  "count": 1
}
```

#### Approve Leave Request
```http
PUT /api/team-lead/teams/:teamCode/leave/requests/:code/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "comments": "Approved. Enjoy your vacation!"
}
```

#### Reject Leave Request
```http
PUT /api/team-lead/teams/:teamCode/leave/requests/:code/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "comments": "Cannot approve due to project deadline"
}
```

#### Get Team Leave Calendar
```http
GET /api/team-lead/teams/:teamCode/leave/calendar?month=2&year=2026
Authorization: Bearer <token>
```

**Response:**
```json
{
  "month": 2,
  "year": 2026,
  "entries": [
    {
      "date": "2026-02-01",
      "user_code": "USER00000005",
      "user_name": "John Doe",
      "leave_type": "Vacation Leave",
      "leave_type_color": "#10B981",
      "is_half_day": false,
      "half_day_type": null
    }
  ],
  "summary": {
    "total_leave_days": 15,
    "employees_on_leave": 3
  }
}
```

---

### Attendance

#### Get Team Today's Attendance
```http
GET /api/team-lead/teams/:teamCode/attendance/today
Authorization: Bearer <token>
```

**Response:**
```json
{
  "date": "2026-01-18",
  "present": {
    "count": 8,
    "members": [
      {
        "user_code": "USER00000005",
        "full_name": "John Doe",
        "check_in_time": "2026-01-18T09:05:00Z",
        "is_late": false
      }
    ]
  },
  "absent": {
    "count": 1,
    "members": [
      {
        "user_code": "USER00000006",
        "full_name": "Jane Smith"
      }
    ]
  },
  "on_leave": {
    "count": 1,
    "members": [
      {
        "user_code": "USER00000007",
        "full_name": "Bob Johnson",
        "leave_type": "Sick Leave"
      }
    ]
  },
  "wfh": {
    "count": 0,
    "members": []
  }
}
```

#### Get Team Attendance Records
```http
GET /api/team-lead/teams/:teamCode/attendance?from_date=2026-01-18
Authorization: Bearer <token>
```

#### Get Team Active Sessions
```http
GET /api/team-lead/teams/:teamCode/sessions/active
Authorization: Bearer <token>
```

**Response:**
```json
{
  "active_sessions": [
    {
      "login_code": "LOG0000000001",
      "login_at": "2026-01-18T09:00:00Z",
      "logout_at": null,
      "session_duration_minutes": 125,
      "device_type": "desktop",
      "ip_address": "192.168.1.100",
      "is_active": true,
      "user_code": "USER00000005",
      "user_name": "John Doe"
    }
  ],
  "count": 8
}
```

---

## Admin Endpoints

### Leave Types Management

#### Get All Leave Types
```http
GET /api/admin/leave-types?include_inactive=false
Authorization: Bearer <token>
```

#### Create Leave Type
```http
POST /api/admin/leave-types
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "COMP_OFF",
  "name": "Compensatory Off",
  "description": "Comp off for overtime work",
  "default_days_per_year": 0,
  "is_paid": true,
  "requires_approval": true,
  "requires_document": false,
  "max_consecutive_days": 5,
  "min_advance_notice_days": 1,
  "allow_carryover": false,
  "max_carryover_days": 0,
  "color_code": "#F59E0B"
}
```

#### Update Leave Type
```http
PUT /api/admin/leave-types/:id
Authorization: Bearer <token>
```

#### Deactivate Leave Type
```http
DELETE /api/admin/leave-types/:id
Authorization: Bearer <token>
```

---

### Leave Balance Management

#### Initialize Leave Balances
```http
POST /api/admin/leave/balances/initialize
Authorization: Bearer <token>
Content-Type: application/json

{
  "year": 2026
}
```

#### Adjust Leave Balance
```http
PUT /api/admin/leave/balances/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "leave_type_id": "uuid",
  "year": 2026,
  "adjustment": 5,
  "reason": "Additional leave granted for exceptional performance"
}
```

#### Get All Leave Balances
```http
GET /api/admin/leave/balances?year=2026
Authorization: Bearer <token>
```

---

### Holiday Management

#### Get All Holidays
```http
GET /api/admin/holidays?year=2026
Authorization: Bearer <token>
```

#### Create Holiday
```http
POST /api/admin/holidays
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Independence Day",
  "date": "2026-08-15",
  "year": 2026,
  "is_optional": false,
  "description": "National holiday"
}
```

#### Delete Holiday
```http
DELETE /api/admin/holidays/:id
Authorization: Bearer <token>
```

---

### Reports

#### Get Attendance Report
```http
GET /api/admin/attendance/report?from_date=2026-01-01&to_date=2026-01-31
Authorization: Bearer <token>
```

#### Get Leave Report
```http
GET /api/admin/leave/report?year=2026
Authorization: Bearer <token>
```

---

## Common Response Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Conflicting state (e.g., overlapping leave) |
| 500 | Server Error | Internal server error |

---

## Error Response Format

```json
{
  "error": "Validation error",
  "message": "Start date must be before or equal to end date",
  "statusCode": 400
}
```

---

## Notes for Frontend Integration

1. **Authentication**: All endpoints require Bearer token in Authorization header
2. **Date Format**: Use ISO 8601 format (YYYY-MM-DD) for dates
3. **Pagination**: Default page size is 20, maximum is 100
4. **Status Values**: 
   - Leave: `pending`, `approved`, `rejected`, `cancelled`
   - Attendance: `present`, `absent`, `on_leave`, `wfh`, `holiday`, `half_day`
5. **Device Types**: `desktop`, `mobile`, `tablet`, `unknown`
6. **Half Day Types**: `first_half`, `second_half`

---

**Implementation Status:**
- ✅ Database migrations created
- ✅ Models created
- ✅ Repositories created
- ✅ Services created
- ✅ Handlers created
- ✅ Routes created and integrated
- ⏳ Testing pending
- ⏳ Frontend integration pending

**Next Steps:**
1. Run database migrations
2. Seed default leave types
3. Test endpoints with Postman/Thunder Client
4. Integrate with frontend
5. Add notification listeners for leave events
