import { z } from 'zod';

export const createAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  psychologistId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
