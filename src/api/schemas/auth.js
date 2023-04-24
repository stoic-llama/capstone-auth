/* Authentification */

export const loginSchema = {
  type: "object",
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string" },
  },
  required: ["email", "password"],
};

export const registerSchema = {
  type: "object",
  properties: {
    firstName: { type: "string" },
    lastName: { type: "string" },
    email: { type: "string", format: "email" },
    password: { type: "string" },
  },
  required: ["email", "password"],
};

export const changePasswordSchema = {
  type: "object",
  properties: {
    password: { type: "string" },
    required: ["password"],
  },
};

export const userSchema = {
  type: "object",
  properties: {
    email: { type: "string", format: "email" },
    token: { type: "string" },
    firstName: { type: "string" },
    lastName: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    lastLoginAt: { type: "string", format: "date-time" },
    isActive: { type: "boolean" },
  },
};
