/**
 * @swagger
 * /api/setup/status:
 *   get:
 *     summary: Get user setup status
 *     description: Returns the setup completion status for all steps and overall status
 *     tags: [Setup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Setup status retrieved successfully
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
 *                     allStatus:
 *                       type: boolean
 *                       description: Overall setup completion status
 *                       example: false
 *                     stepStatus:
 *                       type: object
 *                       properties:
 *                         step1:
 *                           type: boolean
 *                           description: Password setup completion (Google users only)
 *                           example: true
 *                         step2:
 *                           type: boolean
 *                           description: Birthday setup completion
 *                           example: true
 *                         step3:
 *                           type: boolean
 *                           description: Country, timezone, language setup completion
 *                           example: false
 *                         step4:
 *                           type: boolean
 *                           description: Music genres setup completion
 *                           example: false
 *                     stepData:
 *                       type: object
 *                       description: User data for each step
 *                       properties:
 *                         step1:
 *                           type: object
 *                           properties:
 *                             hasPassword:
 *                               type: boolean
 *                               example: true
 *                         step2:
 *                           type: object
 *                           properties:
 *                             birthday:
 *                               type: string
 *                               format: date
 *                               example: "1995-06-15"
 *                         step3:
 *                           type: object
 *                           properties:
 *                             country:
 *                               type: string
 *                               example: "Thailand"
 *                             timezone:
 *                               type: string
 *                               example: "Asia/Bangkok"
 *                             language:
 *                               type: string
 *                               example: "th"
 *                         step4:
 *                           type: object
 *                           properties:
 *                             genres:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["Pop", "Rock", "Jazz"]
 *                     setupCompleted:
 *                       type: boolean
 *                       description: Database setup_completed flag
 *                       example: false
 *                     setupSkipped:
 *                       type: boolean
 *                       description: Database setup_skipped flag
 *                       example: false
 *                     provider:
 *                       type: string
 *                       description: User authentication provider
 *                       example: "google"
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
