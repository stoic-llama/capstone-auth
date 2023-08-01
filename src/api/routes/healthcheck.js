import { Router } from "express";

const router = Router();

/** @swagger
 *
 * tags:
 *   name: Healthcheck
 *   description: Healthcheck API
 *
 * /healthcheck:
 *   get:
 *     tags: [Healthcheck]
 *     summary: Validate availability of application
 *     responses:
 *       200:
 *         description: Sends OK if successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: ''
 */
router.get("/", async (req, res) => {  
    try {
        res.status(200).json({
            name: 'capstone-auth',
            message: 'OK',
            uptime: Math.floor(process.uptime()) + " seconds",
            timestamp: new Date(Date.now()).toString() 
        });
    } catch (error) {
        res.status(500).json({
            name: 'capstone-auth',
            message: error.message,
            uptime: Math.floor(process.uptime()) + " seconds",
            timestamp: new Date(Date.now()).toString() 
        });
    }
});

export default router;