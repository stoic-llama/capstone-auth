import swaggerJsDoc from "swagger-jsdoc";

import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  userSchema,
} from "./schemas/auth.js";
import { userLookupSchema } from "./schemas/user.js";
import testModelSchema from "./schemas/testmodel.js";

export const definition = {
  openapi: "3.0.0",
  info: {
    title: "capstone-auth",
    version: "0.0.1",
    description: "A REST+JSON API service",
  },
  servers: [
    {
      url: "/api/v1",
      description: "API v1",
    },
  ],
  components: {
    schemas: {
      TestModel: testModelSchema,
      loginSchema,
      registerSchema,
      changePasswordSchema,
      userLookupSchema,
      User: userSchema,
    },
    securitySchemes: {
      BearerAuth: {
        type: "http",
        description: "Simple bearer token",
        scheme: "bearer",
        bearerFormat: "simple",
      },
    },
  },
};

const options = {
  definition,
  apis: ["./src/api/routes/*.js"],
};

const spec = swaggerJsDoc(options);

export default spec;
