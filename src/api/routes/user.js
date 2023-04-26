import { Router } from "express";

import UserService from "../../services/user.js";
import urls from "../urls.js";
import { requireSchema } from "../middlewares/validate.js";
import { userLookupSchema } from "../schemas/user.js";

const router = Router();

/** @swagger
 *
 * tags:
 *   name: User
 *   description: User General Services API
 *
 * /user/lookup:
 *   post:
 *     tags: [User]
 *     summary: Validate existence of user with the service
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/userLookupSchema'
 *     responses:
 *       200:
 *         description: Successful lookup, with user details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request, incorrect user lookup metadata
 */
router.post(urls.user.lookup, requireSchema(userLookupSchema), async (req, res) => {
  const { email } = req.validatedBody;

  const user = await UserService.getByEmail(email);

  if (user) {
    res.json({ user });
  } else {
    res.status(401).json({ error: "Email not found" });
  }
});

router.get(urls.auth.login, (req, res) => {
  res.status(405).json({ error: "Validate Email with POST instead" });
});

export default router;