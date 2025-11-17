/**
 * @swagger
 * /api/history:
 *   get:
 *     summary: Get user history
 *     description: |
 *       Retrieve user's viewing and saving history with pagination support.
 *       Can filter by action type (view or save).
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: actionType
 *         schema:
 *           type: string
 *           enum: [view, save]
 *         description: Filter by action type. If not provided, returns all history.
 *     responses:
 *       200:
 *         description: User history retrieved successfully
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
 *                   example: "User history retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/UserHistoryResponse'
 *       401:
 *         description: Unauthorized - Authentication required
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
 *                   example: "Authentication required"
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
 *                   example: "Failed to retrieve user history"
 *                 errors:
 *                   type: string
 *                   example: "Error message"
 *
 * /api/history/save:
 *   post:
 *     summary: Save translation to history
 *     description: |
 *       Record a save translation action in user's history.
 *       This allows users to track which translations they have saved for later viewing.
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SaveTranslationRequest'
 *           example:
 *             songID: "84031827-4916-41a7-acfa-5539ba484bdd"
 *             processingID: "1c52b4f0-fc0f-4859-a743-c46106e31367"
 *     responses:
 *       200:
 *         description: Translation saved successfully
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
 *                   example: "Translation saved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SaveTranslationResponse'
 *       400:
 *         description: Bad request - Missing required fields
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
 *                   example: "songID and processingID are required"
 *       401:
 *         description: Unauthorized - Authentication required
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
 *                   example: "Authentication required"
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
 *                   example: "Failed to save translation"
 *                 errors:
 *                   type: string
 *                   example: "Error message"
 */

