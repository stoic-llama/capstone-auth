/* User (for lookup) */

export const userLookupSchema = {
    type: "object",
    properties: {
      email: { type: "string", format: "email" },
    },
    required: ["email"],
};

export const updateProfileSchema = {
  type: "object",
  properties: {
    firstName: { type: "string" },
    lastName: { type: "string" },
    password: { type: "string" },
  },
};