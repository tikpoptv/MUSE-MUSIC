/**
 * @swagger
 * /api/share/create:
 *   post:
 *     summary: Create a share link for a processing record
 *     description: Generate a short link for sharing a processing record. If a share link already exists, returns the existing link. Authentication is optional.
 *     tags: [Share]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - processingID
 *             properties:
 *               processingID:
 *                 type: string
 *                 format: uuid
 *                 example: "939b28cc-b513-43fb-b13c-a2260e1e8ead"
 *                 description: Processing ID to create share link for
 *     responses:
 *       200:
 *         description: Share link created or already exists
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
 *                   example: "Share link created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     processingID:
 *                       type: string
 *                       format: uuid
 *                       example: "939b28cc-b513-43fb-b13c-a2260e1e8ead"
 *                     shortLink:
 *                       type: string
 *                       example: "a1b2c3d4e5f6"
 *                       description: Short link code (12 characters)
 *                     shareUrl:
 *                       type: string
 *                       example: "http://localhost:3000/share/a1b2c3d4e5f6"
 *                       description: Full share URL
 *                     alreadyExists:
 *                       type: boolean
 *                       example: false
 *                       description: Whether the share link already existed
 *       400:
 *         description: Bad request - missing or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Processing record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/share/{shortLink}:
 *   get:
 *     summary: Get processing details by share link
 *     description: Retrieve processing details using a share link. Only returns publicly approved processing records.
 *     tags: [Share]
 *     parameters:
 *       - in: path
 *         name: shortLink
 *         required: true
 *         schema:
 *           type: string
 *           example: "a1b2c3d4e5f6"
 *         description: Short link code (12 characters)
 *     responses:
 *       200:
 *         description: Processing retrieved successfully
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
 *                   example: "Processing retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     processing:
 *                       type: object
 *                       properties:
 *                         processingID:
 *                           type: string
 *                           format: uuid
 *                         songID:
 *                           type: string
 *                           format: uuid
 *                         songName:
 *                           type: string
 *                         artistName:
 *                           type: string
 *                         genre:
 *                           type: string
 *                         duration:
 *                           type: integer
 *                         lyrics:
 *                           type: string
 *                         syncedLyrics:
 *                           type: string
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
 *                         mood:
 *                           type: object
 *                           nullable: true
 *                           properties:
 *                             type:
 *                               type: string
 *                               example: "Happy"
 *                             percentage:
 *                               type: number
 *                               example: 45.5
 *                         totalRatings:
 *                           type: integer
 *                         averageRating:
 *                           type: number
 *                         starCount:
 *                           type: integer
 *                         coverImage:
 *                           type: string
 *                         youtubeVideoId:
 *                           type: string
 *                         syncConfirmed:
 *                           type: boolean
 *                         songStartTime:
 *                           type: number
 *                           nullable: true
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Bad request - missing or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Processing not found or not publicly shared
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

