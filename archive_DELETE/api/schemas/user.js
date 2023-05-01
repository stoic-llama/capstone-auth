/* User (for lookup) */

export const userLookupSchema = {
    type: "object",
    properties: {
      email: { type: "string", format: "email" },
    },
    required: ["email"],
};