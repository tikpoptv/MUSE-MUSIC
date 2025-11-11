/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Retrieve dashboard statistics including total users, songs, pending approvals, sessions, traffic data, and songs by mood. Requires admin or super_admin role.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *           minimum: 1
 *           maximum: 365
 *         description: Number of days for traffic data (default: 30)
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
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
 *                   example: "Dashboard data retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: integer
 *                           example: 232
 *                           description: Total number of users in the system
 *                         totalSongs:
 *                           type: integer
 *                           example: 3675
 *                           description: Total number of songs in the system
 *                         pendingApproval:
 *                           type: integer
 *                           example: 12
 *                           description: Number of songs pending approval
 *                         totalSessions:
 *                           type: integer
 *                           example: 128
 *                           description: Total number of active sessions
 *                     trafficData:
 *                       type: array
 *                       description: Traffic data grouped by date
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                             example: "2024-06-01"
 *                           traffic:
 *                             type: integer
 *                             example: 385
 *                             description: Number of sessions on this date
 *                     songsByMood:
 *                       type: array
 *                       description: Number of songs grouped by mood
 *                       items:
 *                         type: object
 *                         properties:
 *                           mood:
 *                             type: string
 *                             example: "Happy"
 *                             description: Mood type
 *                           songs:
 *                             type: integer
 *                             example: 186
 *                             description: Number of songs with this mood
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions (admin or super_admin required)
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

