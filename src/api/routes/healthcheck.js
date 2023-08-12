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
            timestamp: formattedDateNow() // new Date(Date.now()).toString() 
        });
    } catch (error) {
        res.status(500).json({
            name: 'capstone-auth',
            message: error.message,
            uptime: Math.floor(process.uptime()) + " seconds",
            timestamp: formattedDateNow() // new Date(Date.now()).toString() 
        });
    }
});

function formattedDateNow() {
    var result = "" 
    var d = new Date(Date.now())
 
    // format ---> 'YYYY/MM/D hh:mm:ss SSS'
 
    result = result + d.getFullYear()
             + "/"
             + (d.getMonth()+1)
             + "/"
             + d.getDate().toString().padStart(2,0) 
             + " "
             + d.getHours().toString().padStart(2,0)
             + ":"
             + d.getMinutes().toString().padStart(2,0)
             + ":"
             + d.getSeconds().toString().padStart(2,0)
             + "."
             + d.getMilliseconds().toString().padStart(3,0)
 
    return result;
 }


export default router;