// Role assignment matrix: which roles each user role can assign
export const ROLE_ASSIGNMENT_MATRIX = {
  ADMIN: ["ADMIN", "BACK-OFFICE", "AUDITOR", "RH", "DIRECCION", "OFFICE"],
  RH: ["AUDITOR", "OFFICE"],
  "BACK-OFFICE": [],
  AUDITOR: [],
  DIRECCION: [],
  OFFICE: [],
};
