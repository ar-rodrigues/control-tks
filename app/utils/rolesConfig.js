// Role assignment matrix: which roles each user role can assign
export const ROLE_ASSIGNMENT_MATRIX = {
  ADMIN: [
    "ADMIN",
    "BACK-OFFICE",
    "AUDITOR",
    "RH",
    "DIRECCION",
    "OFFICE",
    "COORDINADOR",
    "AUDITOR-DICA",
  ],
  RH: ["AUDITOR", "OFFICE", "COORDINADOR"],
  "BACK-OFFICE": [],
  AUDITOR: [],
  DIRECCION: [],
  OFFICE: [],
  COORDINADOR: [],
  "AUDITOR-DICA": [],
};
