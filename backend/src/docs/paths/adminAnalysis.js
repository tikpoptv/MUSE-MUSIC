/**
 * @swagger
 * /api/admin/analysis:
 *   get:
 *     summary: Get admin analysis data
 *     description: Retrieve analysis data including total songs, mood statistics, rating statistics, suggestions, and sub-mood data. Requires admin or super_admin role.
 *     tags: [Admin Analysis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analysis data retrieved successfully
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
 *                     totalSongs:
 *                       type: integer
 *                       example: 3675
 *                       description: Total number of approved songs
 *                     moodStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: "Happy"
 *                           value:
 *                             type: integer
 *                             example: 1120
 *                     feedbackCount:
 *                       type: integer
 *                       example: 24
 *                       description: Total number of user feedback/ratings
 *                     averageRating:
 *                       type: number
 *                       format: float
 *                       example: 4.5
 *                       description: Average rating (0-5)
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           processingID:
 *                             type: string
 *                             format: uuid
 *                           songName:
 *                             type: string
 *                             example: "Song Title"
 *                           rating:
 *                             type: number
 *                             format: float
 *                             example: 4.5
 *                           comment:
 *                             type: string
 *                             example: "Great song!"
 *                           date:
 *                             type: string
 *                             format: date
 *                             example: "2025-01-15"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     subMoodData:
 *                       type: object
 *                       description: Sub-mood statistics grouped by main mood
 *                       additionalProperties:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "Joyful"
 *                             value:
 *                               type: integer
 *                               example: 95
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User does not have admin role
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to retrieve analysis data"
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 errors:
 *                   type: string
 */

