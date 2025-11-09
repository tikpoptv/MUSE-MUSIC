/**
 * @swagger
 * /api/analysis/translate:
 *   post:
 *     summary: Translate lyrics (Legacy endpoint)
 *     description: Legacy endpoint for translating lyrics. Use /api/analysis/start for new implementations.
 *     tags: [Analysis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Hello world"
 *               targetLanguage:
 *                 type: string
 *                 example: "Thai"
 *     responses:
 *       200:
 *         description: Translation completed
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
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 *
 * /api/analysis/start:
 *   post:
 *     summary: Start AI analysis for a song
 *     description: Start AI processing for lyrics including translation, mood analysis, and summary generation. Works with or without authentication.
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lyricsRecord
 *               - actions
 *             properties:
 *               lyricsRecord:
 *                 type: object
 *                 required:
 *                   - id
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: External lyrics ID (if from external source)
 *                   songID:
 *                     type: string
 *                     format: uuid
 *                     description: Song ID (if internal song)
 *               actions:
 *                 type: object
 *                 required:
 *                   - translate
 *                   - mood
 *                 properties:
 *                   translate:
 *                     type: boolean
 *                     example: true
 *                     description: Enable translation
 *                   mood:
 *                     type: boolean
 *                     example: true
 *                     description: Enable mood analysis
 *               translationConfig:
 *                 type: object
 *                 required:
 *                   - targetLanguage
 *                 properties:
 *                   targetLanguage:
 *                     type: string
 *                     example: "Thai"
 *                     description: Target language for translation (required if translate is true)
 *     responses:
 *       200:
 *         description: Analysis started successfully
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
 *                   example: "Analysis started successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     songID:
 *                       type: string
 *                       format: uuid
 *                     processingID:
 *                       type: string
 *                       format: uuid
 *                     status:
 *                       type: string
 *                       example: "processing"
 *       400:
 *         description: Bad request - missing required fields or invalid configuration
 *       500:
 *         description: Server error
 *
 * /api/analysis/{processingID}/re-analyze:
 *   post:
 *     summary: Re-analyze an existing processing record
 *     description: Re-run AI analysis for an existing processing record. Updates the existing record instead of creating a new one.
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: processingID
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Processing ID of the record to re-analyze
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - actions
 *             properties:
 *               actions:
 *                 type: object
 *                 required:
 *                   - translate
 *                   - mood
 *                 properties:
 *                   translate:
 *                     type: boolean
 *                     example: true
 *                     description: Enable translation
 *                   mood:
 *                     type: boolean
 *                     example: true
 *                     description: Enable mood analysis
 *               translationConfig:
 *                 type: object
 *                 required:
 *                   - targetLanguage
 *                 properties:
 *                   targetLanguage:
 *                     type: string
 *                     example: "Thai"
 *                     description: Target language for translation (required if translate is true)
 *     responses:
 *       200:
 *         description: Re-analysis completed successfully
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
 *                   example: "Re-analysis completed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     processingID:
 *                       type: string
 *                       format: uuid
 *                     songID:
 *                       type: string
 *                       format: uuid
 *                     status:
 *                       type: string
 *                       example: "completed"
 *       400:
 *         description: Bad request - missing required fields or invalid configuration
 *       404:
 *         description: Processing record not found
 *       500:
 *         description: Server error
 */

