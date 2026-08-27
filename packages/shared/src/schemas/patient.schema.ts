import { z } from 'zod';

export const createPatientSchema = z.object({
  name: z.string().min(2).max(120),
  cpf: z
    .string()
    .regex(/^\d{11}$/, 'CPF deve ter 11 dígitos')
    .optional()
    .or(z.literal('')),
  phone: z.string().min(10).max(20).optional(),
  email: z.string().email().optional().or(z.literal('')),
  birthDate: z.string().optional(),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
