/**
 * @swagger
 * /api/ratings/{processingID}:
 *   post:
 *     summary: Submit or update a rating for a processing
 *     description: Submit a rating (1-5 stars) and optional comment for an AI processing result. Requires authentication. If rating exists, it will be updated.
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: processingID
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Processing ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *                 description: Rating value (1-5 stars)
 *               comment:
 *                 type: string
 *                 example: "Great translation and mood analysis!"
 *                 description: Optional comment or feedback
 *     responses:
 *       200:
 *         description: Rating submitted successfully
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
 *                   example: "Rating submitted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     ratingID:
 *                       type: string
 *                       format: uuid
 *                     processingID:
 *                       type: string
 *                       format: uuid
 *                     userID:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                     rating:
 *                       type: integer
 *                       example: 5
 *                     comment:
 *                       type: string
 *                       nullable: true
 *                     feedback:
 *                       type: string
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - invalid rating or missing processingID
 *       404:
 *         description: Processing not found
 *       500:
 *         description: Server error
 *
 * /api/ratings/{processingID}/stats:
 *   get:
 *     summary: Get rating statistics for a processing
 *     description: Get aggregated rating statistics (total ratings, average rating, star count) for a processing result
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: processingID
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Processing ID
 *     responses:
 *       200:
 *         description: Rating statistics retrieved successfully
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
 *                   example: "Rating statistics fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRatings:
 *                       type: integer
 *                       example: 42
 *                       description: Total number of ratings
 *                     averageRating:
 *                       type: number
 *                       format: float
 *                       example: 4.5
 *                       description: Average rating (0.00-5.00)
 *                     starCount:
 *                       type: integer
 *                       example: 5
 *                       description: Rounded average rating (0-5 stars)
 *       400:
 *         description: Bad request - missing processingID
 *       500:
 *         description: Server error
 *
 * /api/ratings/{processingID}/user:
 *   get:
 *     summary: Get user's rating for a processing
 *     description: Get the authenticated user's rating for a specific processing result
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: processingID
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Processing ID
 *     responses:
 *       200:
 *         description: User rating retrieved successfully
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
 *                   example: "User rating fetched successfully"
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     ratingID:
 *                       type: string
 *                       format: uuid
 *                     processingID:
 *                       type: string
 *                       format: uuid
 *                     userID:
 *                       type: string
 *                       format: uuid
 *                     rating:
 *                       type: integer
 *                       example: 5
 *                     comment:
 *                       type: string
 *                       nullable: true
 *                     feedback:
 *                       type: string
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - authentication required
 *       400:
 *         description: Bad request - missing processingID
 *       500:
 *         description: Server error
 */

