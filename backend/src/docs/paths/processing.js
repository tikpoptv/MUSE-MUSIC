/**
 * @swagger
 * /api/processing/{processingID}/youtube-video-id:
 *   put:
 *     summary: Update YouTube video ID for a processing record
 *     description: Update the YouTube video ID associated with a processing record. Authentication is optional.
 *     tags: [Processing]
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
 *               - youtubeVideoId
 *             properties:
 *               youtubeVideoId:
 *                 type: string
 *                 example: "dQw4w9WgXcQ"
 *                 description: YouTube video ID
 *     responses:
 *       200:
 *         description: YouTube video ID updated successfully
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
 *                   example: "YouTube video ID updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     processingID:
 *                       type: string
 *                       format: uuid
 *                     youtubeVideoId:
 *                       type: string
 *                       example: "dQw4w9WgXcQ"
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
 * /api/processing/{processingID}/cover-image:
 *   put:
 *     summary: Update cover image for a processing record
 *     description: Update the cover image URL for a processing record. Authentication is optional.
 *     tags: [Processing]
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
 *               - coverImageUrl
 *             properties:
 *               coverImageUrl:
 *                 type: string
 *                 example: "/uploads/cover-image.jpg"
 *                 description: Cover image URL or path
 *     responses:
 *       200:
 *         description: Cover image updated successfully
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
 *                   example: "Cover image updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     processingID:
 *                       type: string
 *                       format: uuid
 *                     coverImageUrl:
 *                       type: string
 *                       example: "/uploads/cover-image.jpg"
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
 * /api/processing/{processingID}/sync-settings:
 *   put:
 *     summary: Update sync settings for a processing record
 *     description: Update synchronization settings (syncConfirmed, songStartTime) for a processing record. Authentication is optional.
 *     tags: [Processing]
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
 *             properties:
 *               syncConfirmed:
 *                 type: boolean
 *                 example: true
 *                 description: Whether the sync is confirmed as correct
 *               songStartTime:
 *                 type: number
 *                 nullable: true
 *                 example: 5.5
 *                 description: Time offset in seconds where the song actually starts
 *     responses:
 *       200:
 *         description: Sync settings updated successfully
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
 *                   example: "Sync settings updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     processingID:
 *                       type: string
 *                       format: uuid
 *                     syncConfirmed:
 *                       type: boolean
 *                       example: true
 *                     songStartTime:
 *                       type: number
 *                       nullable: true
 *                       example: 5.5
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
 */

