/**
 * @swagger
 * /api/recommend/by-language-mood:
 *   get:
 *     summary: Get recommended songs by language and mood
 *     description: Returns recommended songs filtered by original language and mood type. Only includes approved and public processing.
 *     tags: [Recommendations]
 *     parameters:
 *       - in: query
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *           enum: [en, th, ko, ja, zh, es, fr, de, it, pt, ru, vi, id, ms, hi]
 *         description: Language code (e.g., 'en' for English, 'th' for Thai)
 *         example: "en"
 *       - in: query
 *         name: mood
 *         schema:
 *           type: string
 *         description: Mood type (optional)
 *         example: "happy"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Maximum number of songs to return
 *       - in: query
 *         name: excludeSongID
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Exclude this songID from results (e.g., current page song)
 *     responses:
 *       200:
 *         description: Recommended songs retrieved successfully
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
 *                   example: "Recommended songs retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     songs:
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
 *                           title:
 *                             type: string
 *                           artist:
 *                             type: string
 *                           genre:
 *                             type: string
 *                           duration:
 *                             type: integer
 *                           image:
 *                             type: string
 *                           originalLanguage:
 *                             type: string
 *                           moodType:
 *                             type: string
 *                           totalRatings:
 *                             type: integer
 *                           averageRating:
 *                             type: number
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: Bad request - missing or invalid parameters
 *       500:
 *         description: Server error
 */

