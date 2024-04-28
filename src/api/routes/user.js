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
 *         description: Sends null if new user, else send user back
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.post(urls.user.lookup, requireSchema(userLookupSchema), async (req, res) => {
  
  const { email } = req.validatedBody;
  
  const user = await UserService.getByEmail(email);
  
  res.status(200).json({ user });

  // Introduce an error to exit unexpectedly for the demo
  // throw new Error('🍌🍌🍌 Unexpected error occurred 🍌🍌🍌.');
});

router.get(urls.user.lookup, (req, res) => {
  res.status(405).json({ error: "Validate Email with POST instead" });
});


/** @swagger
 *
 * tags:
 *   name: User
 *   description: User General Services API
 *
 * /user/edit:
 *   post:
 *     tags: [User]
 *     summary: Edit user profile 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/updateProfileSchema'
 *     responses:
 *       200:
 *         description: Send user back
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.post(urls.user.edit, async (req, res) => {
  const authHeader = req.get("Authorization");
  console.log("authHeader: " + authHeader)

  if (authHeader) {
    const m = authHeader.match(/^(Token|Bearer) (.+)/i);
    if (m) {
      await UserService.authenticateWithToken(m[2])
        .then((user) => {
          console.log("req: " + req.body.firstName)
          console.log("req: " + req.body.lastName)
          console.log("req: " + req.body.password)

          user.firstName = req.body.firstName
          user.lastName = req.body.lastName          
          UserService.setPassword(user, req.body.password); 
          user.save();
          res.status(200).json(user);
        })
    } 
    else {
      res.status(400).json({message: "Bad user input."})
    } 
  }
});

router.get(urls.user.edit, (req, res) => {
  res.status(405).json({ error: "Update user profile with POST instead" });
});


export default router;