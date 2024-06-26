import { Router } from "express";

import UserService from "../../services/user.js";
import urls from "../urls.js";
// import { requireUser } from "../middlewares/auth.js";
import { requireSchema } from "../middlewares/validate.js";
import {
  registerSchema,
  changePasswordSchema,
  loginSchema,
} from "../schemas/auth.js";

const router = Router();

/** @swagger
 *
 * tags:
 *   name: Authentication
 *   description: User authentication API
 *
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Authenticate with the service
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/loginSchema'
 *     responses:
 *       200:
 *         description: Successful login, with user details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request, incorrect login credentials
 */
router.post(urls.auth.login, requireSchema(loginSchema), async (req, res) => {
  const { email, password } = req.validatedBody;

  const user = await UserService.authenticateWithPassword(email, password);

  if (user) {
    res.json({ user });
  } else {
    res.status(401).json({ error: "Authentication failed" });
  }
});

router.get(urls.auth.login, (req, res) => {
  res.status(405).json({ error: "Login with POST instead" });
});

/** @swagger
 *
 * /auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register with the service
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/registerSchema'
 *     responses:
 *       201:
 *         description: Successful registration, with user details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request, registration failed
 */
router.post(
  urls.auth.register,
  requireSchema(registerSchema),
  async (req, res, next) => {
    if (req.user) {
      res.json({ message: "user exists"}); // user: req.user });
      return;
    }

    try {
      const user = await UserService.createUser(req.validatedBody);
      res.status(201).json({ user });
    } catch (error) {
      if (error.isClientError()) {
        res.status(400).json({ error });
      } else {
        next(error);
      }
    }
  }
);

// all auth routes after this can rely on existence of req.user
// router.use(requireUser);

/** @swagger
 *
 * /auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Log out of the service - invalidate auth token
 *     responses:
 *       200:
 *         description: Successful logout, token invalidated
 */
router.post(urls.auth.logout, async (req, res) => {
  const authHeader = req.get("Authorization");
  
  console.log("authHeader: " + authHeader)

  if (authHeader) {
    const m = authHeader.match(/^(Token|Bearer) (.+)/i);
    if (m) {
      await UserService.authenticateWithToken(m[2])
        .then( async (user) => {
          await UserService.regenerateToken(user);
          console.log(user.firstName + " " + user.lastName + " logged out successfully")
          // note status 204 does not contain body, so changing 204 to 200 here
          res.status(200).json({ message: "Logout successful" });
      }).catch(() => {
        res.status(401).json({ error: "You don't have a valid token" });
      });
    }
  } else {
    res.status(401).json({ error: "Cannot logout without a valid Authorization Bearer token." });
  }  
});

router.get(urls.auth.logout, (req, res) => {
  res.status(405).json({ error: "Logout with POST instead" });
});


router.post(
  urls.auth.changePassword,
  requireSchema(changePasswordSchema),
  async (req, res) => {
    const { password } = req.validatedBody;

    await UserService.setPassword(req.user, password.toString());
    res.status(204).send();
  }
);

export default router;
