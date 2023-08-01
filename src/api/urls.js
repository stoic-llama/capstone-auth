export default {
  apiPrefix: "/api/v1",
  swagger: {
    path: "/api/docs",
    spec: "openapi.json",
  },
  auth: {
    path: "/auth",
    login: "/login",
    logout: "/logout",
    changePassword: "/password",
    register: "/register",
  },
  user: {
    path: "/user",
    lookup: "/lookup",
    edit: "/edit",
  },
  healthcheck: {
    path: "/healthcheck",
  }
};
