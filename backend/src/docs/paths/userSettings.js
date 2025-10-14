/**
 * @swagger
 * /api/user/settings:
 *   get:
 *     summary: Get user settings data
 *     description: Fetch user settings information for account/settings page
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User settings retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     settings:
 *                       type: object
 *                       properties:
 *                         username:
 *                           type: string
 *                           example: "john_doe"
 *                         email:
 *                           type: string
 *                           example: "john@example.com"
 *                         fullName:
 *                           type: string
 *                           example: "John Doe"
 *                         profilePicture:
 *                           type: string
 *                           nullable: true
 *                           example: "/uploads/profile.jpg"
 *                         country:
 *                           type: string
 *                           example: "Thailand"
 *                         timezone:
 *                           type: string
 *                           example: "Asia/Bangkok"
 *                         language:
 *                           type: string
 *                           example: "English"
 *                         provider:
 *                           type: string
 *                           enum: [google, local]
 *                           example: "google"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
