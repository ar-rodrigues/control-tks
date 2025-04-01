export const workSessions = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000", //uuid
    profile_id: "123e4567-e89b-12d3-a456-426614174000", //foreign key to profile table
    check_in: "2025-03-31T08:00:00Z", //timestampz
    check_in_location: { lat: 40.7128, lng: -74.006 }, //geopoint
    check_out: "2025-03-31T17:00:00Z", //timestampz
    check_out_location: { lat: 40.7128, lng: -74.0065 }, //geopoint
    total_hours: "09:00:00", //interval
    created_at: "2025-03-31T08:00:00Z", //timestampz
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    profile_id: "123e4567-e89b-12d3-a456-426614174001",
    check_in: "2025-03-31T09:15:00Z",
    check_in_location: { lat: 34.0522, lng: -118.2437 },
    check_out: "2025-03-31T18:00:00Z",
    check_out_location: { lat: 34.0522, lng: -118.2435 },
    total_hours: "08:45:00",
    created_at: "2025-03-31T09:15:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    profile_id: "123e4567-e89b-12d3-a456-426614174002",
    check_in: "2025-03-31T10:00:00Z",
    check_in_location: { lat: 34.0522, lng: -118.2437 },
    check_out: "2025-03-31T19:00:00Z",
    check_out_location: { lat: 34.0522, lng: -118.2435 },
    total_hours: "09:00:00",
    created_at: "2025-03-31T10:00:00Z",
  },
];

export const adminWorkSessions = [
  {
    work_session_date: "2025-03-31",
    employees_sessions: [
      {
        id: "550e8400-e29b-41d4-a716-446655440000", //uuid
        profile_id: "123e4567-e89b-12d3-a456-426614174000", //foreign key to profile table
        profile_name: "John Doe",
        work_session_date: "2025-03-31",
        first_check_in: "2025-03-31T08:00:00Z", //timestampz
        first_check_in_location: { lat: 40.7128, lng: -74.006 }, //geopoint
        last_check_out: "2025-03-31T17:00:00Z", //timestampz
        last_check_out_location: { lat: 40.7128, lng: -74.0065 }, //geopoint
        total_hours: "09:00:00", //interval
        sessions: [
          {
            id: "550e8400-e29b-41d4-a716-446655440001",
            check_in: "2025-03-31T08:00:00Z",
            check_in_location: { lat: 40.7128, lng: -74.006 },
            check_out: "2025-03-31T17:00:00Z",
            check_out_location: { lat: 40.7128, lng: -74.0065 },
            total_hours: "09:00:00",
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440002",
            check_in: "2025-03-31T08:00:00Z",
            check_in_location: { lat: 40.7128, lng: -74.006 },
            check_out: "2025-03-31T17:00:00Z",
            check_out_location: { lat: 40.7128, lng: -74.0065 },
          },
        ],
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440001", //uuid
        profile_id: "123e4567-e89b-12d3-a456-426614174001", //foreign key to profile table
        profile_name: "Jane Doe",
        work_session_date: "2025-03-31",
        first_check_in: "2025-03-31T08:00:00Z", //timestampz
        first_check_in_location: { lat: 40.7128, lng: -74.006 }, //geopoint
        last_check_out: "2025-03-31T17:00:00Z", //timestampz
        last_check_out_location: { lat: 40.7128, lng: -74.0065 }, //geopoint
        total_hours: "09:00:00", //interval
        sessions: [
          {
            id: "550e8400-e29b-41d4-a716-446655440001",
            check_in: "2025-03-31T08:00:00Z",
            check_in_location: { lat: 40.7128, lng: -74.006 },
            check_out: "2025-03-31T17:00:00Z",
            check_out_location: { lat: 40.7128, lng: -74.0065 },
            total_hours: "09:00:00",
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440002",
            check_in: "2025-03-31T08:00:00Z",
            check_in_location: { lat: 40.7128, lng: -74.006 },
            check_out: "2025-03-31T17:00:00Z",
            check_out_location: { lat: 40.7128, lng: -74.0065 },
          },
        ],
      },
    ],
  },
];
