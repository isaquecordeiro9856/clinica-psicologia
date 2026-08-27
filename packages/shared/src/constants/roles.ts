export const ROLES = {
  PATIENT: 'patient',
  PSYCHOLOGIST: 'psychologist',
  SECRETARY: 'secretary',
  ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const APPOINTMENT_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
  COMPLETED: 'completed',
} as const;
