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

const updateProfileSchema = z
  .object({
    full_name: z.string().trim().min(2).max(100).optional(),
    current_password: z.string().min(6).optional(),
    new_password: z.string().min(6).optional(),
  })
  .refine(
    (data) => {
      if (data.new_password) {
        return Boolean(data.current_password);
      }
      return true;
    },
    {
      message: 'current_password is required when changing password',
      path: ['current_password'],
    }
  );

module.exports = { registerSchema, loginSchema, updateProfileSchema };
