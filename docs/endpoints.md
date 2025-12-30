
Implemented endpoints only:

## UPEA Backend API Endpoints (Implemented)

**Base URL:** `https://upea.onrender.com`

---

## Authentication Endpoints

### 1. Register Employee
**POST** `https://upea.onrender.com/api/auth/register`

**Request Body:**
```json
{
  "email": "employee@company.com",
  "password": "SecurePass123",
  "username": "johndoe",
  "full_name": "John Doe",
  "department_id": "uuid-optional"
}
```

**Response:**
```json
{
  "message": "Registration successful. Awaiting admin approval.",
  "user_id": "dc42fa70-09a7-4038-a3bb-f61dda854910"
}
```

---

### 2. Login
**POST** `https://upea.onrender.com/api/auth/login`

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "AdminPass123!"
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "user_code": "USER00000001",
    "email": "admin@company.com",
    "full_name": "System Administrator",
    "role": "admin",
    "status": "active"
  }
}
```

---

### 3. Check Registration Status
**GET** `https://upea.onrender.com/api/auth/status`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "status": "pending",
  "user_code": null,
  "message": "Your registration is pending admin approval."
}
```

---

### 4. Logout
**POST** `https://upea.onrender.com/api/auth/logout`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

## Admin Endpoints

**All require:** `Authorization: Bearer <admin_token>`

### 5. List Pending Users
**GET** `https://upea.onrender.com/api/admin/users/pending`

**Response:**
```json
[
  {
    "id": "dc42fa70-09a7-4038-a3bb-f61dda854910",
    "email": "employee@company.com",
    "full_name": "John Doe",
    "status": "pending",
    "created_at": "2025-01-15T10:00:00Z",
    "department_id": null
  }
]
```

---

### 6. List All Users (with filters)
**GET** `https://upea.onrender.com/api/admin/users?status=active&role=employee&department_id=uuid`

**Query Parameters:**
- `status`: `pending` | `active` | `blocked` | `inactive`
- `role`: `employee` | `team_lead` | `project_manager` | `admin`
- `department_id`: UUID string

**Response:**
```json
[
  {
    "id": "uuid",
    "user_code": "USER00000001",
    "email": "user@company.com",
    "full_name": "John Doe",
    "role": "employee",
    "status": "active",
    "department_id": "uuid"
  }
]
```

---

### 7. Approve User
**POST** `https://upea.onrender.com/api/admin/users/:id/approve`

**Request Body:**
```json
{
  "role": "employee",
  "department_id": "department-uuid-here"
}
```

**Response:**
```json
{
  "message": "User approved successfully",
  "user": {
    "id": "dc42fa70-09a7-4038-a3bb-f61dda854910",
    "user_code": "USER00000001",
    "email": "employee@company.com",
    "role": "employee",
    "status": "active"
  }
}
```

---

### 8. Reject User
**POST** `https://upea.onrender.com/api/admin/users/:id/reject`

**Request Body:**
```json
{
  "reason": "Optional rejection reason"
}
```

**Response:**
```json
{
  "message": "User registration rejected"
}
```

---

### 9. Promote to Admin
**POST** `https://upea.onrender.com/api/admin/users/promote-admin`

**Request Body:**
```json
{
  "user_id": "uuid",
  "admin_code": "admin-secret-code"
}
```

**Response:**
```json
{
  "message": "User promoted to admin successfully"
}
```

---

### 10. Connect GitHub Plugin
**POST** `https://upea.onrender.com/api/admin/plugins/github/connect`

**Response:**
```json
{
  "auth_url": "https://github.com/login/oauth/authorize?..."
}
```

---

### 11. List Plugins
**GET** `https://upea.onrender.com/api/admin/plugins`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "GitHub",
    "type": "github",
    "status": "connected",
    "config": {}
  }
]
```

---

### 12. Update Plugin
**PUT** `https://upea.onrender.com/api/admin/plugins/:pluginId`

**Request Body:**
```json
{
  "config": {},
  "status": "active"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "GitHub",
  "status": "active"
}
```

---

### 13. Sync Plugin
**POST** `https://upea.onrender.com/api/admin/plugins/:pluginId/sync`

**Response:**
```json
{
  "message": "Sync job started"
}
```

---

## Project Manager Endpoints

**All require:** `Authorization: Bearer <token>` and `project_manager` role

### 14. View All Employees
**GET** `https://upea.onrender.com/api/project-manager/employees?page=1&limit=20`

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10, max: 100)

**Response:**
```json
{
  "employees": [
    {
      "id": "uuid",
      "user_code": "USER00000001",
      "username": "johndoe",
      "full_name": "John Doe",
      "email": "john@company.com",
      "role": "employee",
      "status": "active",
      "department_id": "uuid-or-null"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "total_pages": 5
  }
}
```

---

### 15. List PM's Projects
**GET** `https://upea.onrender.com/api/project-manager/projects?page=1&limit=10`

**Response:**
```json
{
  "projects": [
    {
      "id": "uuid",
      "project_code": "PROJ00000001",
      "name": "Website Redesign",
      "description": "Complete redesign of company website",
      "manager_id": "uuid",
      "manager_name": "Jane Smith",
      "start_date": "2024-01-01T00:00:00.000Z",
      "end_date": "2024-06-30T00:00:00.000Z",
      "status": "active",
      "created_at": "2023-12-15T10:00:00.000Z",
      "updated_at": "2024-01-10T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "total_pages": 1
  }
}
```

---

### 16. Create Project
**POST** `https://upea.onrender.com/api/project-manager/projects`

**Request Body:**
```json
{
  "name": "Website Redesign",
  "description": "Complete redesign of company website with modern UI/UX",
  "start_date": "2024-01-01",
  "end_date": "2024-06-30"
}
```

**Response:**
```json
{
  "id": "uuid",
  "project_code": "PROJ00000001",
  "name": "Website Redesign",
  "description": "Complete redesign of company website with modern UI/UX",
  "manager_id": "uuid",
  "manager_name": "Jane Smith",
  "start_date": "2024-01-01T00:00:00.000Z",
  "end_date": "2024-06-30T00:00:00.000Z",
  "status": "planning",
  "created_at": "2024-01-15T10:00:00.000Z",
  "updated_at": "2024-01-15T10:00:00.000Z"
}
```

---

### 17. Get Project Details
**GET** `https://upea.onrender.com/api/project-manager/projects/:code`

**Response:**
```json
{
  "id": "uuid",
  "project_code": "PROJ00000001",
  "name": "Website Redesign",
  "description": "Complete redesign of company website",
  "manager_id": "uuid",
  "manager_name": "Jane Smith",
  "start_date": "2024-01-01T00:00:00.000Z",
  "end_date": "2024-06-30T00:00:00.000Z",
  "status": "active",
  "created_at": "2023-12-15T10:00:00.000Z",
  "updated_at": "2024-01-10T14:30:00.000Z"
}
```

---

### 18. Update Project
**PUT** `https://upea.onrender.com/api/project-manager/projects/:code`

**Request Body:**
```json
{
  "name": "Website Redesign v2",
  "description": "Updated project description",
  "start_date": "2024-01-15",
  "end_date": "2024-07-31",
  "status": "active"
}
```

**Response:**
```json
{
  "id": "uuid",
  "project_code": "PROJ00000001",
  "name": "Website Redesign v2",
  "description": "Updated project description",
  "manager_id": "uuid",
  "manager_name": "Jane Smith",
  "start_date": "2024-01-15T00:00:00.000Z",
  "end_date": "2024-07-31T00:00:00.000Z",
  "status": "active",
  "created_at": "2023-12-15T10:00:00.000Z",
  "updated_at": "2024-01-20T09:15:00.000Z"
}
```

---

### 19. Get Teams for Project
**GET** `https://upea.onrender.com/api/project-manager/projects/:code/teams?page=1&limit=10`

**Response:**
```json
{
  "teams": [
    {
      "id": "uuid",
      "team_code": "TEAM00000001",
      "project_id": "uuid",
      "project_name": "Website Redesign",
      "name": "Frontend Team",
      "lead_id": "uuid",
      "lead_name": "John Doe",
      "capacity_hours_per_sprint": 160,
      "member_count": 5,
      "created_at": "2024-01-10T10:00:00.000Z",
      "updated_at": "2024-01-15T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "total_pages": 1
  },
  "project": {
    "project_id": "uuid",
    "project_code": "PROJ00000001",
    "project_name": "Website Redesign"
  }
}
```

---

### 20. Create Team
**POST** `https://upea.onrender.com/api/project-manager/projects/:code/teams`

**Request Body:**
```json
{
  "name": "Frontend Team",
  "lead_id": "USER00000001",
  "capacity_hours_per_sprint": 160
}
```

**Response:**
```json
{
  "id": "uuid",
  "team_code": "TEAM00000001",
  "project_id": "uuid",
  "project_name": "Website Redesign",
  "name": "Frontend Team",
  "lead_id": "uuid",
  "lead_name": "John Doe",
  "capacity_hours_per_sprint": 160,
  "member_count": 0,
  "created_at": "2024-01-15T10:00:00.000Z",
  "updated_at": "2024-01-15T10:00:00.000Z"
}
```

---

### 21. Assign Team Lead
**PUT** `https://upea.onrender.com/api/project-manager/teams/:code/lead`

**Request Body:**
```json
{
  "lead_id": "USER00000002"
}
```

**Response:**
```json
{
  "id": "uuid",
  "team_code": "TEAM00000001",
  "project_id": "uuid",
  "project_name": "Website Redesign",
  "name": "Frontend Team",
  "lead_id": "uuid",
  "lead_name": "Jane Smith",
  "capacity_hours_per_sprint": 160,
  "member_count": 5,
  "created_at": "2024-01-10T10:00:00.000Z",
  "updated_at": "2024-01-20T09:15:00.000Z"
}
```

---

### 22. Remove Team Lead
**DELETE** `https://upea.onrender.com/api/project-manager/teams/:code/lead`

**Request Body:**
```json
{
  "new_lead_id": "USER00000003"
}
```

**Response:**
```json
{
  "id": "uuid",
  "team_code": "TEAM00000001",
  "project_id": "uuid",
  "project_name": "Website Redesign",
  "name": "Frontend Team",
  "lead_id": "uuid",
  "lead_name": "Bob Johnson",
  "capacity_hours_per_sprint": 160,
  "member_count": 5,
  "created_at": "2024-01-10T10:00:00.000Z",
  "updated_at": "2024-01-20T10:30:00.000Z"
}
```

---

### 23. Add Team Members
**POST** `https://upea.onrender.com/api/project-manager/teams/:code/members`

**Request Body:**
```json
{
  "user_ids": ["USER00000004", "USER00000005"],
  "allocation_percentage": 100
}
```

**Response:**
```json
{
  "message": "Successfully added 2 member(s)",
  "added": 2
}
```

---

### 24. Remove Team Member
**DELETE** `https://upea.onrender.com/api/project-manager/teams/:code/members/:userId`

**Response:**
```json
{
  "message": "Team member removed successfully"
}
```

---

### 25. Get Team Members
**GET** `https://upea.onrender.com/api/project-manager/teams/:code/members?page=1&limit=10`

**Response:**
```json
{
  "members": [
    {
      "user_id": "uuid",
      "user_code": "USER00000004",
      "full_name": "Alice Brown",
      "email": "alice@company.com",
      "role": "employee",
      "allocation_percentage": 100,
      "joined_at": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "total_pages": 1
  },
  "team": {
    "team_id": "uuid",
    "team_code": "TEAM00000001",
    "team_name": "Frontend Team"
  }
}
```

---

### 26. Get All Project Team Members
**GET** `https://upea.onrender.com/api/project-manager/projects/:code/members`

**Response:**
```json
{
  "project": {
    "project_id": "uuid",
    "project_code": "PROJ00000001",
    "project_name": "Website Redesign"
  },
  "teams": [
    {
      "team_id": "uuid",
      "team_code": "TEAM00000001",
      "team_name": "Frontend Team",
      "members": [
        {
          "user_id": "uuid",
          "user_code": "USER00000004",
          "full_name": "Alice Brown",
          "email": "alice@company.com",
          "role": "employee",
          "allocation_percentage": 100,
          "joined_at": "2024-01-15T10:00:00.000Z"
        }
      ],
      "member_count": 5
    }
  ],
  "pagination": {
    "total_members": 15,
    "total_teams": 3
  }
}
```
Single Delete:
DELETE /api/project-manager/projects/PROJ00000001Authorization: Bearer <token>
Bulk Delete:
DELETE /api/project-manager/projects/bulkAuthorization: Bearer <token>Content-Type: application/json{  "project_codes": ["PROJ00000001", "PROJ00000002", "PROJ00000003"]}
Response examples
Single Delete Response:
{  "message": "Project deleted successfully",  "project_code": "PROJ00000001"}
Bulk Delete Response:
{  "message": "Bulk delete completed: 2 deleted, 1 failed",  "deleted": ["PROJ00000001", "PROJ00000002"],  "failed": [    {      "project_code": "PROJ00000003",      "error": "You do not have access to this project"    }  ],  "total_requested": 3,  "total_deleted": 2,  "total_failed": 1}
All endpoints are protected by authentication and require the project_manager role. The implementation is ready to use.

### 27. Delete Project (Single)
**DELETE** `https://upea.onrender.com/api/project-manager/projects/:code`

**Response:**
```json
{
  "message": "Project deleted successfully",
  "project_code": "PROJ00000001"
}
```

---

### 28. Delete Projects (Bulk)
**DELETE** `https://upea.onrender.com/api/project-manager/projects/bulk`

**Request Body:**
```json
{
  "project_codes": ["PROJ00000001", "PROJ00000002", "PROJ00000003"]
}
```

**Response:**
```json
{
  "message": "Bulk delete completed: 2 deleted, 1 failed",
  "deleted": ["PROJ00000001", "PROJ00000002"],
  "failed": [
    {
      "project_code": "PROJ00000003",
      "error": "You do not have access to this project"
    }
  ],
  "total_requested": 3,
  "total_deleted": 2,
  "total_failed": 1
}
```

---

### 29. Get Team Performance (PM)
**GET** `https://upea.onrender.com/api/project-manager/projects/:projectCode/teams/:teamCode/performance?period_start=2024-01-01&period_end=2024-01-31`

**Response:**
```json
{
  "team": {
    "team_id": "uuid",
    "team_code": "TEAM00000001",
    "team_name": "Frontend Team"
  },
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  },
  "metrics": {
    "tasks": {
      "total": 50,
      "completed": 35,
      "in_progress": 10,
      "blocked": 5,
      "completion_rate": 70.0,
      "average_completion_days": 5.2
    },
    "time_tracking": {
      "total_hours_logged": 320,
      "total_estimated_hours": 400,
      "variance_percentage": -20.0,
      "average_hours_per_task": 6.4
    },
    "observations": {
      "total": 25,
      "by_category": {
        "technical": 10,
        "communication": 8,
        "leadership": 7
      },
      "by_rating": {
        "positive": 15,
        "neutral": 5,
        "negative": 5
      }
    },
    "evaluations": {
      "finalized_count": 5,
      "average_score": 85.5,
      "tier_distribution": {
        "excellent": 2,
        "good": 2,
        "satisfactory": 1,
        "needs_improvement": 0
      }
    }
  },
  "members_summary": {
    "total_members": 5,
    "active_members": 5,
    "average_performance_score": 82.0
  }
}
```

---

### 30. Get Project Health Metrics
**GET** `https://upea.onrender.com/api/project-manager/projects/:projectCode/health`

**Response:**
```json
{
  "project": {
    "project_id": "uuid",
    "project_code": "PROJ00000001",
    "project_name": "Website Redesign",
    "status": "active",
    "start_date": "2024-01-01",
    "end_date": "2024-06-30"
  },
  "health": {
    "overall_status": "healthy",
    "indicators": {
      "tasks": {
        "total": 150,
        "completed": 100,
        "in_progress": 35,
        "blocked": 10,
        "overdue": 5,
        "completion_rate": 66.67
      },
      "teams": {
        "total": 3,
        "active": 3,
        "average_performance_score": 80.5
      },
      "resources": {
        "total_hours_logged": 1200,
        "total_estimated_hours": 1500,
        "utilization_rate": 80.0
      },
      "risks": {
        "blocked_tasks_count": 10,
        "overdue_tasks_count": 5,
        "teams_with_low_performance": 1
      }
    },
    "teams": [
      {
        "team_id": "uuid",
        "team_code": "TEAM00000001",
        "team_name": "Frontend Team",
        "performance_score": 85.0,
        "tasks_completed": 35,
        "tasks_total": 50,
        "health_status": "healthy"
      }
    ]
  }
}
```

---

## Employee Endpoints

**All require:** `Authorization: Bearer <token>` and `employee` role

### 29. Get My Tasks
**GET** `https://upea.onrender.com/api/employee/tasks?page=1&limit=10&status=todo`

**Query Parameters:**
- `page`: number
- `limit`: number
- `status`: `todo` | `in_progress` | `blocked` | `in_review` | `done` | `cancelled`

**Response:**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "task_code": "TASK00000001",
      "team_id": "uuid",
      "team_code": "TEAM00000001",
      "team_name": "Frontend Team",
      "title": "Implement login page",
      "description": "Create login UI component",
      "assigned_to": "uuid",
      "assigned_to_name": "John Doe",
      "created_by": "uuid",
      "created_by_name": "Jane Smith",
      "status": "in_progress",
      "priority": 3,
      "estimated_hours": 8,
      "actual_hours": 0,
      "due_date": "2024-02-01",
      "completed_at": null,
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-20T09:15:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "total_pages": 3
  }
}
```

---

### 30. Get My Task by Code
**GET** `https://upea.onrender.com/api/employee/tasks/:taskCode`

**Response:**
```json
{
  "id": "uuid",
  "task_code": "TASK00000001",
  "team_id": "uuid",
  "team_code": "TEAM00000001",
  "team_name": "Frontend Team",
  "title": "Implement login page",
  "description": "Create login UI component",
  "assigned_to": "uuid",
  "assigned_to_name": "John Doe",
  "created_by": "uuid",
  "created_by_name": "Jane Smith",
  "status": "in_progress",
  "priority": 3,
  "estimated_hours": 8,
  "actual_hours": 0,
  "due_date": "2024-02-01",
  "completed_at": null,
  "created_at": "2024-01-15T10:00:00.000Z",
  "updated_at": "2024-01-20T09:15:00.000Z"
}
```

---

### 31. Update My Task Status
**PUT** `https://upea.onrender.com/api/employee/tasks/:taskCode/status`

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Response:**
```json
{
  "id": "uuid",
  "task_code": "TASK00000001",
  "status": "in_progress",
  "updated_at": "2024-01-20T09:15:00.000Z"
}
```

---

### 32. Create Time Entry
**POST** `https://upea.onrender.com/api/employee/time-entries`

**Request Body:**
```json
{
  "task_code": "TASK00000001",
  "work_date": "2024-01-20",
  "hours": 4.5,
  "description": "Worked on login page implementation"
}
```

**Response:**
```json
{
  "id": "uuid",
  "time_code": "TIME00000001",
  "task_id": "uuid",
  "task_code": "TASK00000001",
  "task_title": "Implement login page",
  "user_id": "uuid",
  "work_date": "2024-01-20",
  "hours": 4.5,
  "description": "Worked on login page implementation",
  "created_at": "2024-01-20T10:00:00.000Z",
  "updated_at": "2024-01-20T10:00:00.000Z"
}
```

---

### 33. Get My Time Entries
**GET** `https://upea.onrender.com/api/employee/time-entries?page=1&limit=10&start_date=2024-01-01&end_date=2024-01-31`

**Query Parameters:**
- `page`: number
- `limit`: number
- `start_date`: ISO date string
- `end_date`: ISO date string

**Response:**
```json
{
  "time_entries": [
    {
      "id": "uuid",
      "time_code": "TIME00000001",
      "task_id": "uuid",
      "task_code": "TASK00000001",
      "task_title": "Implement login page",
      "user_id": "uuid",
      "work_date": "2024-01-20",
      "hours": 4.5,
      "description": "Worked on login page implementation",
      "created_at": "2024-01-20T10:00:00.000Z",
      "updated_at": "2024-01-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "total_pages": 2
  }
}
```

---

### 34. Get My Time Entry by Code
**GET** `https://upea.onrender.com/api/employee/time-entries/:timeCode`

**Response:**
```json
{
  "id": "uuid",
  "time_code": "TIME00000001",
  "task_id": "uuid",
  "task_code": "TASK00000001",
  "task_title": "Implement login page",
  "user_id": "uuid",
  "work_date": "2024-01-20",
  "hours": 4.5,
  "description": "Worked on login page implementation",
  "created_at": "2024-01-20T10:00:00.000Z",
  "updated_at": "2024-01-20T10:00:00.000Z"
}
```

---

### 35. Update My Time Entry
**PUT** `https://upea.onrender.com/api/employee/time-entries/:timeCode`

**Request Body:**
```json
{
  "work_date": "2024-01-21",
  "hours": 6,
  "description": "Updated description"
}
```

**Response:**
```json
{
  "id": "uuid",
  "time_code": "TIME00000001",
  "work_date": "2024-01-21",
  "hours": 6,
  "description": "Updated description",
  "updated_at": "2024-01-21T10:00:00.000Z"
}
```

---

### 36. Delete My Time Entry
**DELETE** `https://upea.onrender.com/api/employee/time-entries/:timeCode`

**Response:**
```json
{
  "message": "Time entry deleted successfully"
}
```

---

### 37. Get My Profile
**GET** `https://upea.onrender.com/api/employee/profile`

**Response:**
```json
{
  "id": "uuid",
  "user_code": "USER00000001",
  "username": "johndoe",
  "email": "john@company.com",
  "full_name": "John Doe",
  "role": "employee",
  "status": "active",
  "department_id": "uuid"
}
```

---

### 38. Update My Profile
**PUT** `https://upea.onrender.com/api/employee/profile`

**Request Body:**
```json
{
  "full_name": "John Updated Doe",
  "username": "johndoe_updated"
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_code": "USER00000001",
  "username": "johndoe_updated",
  "email": "john@company.com",
  "full_name": "John Updated Doe",
  "role": "employee",
  "status": "active"
}
```

---

### 39. Get My Teams
**GET** `https://upea.onrender.com/api/employee/teams`

**Response:**
```json
{
  "teams": [
    {
      "id": "uuid",
      "team_code": "TEAM00000001",
      "project_id": "uuid",
      "project_code": "PROJ00000001",
      "project_name": "Website Redesign",
      "name": "Frontend Team",
      "lead_id": "uuid",
      "lead_name": "Jane Smith",
      "capacity_hours_per_sprint": 160,
      "github_repository": null,
      "allocation_percentage": 100,
      "joined_at": "2024-01-15T10:00:00.000Z",
      "created_at": "2024-01-10T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "total_pages": 1
  }
}
```

---

### 40. Get My Projects
**GET** `https://upea.onrender.com/api/employee/projects`

**Response:**
```json
{
  "projects": [
    {
      "id": "uuid",
      "project_code": "PROJ00000001",
      "name": "Website Redesign",
      "description": "Complete redesign",
      "status": "active",
      "start_date": "2024-01-01",
      "end_date": "2024-06-30"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "total_pages": 1
  }
}
```

---

### 41. Get My Performance
**GET** `https://upea.onrender.com/api/employee/performance?period_start=2024-01-01&period_end=2024-01-31`

**Response:**
```json
{
  "user": {
    "user_id": "uuid",
    "user_code": "USER00000001",
    "user_name": "John Doe"
  },
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  },
  "metrics": {
    "tasks": {
      "total": 15,
      "completed": 12,
      "in_progress": 2,
      "blocked": 1,
      "completion_rate": 80.0
    },
    "time_tracking": {
      "total_hours_logged": 120,
      "average_hours_per_day": 4.0
    }
  },
  "summary": {
    "performance_score": 85.0,
    "tier": "good"
  }
}
```

---

### 42. Get My Observations
**GET** `https://upea.onrender.com/api/employee/observations?page=1&limit=10`

**Response:**
```json
{
  "observations": [
    {
      "id": "uuid",
      "observation_code": "OBSV00000001",
      "category": "technical",
      "rating": "positive",
      "note": "Excellent code quality",
      "related_task_id": "uuid",
      "related_task_code": "TASK00000001",
      "related_task_title": "Implement login page",
      "observation_date": "2024-01-20",
      "created_at": "2024-01-20T10:00:00.000Z",
      "evaluator": {
        "evaluator_id": "uuid",
        "evaluator_name": "Jane Smith",
        "evaluator_role": "team_lead"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "total_pages": 1
  },
  "summary": {
    "total": 5,
    "by_category": {
      "delivery": 2,
      "quality": 1,
      "collaboration": 1,
      "technical": 1
    },
    "by_rating": {
      "positive": 4,
      "neutral": 1,
      "negative": 0
    }
  }
}
```

---

### 43. Get My Metrics
**GET** `https://upea.onrender.com/api/employee/metrics`

**Response:**
```json
{
  "git_activity": {
    "commits": 45,
    "pull_requests": 8,
    "code_reviews": 12
  },
  "tasks": {
    "completed": 12,
    "in_progress": 2
  }
}
```

---

### 44. Connect GitHub
**POST** `https://upea.onrender.com/api/employee/github/connect`

**Response:**
```json
{
  "auth_url": "https://github.com/login/oauth/authorize?..."
}
```

---

### 45. Disconnect GitHub
**DELETE** `https://upea.onrender.com/api/employee/github/disconnect`

**Response:**
```json
{
  "message": "GitHub disconnected successfully"
}
```

---

### 46. Get GitHub Status
**GET** `https://upea.onrender.com/api/employee/github/status`

**Response:**
```json
{
  "connected": true,
  "github_username": "johndoe",
  "github_user_id": "12345678"
}
```

---

### 47. Get My Git Activity
**GET** `https://upea.onrender.com/api/employee/git-activity?start_date=2024-01-01&end_date=2024-01-31`

**Response:**
```json
{
  "commits": 45,
  "pull_requests": 8,
  "code_reviews": 12,
  "activity_by_date": [
    {
      "date": "2024-01-20",
      "commits": 5,
      "pull_requests": 1
    }
  ]
}
```

---

## Team Lead Endpoints

**All require:** `Authorization: Bearer <token>` and `team_lead` role

### 48. Create Task
**POST** `https://upea.onrender.com/api/team-lead/teams/:teamCode/tasks`

**Request Body:**
```json
{
  "title": "Implement login page",
  "description": "Create login UI component with validation",
  "assigned_to": "USER00000001",
  "priority": 3,
  "estimated_hours": 8,
  "due_date": "2024-02-01"
}
```

**Response:**
```json
{
  "id": "uuid",
  "task_code": "TASK00000001",
  "team_id": "uuid",
  "team_code": "TEAM00000001",
  "team_name": "Frontend Team",
  "title": "Implement login page",
  "description": "Create login UI component with validation",
  "assigned_to": "uuid",
  "assigned_to_name": "John Doe",
  "created_by": "uuid",
  "created_by_name": "Jane Smith",
  "status": "todo",
  "priority": 3,
  "estimated_hours": 8,
  "actual_hours": 0,
  "due_date": "2024-02-01",
  "completed_at": null,
  "created_at": "2024-01-15T10:00:00.000Z",
  "updated_at": "2024-01-15T10:00:00.000Z"
}
```

---

### 49. Get Tasks by Team
**GET** `https://upea.onrender.com/api/team-lead/teams/:teamCode/tasks?page=1&limit=10&status=todo`

**Response:**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "task_code": "TASK00000001",
      "team_id": "uuid",
      "team_code": "TEAM00000001",
      "team_name": "Frontend Team",
      "title": "Implement login page",
      "description": "Create login UI component",
      "assigned_to": "uuid",
      "assigned_to_name": "John Doe",
      "created_by": "uuid",
      "created_by_name": "Jane Smith",
      "status": "todo",
      "priority": 3,
      "estimated_hours": 8,
      "actual_hours": 0,
      "due_date": "2024-02-01",
      "completed_at": null,
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "total_pages": 3
  },
  "team": {
    "team_id": "uuid",
    "team_code": "TEAM00000001",
    "team_name": "Frontend Team"
  }
}
```

---

### 50. Get Task by Code
**GET** `https://upea.onrender.com/api/team-lead/tasks/:taskCode`

**Response:** (Same as Task Response above)

---

### 51. Update Task
**PUT** `https://upea.onrender.com/api/team-lead/tasks/:taskCode`

**Request Body:**
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "priority": 4,
  "estimated_hours": 10,
  "due_date": "2024-02-05"
}
```

**Response:** (Updated Task Response)

---

### 52. Delete Task
**DELETE** `https://upea.onrender.com/api/team-lead/tasks/:taskCode`

**Response:**
```json
{
  "message": "Task deleted successfully"
}
```

---

### 53. Assign Task
**PUT** `https://upea.onrender.com/api/team-lead/tasks/:taskCode/assign`

**Request Body:**
```json
{
  "assigned_to": "USER00000002"
}
```

**Response:**
```json
{
  "id": "uuid",
  "task_code": "TASK00000001",
  "assigned_to": "uuid",
  "assigned_to_name": "Alice Brown",
  "updated_at": "2024-01-20T09:15:00.000Z"
}
```

---

### 54. Update Task Status
**PUT** `https://upea.onrender.com/api/team-lead/tasks/:taskCode/status`

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Response:**
```json
{
  "id": "uuid",
  "task_code": "TASK00000001",
  "status": "in_progress",
  "updated_at": "2024-01-20T09:15:00.000Z"
}
```

---

### 55. Create Observation
**POST** `https://upea.onrender.com/api/team-lead/teams/:teamCode/members/:userCode/observations`

**Request Body:**
```json
{
  "category": "technical",
  "rating": "positive",
  "note": "Excellent code quality and attention to detail",
  "related_task_id": "uuid",
  "observation_date": "2024-01-20"
}
```

**Response:**
```json
{
  "id": "uuid",
  "observation_code": "OBSV00000001",
  "user_id": "uuid",
  "user_code": "USER00000001",
  "user_name": "John Doe",
  "evaluator_id": "uuid",
  "evaluator_name": "Jane Smith",
  "related_task_id": "uuid",
  "related_task_code": "TASK00000001",
  "related_task_title": "Implement login page",
  "category": "technical",
  "rating": "positive",
  "note": "Excellent code quality and attention to detail",
  "observation_date": "2024-01-20",
  "created_at": "2024-01-20T10:00:00.000Z"
}
```

---

### 56. Get Observations by Member
**GET** `https://upea.onrender.com/api


/teams/:teamCode/members/:userCode/observations?page=1&limit=10`

**Response:**
```json
{
  "observations": [
    {
      "id": "uuid",
      "observation_code": "OBSV00000001",
      "user_id": "uuid",
      "user_code": "USER00000001",
      "user_name": "John Doe",
      "evaluator_id": "uuid",
      "evaluator_name": "Jane Smith",
      "related_task_id": "uuid",
      "related_task_code": "TASK00000001",
      "related_task_title": "Implement login page",
      "category": "technical",
      "rating": "positive",
      "note": "Excellent code quality",
      "observation_date": "2024-01-20",
      "created_at": "2024-01-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "total_pages": 1
  },
  "member": {
    "user_id": "uuid",
    "user_code": "USER00000001",
    "user_name": "John Doe"
  },
  "team": {
    "team_id": "uuid",
    "team_code": "TEAM00000001",
    "team_name": "Frontend Team"
  }
}
```

---

### 57. Get Observation by Code
**GET** `https://upea.onrender.com/api/team-lead/observations/:observationCode`

**Response:** (Same as Observation Response above)

---

### 58. Update Observation
**PUT** `https://upea.onrender.com/api/team-lead/observations/:observationCode`

**Request Body:**
```json
{
  "category": "quality",
  "rating": "positive",
  "note": "Updated observation note"
}
```

**Response:** (Updated Observation Response)

---

### 59. Delete Observation
**DELETE** `https://upea.onrender.com/api/team-lead/observations/:observationCode`

**Response:**
```json
{
  "message": "Observation deleted successfully"
}
```

---

### 60. Get Team Performance
**GET** `https://upea.onrender.com/api/team-lead/teams/:teamCode/performance?period_start=2024-01-01&period_end=2024-01-31`

**Response:**
```json
{
  "team": {
    "team_id": "uuid",
    "team_code": "TEAM00000001",
    "team_name": "Frontend Team"
  },
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  },
  "metrics": {
    "tasks": {
      "total": 50,
      "completed": 35,
      "in_progress": 10,
      "blocked": 5,
      "completion_rate": 70.0
    },
    "time_tracking": {
      "total_hours_logged": 320,
      "total_estimated_hours": 400
    },
    "observations": {
      "total": 25,
      "by_category": {
        "technical": 10,
        "communication": 8
      }
    }
  },
  "members": [
    {
      "user_id": "uuid",
      "user_code": "USER00000001",
      "user_name": "John Doe",
      "tasks_completed": 12,
      "tasks_total": 15,
      "performance_score": 85.0
    }
  ]
}
```

---

### 61. Get Member Performance
**GET** `https://upea.onrender.com/api/team-lead/teams/:teamCode/members/:userCode/performance?period_start=2024-01-01&period_end=2024-01-31`

**Response:**
```json
{
  "user": {
    "user_id": "uuid",
    "user_code": "USER00000001",
    "user_name": "John Doe"
  },
  "team": {
    "team_id": "uuid",
    "team_code": "TEAM00000001",
    "team_name": "Frontend Team"
  },
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  },
  "metrics": {
    "tasks": {
      "total": 15,
      "completed": 12,
      "in_progress": 2,
      "blocked": 1,
      "completion_rate": 80.0
    },
    "time_tracking": {
      "total_hours_logged": 120,
      "average_hours_per_task": 8.0
    },
    "observations": {
      "total": 5,
      "positive": 4,
      "neutral": 1,
      "negative": 0
    }
  },
  "summary": {
    "performance_score": 85.0,
    "tier": "good"
  }
}
```

---

### 62. Get Team Metrics
**GET** `https://upea.onrender.com/api/team-lead/teams/:teamCode/metrics`

**Response:**
```json
{
  "git_activity": {
    "total_commits": 150,
    "total_pull_requests": 25,
    "total_code_reviews": 40
  },
  "tasks": {
    "total": 50,
    "completed": 35
  }
}
```

---

### 63. Link Repository
**POST** `https://upea.onrender.com/api/team-lead/teams/:teamCode/github/repository`

**Request Body:**
```json
{
  "repository_url": "https://github.com/company/project"
}
```

**Response:**
```json
{
  "message": "Repository linked successfully",
  "repository_url": "https://github.com/company/project"
}
```

---

### 64. Get Team Git Activity
**GET** `https://upea.onrender.com/api/team-lead/teams/:teamCode/git-activity?start_date=2024-01-01&end_date=2024-01-31`

**Response:**
```json
{
  "team": {
    "team_id": "uuid",
    "team_code": "TEAM00000001",
    "team_name": "Frontend Team"
  },
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  },
  "total_commits": 150,
  "total_pull_requests": 25,
  "total_code_reviews": 40,
  "activity_by_member": [
    {
      "user_id": "uuid",
      "user_code": "USER00000001",
      "user_name": "John Doe",
      "commits": 45,
      "pull_requests": 8,
      "code_reviews": 12
    }
  ]
}
```

---

### 65. Get Member Git Activity
**GET** `https://upea.onrender.com/api/team-lead/teams/:teamCode/members/:userCode/git-activity?start_date=2024-01-01&end_date=2024-01-31`

**Response:**
```json
{
  "user": {
    "user_id": "uuid",
    "user_code": "USER00000001",
    "user_name": "John Doe"
  },
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  },
  "commits": 45,
  "pull_requests": 8,
  "code_reviews": 12,
  "activity_by_date": [
    {
      "date": "2024-01-20",
      "commits": 5,
      "pull_requests": 1
    }
  ]
}
```

---

## GitHub OAuth Callback

### 66. GitHub OAuth Callback
**GET** `https://upea.onrender.com/api/github/oauth/callback?code=...&state=...`

**Note:** This is called by GitHub after OAuth authorization. No authentication required.

**Response:** Redirects to appropriate page based on state parameter.

---

---

## Missing Endpoints (Need Implementation)

### Admin Endpoints

### 67. Block User
**POST** `https://upea.onrender.com/api/admin/users/:id/block`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "reason": "Violation of company policy"
}
```

**Response:**
```json
{
  "message": "User blocked successfully",
  "user": {
    "id": "uuid",
    "user_code": "USER00000001",
    "status": "blocked",
    "blocked_at": "2025-01-15T10:00:00.000Z",
    "blocked_reason": "Violation of company policy"
  }
}
```

---

### 68. Unblock User
**POST** `https://upea.onrender.com/api/admin/users/:id/unblock`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "reason": "Issue resolved"
}
```

**Response:**
```json
{
  "message": "User unblocked successfully",
  "user": {
    "id": "uuid",
    "user_code": "USER00000001",
    "status": "active",
    "unblocked_at": "2025-01-15T10:00:00.000Z",
    "unblock_reason": "Issue resolved"
  }
}
```

---

### Notification Endpoints

### 69. Get Notifications
**GET** `https://upea.onrender.com/api/notifications?page=1&limit=20&unread_only=true`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20, max: 100)
- `unread_only`: boolean (default: false)

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "title": "New task assigned",
      "message": "You have been assigned a new task: Implement login page",
      "type": "task_assignment",
      "read": false,
      "created_at": "2025-01-15T10:00:00.000Z",
      "data": {
        "task_id": "uuid",
        "task_code": "TASK00000001"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "total_pages": 1,
    "unread_count": 5
  }
}
```

---

### 70. Mark Notification as Read
**PUT** `https://upea.onrender.com/api/notifications/:id/read`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Notification marked as read",
  "notification": {
    "id": "uuid",
    "read": true,
    "read_at": "2025-01-15T10:00:00.000Z"
  }
}
```

---

### 71. Mark All Notifications as Read
**PUT** `https://upea.onrender.com/api/notifications/read-all`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "All notifications marked as read",
  "updated_count": 5
}
```

---

### Search Endpoints

### 72. Global Search
**GET** `https://upea.onrender.com/api/search?q=query&type=all&limit=10`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `q`: string (search query)
- `type`: `all` | `users` | `projects` | `tasks` | `teams`
- `limit`: number (default: 10, max: 50)

**Response:**
```json
{
  "results": {
    "users": [
      {
        "id": "uuid",
        "user_code": "USER00000001",
        "full_name": "John Doe",
        "email": "john@company.com",
        "type": "user"
      }
    ],
    "projects": [
      {
        "id": "uuid",
        "project_code": "PROJ00000001",
        "name": "Website Redesign",
        "description": "Complete redesign",
        "type": "project"
      }
    ],
    "tasks": [
      {
        "id": "uuid",
        "task_code": "TASK00000001",
        "title": "Implement login page",
        "description": "Create login UI",
        "type": "task"
      }
    ],
    "teams": [
      {
        "id": "uuid",
        "team_code": "TEAM00000001",
        "name": "Frontend Team",
        "project_name": "Website Redesign",
        "type": "team"
      }
    ]
  },
  "total_results": 25,
  "query": "login"
}
```

---

### Timeline/Deadline Endpoints

### 73. Get Upcoming Deadlines
**GET** `https://upea.onrender.com/api/deadlines/upcoming?days=7&user_id=uuid`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `days`: number (default: 7, look ahead days)
- `user_id`: string (optional, filter by user)

**Response:**
```json
{
  "deadlines": [
    {
      "id": "uuid",
      "type": "task",
      "title": "Implement login page",
      "code": "TASK00000001",
      "due_date": "2025-01-20T00:00:00.000Z",
      "days_remaining": 3,
      "priority": "high",
      "assigned_to": {
        "user_id": "uuid",
        "user_name": "John Doe"
      },
      "project": {
        "project_id": "uuid",
        "project_name": "Website Redesign"
      }
    }
  ],
  "summary": {
    "total_deadlines": 5,
    "overdue": 1,
    "due_today": 2,
    "due_this_week": 2
  }
}
```

---

### 74. Get Project Timeline
**GET** `https://upea.onrender.com/api/projects/:code/timeline?start_date=2025-01-01&end_date=2025-12-31`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `start_date`: ISO date string
- `end_date`: ISO date string

**Response:**
```json
{
  "project": {
    "project_id": "uuid",
    "project_code": "PROJ00000001",
    "project_name": "Website Redesign"
  },
  "timeline": {
    "milestones": [
      {
        "id": "uuid",
        "title": "Design Phase Complete",
        "date": "2025-02-15T00:00:00.000Z",
        "status": "completed",
        "description": "All UI/UX designs approved"
      }
    ],
    "tasks": [
      {
        "id": "uuid",
        "task_code": "TASK00000001",
        "title": "Implement login page",
        "start_date": "2025-01-15T00:00:00.000Z",
        "due_date": "2025-01-20T00:00:00.000Z",
        "status": "in_progress",
        "assigned_to": "John Doe"
      }
    ],
    "events": [
      {
        "id": "uuid",
        "title": "Sprint Planning",
        "date": "2025-01-22T09:00:00.000Z",
        "type": "meeting",
        "attendees": ["John Doe", "Jane Smith"]
      }
    ]
  }
}
```

---

### Google Calendar Integration

### 75. Connect Google Calendar
**POST** `https://upea.onrender.com/api/integrations/google-calendar/connect`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "auth_url": "https://accounts.google.com/oauth2/auth?..."
}
```

---

### 76. Google Calendar OAuth Callback
**GET** `https://upea.onrender.com/api/integrations/google-calendar/callback?code=...&state=...`

**Response:** Redirects to success page or returns:
```json
{
  "message": "Google Calendar connected successfully",
  "calendar_email": "user@gmail.com"
}
```

---

### 77. Sync Calendar Events
**POST** `https://upea.onrender.com/api/integrations/google-calendar/sync`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "sync_tasks": true,
  "sync_deadlines": true,
  "calendar_id": "primary"
}
```

**Response:**
```json
{
  "message": "Calendar sync completed",
  "synced_events": 15,
  "created_events": 5,
  "updated_events": 10
}
```

---

### 78. Get Calendar Events
**GET** `https://upea.onrender.com/api/integrations/google-calendar/events?start_date=2025-01-01&end_date=2025-01-31`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `start_date`: ISO date string
- `end_date`: ISO date string

**Response:**
```json
{
  "events": [
    {
      "id": "google_event_id",
      "title": "Sprint Planning",
      "start_time": "2025-01-22T09:00:00.000Z",
      "end_time": "2025-01-22T10:00:00.000Z",
      "description": "Weekly sprint planning meeting",
      "attendees": ["user@company.com"],
      "source": "google_calendar"
    }
  ],
  "total_events": 10
}
```

---

### Enhanced Project Manager Endpoints

### 79. Update Project Status
**PUT** `https://upea.onrender.com/api/project-manager/projects/:code/status`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "active",
  "reason": "All requirements finalized"
}
```

**Response:**
```json
{
  "id": "uuid",
  "project_code": "PROJ00000001",
  "name": "Website Redesign",
  "status": "active",
  "previous_status": "planning",
  "status_changed_at": "2025-01-15T10:00:00.000Z",
  "status_change_reason": "All requirements finalized",
  "updated_at": "2025-01-15T10:00:00.000Z"
}
```

---

## Summary

### Total Endpoints
- **Implemented**: 66 endpoints
- **Missing**: 13 endpoints
- **Total Required**: 79 endpoints

### Missing Endpoints by Category
- **Admin**: 2 endpoints (block/unblock user)
- **Notifications**: 3 endpoints
- **Search**: 1 endpoint
- **Timeline/Deadlines**: 2 endpoints
- **Google Calendar**: 4 endpoints
- **Enhanced PM**: 1 endpoint

### Implementation Priority
1. **Critical**: Block/unblock user, project status update
2. **High**: Notifications system, search functionality
3. **Medium**: Timeline/deadlines, Google Calendar integration

## Missing / Required Endpoints Checklist

| METHOD | ENDPOINT | ROLE | PURPOSE |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/admin/users/:id/unblock` | ADMIN | Unblock a user |
| **GET** | `/api/employee/profile` | ALL ROLES | Fetch logged-in user profile |
| **PATCH** | `/api/project-manager/projects/:id/archive` | PROJECT_MGR | Archive project |
| **PATCH** | `/api/project-manager/projects/:id/unarchive` | PROJECT_MGR | Unarchive project |
| **POST** | `/api/notifications/:id/approve` | PM, TEAM_LEAD | Approve request |
| **GET** | `/api/notifications` | ALL ROLES | Fetch notifications |
| **POST** | `/api/team-lead/teams/:teamCode/members/:userCode/observations` | TEAM_LEAD | Submit feedback |
| **GET** | `/api/project-manager/projects/deadlines` | PROJECT_MGR | Fetch upcoming project deadlines |
