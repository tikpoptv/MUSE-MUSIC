/**
 * @swagger
 * /api/songs/{songID}:
 *   get:
 *     summary: Get song details
 *     description: Fetch song details including lyrics and optional AI processing results
 *     tags: [Songs]
 *     parameters:
 *       - in: path
 *         name: songID
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Song ID
 *       - in: query
 *         name: processingID
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional processing ID to include AI analysis results
 *     responses:
 *       200:
 *         description: Song details retrieved successfully
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
 *                   example: "Song detail fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     song:
 *                       type: object
 *                       properties:
 *                         songID:
 *                           type: string
 *                           format: uuid
 *                         songName:
 *                           type: string
 *                         songNameEnglish:
 *                           type: string
 *                         artistName:
 *                           type: string
 *                         genre:
 *                           type: string
 *                         lyrics:
 *                           type: string
 *                         duration:
 *                           type: number
 *                         country:
 *                           type: string
 *                         language:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     processing:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         processingID:
 *                           type: string
 *                           format: uuid
 *                         songID:
 *                           type: string
 *                           format: uuid
 *                         status:
 *                           type: string
 *                           enum: [processing, completed, failed]
 *                         summary:
 *                           type: string
 *                         translation:
 *                           type: string
 *                         interpretation:
 *                           type: string
 *                         originalLanguage:
 *                           type: string
 *                         targetLanguage:
 *                           type: string
 *                         moodType:
 *                           type: string
 *                         moodScore:
 *                           type: number
 *                         totalRatings:
 *                           type: integer
 *                         averageRating:
 *                           type: number
 *                         starCount:
 *                           type: integer
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Bad request - invalid songID
 *       404:
 *         description: Song not found
 *       500:
 *         description: Server error
 *
 * /api/songs/{songID}/check-language:
 *   get:
 *     summary: Check if processing exists for a song by target language
 *     description: Check if there is an approved processing for a song with the specified target language
 *     tags: [Songs]
 *     parameters:
 *       - in: path
 *         name: songID
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Song ID
 *       - in: query
 *         name: targetLanguage
 *         required: true
 *         schema:
 *           type: string
 *           enum: [en, th, ko, ja, zh, es, fr, de, it, pt, ru, vi, id, ms, hi]
 *         description: Target language code
 *         example: "th"
 *     responses:
 *       200:
 *         description: Processing check completed
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
 *                   example: "Processing check completed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     exists:
 *                       type: boolean
 *                       example: true
 *                     processingID:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                     totalRatings:
 *                       type: integer
 *                     averageRating:
 *                       type: number
 *                       nullable: true
 *       400:
 *         description: Bad request - missing or invalid parameters
 *       404:
 *         description: Song not found
 *       500:
 *         description: Server error
 */

