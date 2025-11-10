/**
 * @swagger
 * /api/user/me:
 *   get:
 *     summary: Get current user data
 *     description: Fetch complete user information including setup status and preferences
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         userID:
 *                           type: string
 *                           example: "123"
 *                         username:
 *                           type: string
 *                           example: "john_doe"
 *                         email:
 *                           type: string
 *                           example: "john@example.com"
 *                         fullName:
 *                           type: string
 *                           example: "John Doe"
 *                         provider:
 *                           type: string
 *                           enum: [google, local]
 *                           example: "google"
 *                         setupCompleted:
 *                           type: boolean
 *                           example: false
 *                         setupSkipped:
 *                           type: boolean
 *                           example: false
 *                         allStatus:
 *                           type: boolean
 *                           example: false
 *                         stepStatus:
 *                           type: object
 *                           properties:
 *                             step1:
 *                               type: boolean
 *                               example: true
 *                             step2:
 *                               type: boolean
 *                               example: false
 *                             step3:
 *                               type: boolean
 *                               example: false
 *                             step4:
 *                               type: boolean
 *                               example: false
 *                         stepData:
 *                           type: object
 *                           properties:
 *                             step1:
 *                               type: object
 *                               nullable: true
 *                               properties:
 *                                 hasPassword:
 *                                   type: boolean
 *                                   example: true
 *                             step2:
 *                               type: object
 *                               nullable: true
 *                               properties:
 *                                 birthday:
 *                                   type: string
 *                                   format: date
 *                                   example: "1990-01-15"
 *                             step3:
 *                               type: object
 *                               nullable: true
 *                               properties:
 *                                 country:
 *                                   type: string
 *                                   example: "Thailand"
 *                                 timezone:
 *                                   type: string
 *                                   example: "Asia/Bangkok"
 *                                 language:
 *                                   type: string
 *                                   example: "English"
 *                             step4:
 *                               type: object
 *                               nullable: true
 *                               properties:
 *                                 genres:
 *                                   type: array
 *                                   items:
 *                                     type: string
 *                                   example: ["Pop", "Rock", "Jazz"]
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-15T10:30:00Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-15T10:30:00Z"
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
 *
 * /api/user/reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Change the user's password. Requires current password for verification.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: "OldPassword123!"
 *                 description: Current password for verification
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "NewPassword123!"
 *                 description: New password (must be at least 8 characters and different from current password)
 *     responses:
 *       200:
 *         description: Password reset successfully
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
 *                   example: "Password reset successfully"
 *       400:
 *         description: Bad request - missing fields, password too short, or passwords are the same
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token, or incorrect current password
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
