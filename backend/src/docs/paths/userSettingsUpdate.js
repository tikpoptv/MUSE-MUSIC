/**
 * @swagger
 * /api/user/settings:
 *   put:
 *     summary: Update user settings
 *     description: Update user settings information for account/settings page
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: []
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *                 description: "User's username (optional)"
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *                 description: "User's email address (optional)"
 *               fullName:
 *                 type: string
 *                 example: "John Doe"
 *                 description: "User's full name (optional)"
 *               country:
 *                 type: string
 *                 example: "Thailand"
 *                 description: "User's country (optional)"
 *               timezone:
 *                 type: string
 *                 example: "Asia/Bangkok"
 *                 description: "User's timezone (optional)"
 *               language:
 *                 type: string
 *                 example: "English"
 *                 description: "User's preferred language (optional)"
 *     responses:
 *       200:
 *         description: User settings updated successfully
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
 *                   example: "User settings updated successfully"
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
 *       400:
 *         description: Bad request - Username already taken or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
