# Work Sessions Feature

This feature allows employees to check in at the beginning of their work day and check out at the end, with automatic location tracking and work hours calculation.

## Setup Instructions

### 1. Database Setup in Supabase

Run the SQL in the `work_sessions_table.sql` file in your Supabase SQL Editor. This will:

- Create the `work_sessions` table
- Set up appropriate indexes
- Configure Row Level Security (RLS) policies
- Create a trigger to automatically calculate total hours worked

### 2. API Integration

The API endpoints are located in `app/api/work-sessions/route.js` and provide the following functionality:

- `GET /api/work-sessions`: Retrieves the current active work session or most recent session for today
- `POST /api/work-sessions`: Performs a check-in operation
- `PATCH /api/work-sessions`: Performs a check-out operation

### 3. Usage

The home page has been updated to integrate with these API endpoints. When a user logs in:

1. The system checks if they have an active work session for today
2. If they have an active session, the "CHECK OUT" button will be displayed
3. If they don't have an active session, the "CHECK IN" button will be displayed
4. Check-in and check-out times and total hours worked are displayed in the UI

## Features

- **Location Tracking**: Records the geographic location at check-in and check-out
- **Work Hours Calculation**: Automatically calculates and displays total hours worked
- **User Authentication**: All operations require authentication and users can only access their own work sessions
- **Admin Access**: Admins can view all work sessions
- **Real-time UI Updates**: The UI updates in real-time when operations are performed

## Data Structure

The `work_sessions` table has the following structure:

- `id`: UUID (Primary Key)
- `employee_id`: UUID (Foreign Key to auth.users)
- `check_in`: TIMESTAMPTZ (When the employee checked in)
- `check_in_location`: JSONB (Geographic location at check-in)
- `check_out`: TIMESTAMPTZ (When the employee checked out, null if still active)
- `check_out_location`: JSONB (Geographic location at check-out)
- `total_hours`: TEXT (Total hours worked in HH:MM:SS format)
- `created_at`: TIMESTAMPTZ (When the record was created)

## Common Issues

- **Location Services**: Ensure location services are enabled in the browser for accurate location tracking
- **Active Sessions**: A user can only have one active session at a time
- **Session Persistence**: If a user closes the browser after checking in, they'll still be shown as checked in when they return

## Notes for Admins

Admins can access all work sessions in the database. A future admin panel for viewing and managing work sessions can be implemented by:

1. Creating a new API endpoint for fetching all work sessions
2. Building a UI to display and filter this data
3. Adding functionality to edit or delete work sessions if needed
