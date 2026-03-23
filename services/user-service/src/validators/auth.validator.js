const { z } = require('zod');

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  device_id: z.string().min(8).max(128),
});

module.exports = { registerSchema, loginSchema };
