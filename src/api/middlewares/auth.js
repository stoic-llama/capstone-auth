import UserService from "../../services/user.js";

export const authenticateWithToken = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (authHeader) {
    const m = authHeader.match(/^(Token|Bearer) (.+)/i);
    if (m) {
      UserService.authenticateWithToken(m[2])
        .then((user) => {
          req.user = user;
          next();
        })
        .catch(() => {
          res.status(401).json({ error: "You don't have a valid token" });
          return;
        });
      return;
    }
  }

  next();
};

export const requireUser = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ error: "You don't have access to this resource" });
    return;
  }

  next();
};