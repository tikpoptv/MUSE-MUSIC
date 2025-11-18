/**
 * @swagger
 * /api/favorites:
 *   post:
 *     summary: Add song to favorites
 *     description: Add a song to user's favorites list. If already favorited, returns existing favorite.
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddFavoriteRequest'
 *           example:
 *             processingID: "11111111-2222-3333-4444-555555555555"
 *     responses:
 *       200:
 *         description: Favorite added successfully or already exists
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
 *                   example: "Favorite added successfully"
 *                 data:
 *                   $ref: '#/components/schemas/AddFavoriteResponse'
 *       400:
 *         description: Bad request - Missing songID
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Remove song from favorites
 *     description: Remove a song from user's favorites list
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RemoveFavoriteRequest'
 *           example:
 *             processingID: "11111111-2222-3333-4444-555555555555"
 *     responses:
 *       200:
 *         description: Favorite removed successfully
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
 *                   example: "Favorite removed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     removed:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request - Missing songID
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Favorite not found
 *       500:
 *         description: Internal server error
 *
 *   get:
 *     summary: Get user favorites
 *     description: Retrieve user's favorite songs with pagination support
 *     tags: [Favorites]
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
 *     responses:
 *       200:
 *         description: User favorites retrieved successfully
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
 *                   example: "User favorites retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/UserFavoritesResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 *
 * /api/favorites/check:
 *   get:
 *     summary: Check if song is favorited
 *     description: Check if a specific song is in user's favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: processingID
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Processing ID to check
 *     responses:
 *       200:
 *         description: Favorite status retrieved successfully
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
 *                   example: "Favorite status retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/CheckFavoriteResponse'
 *       400:
 *         description: Bad request - Missing songID
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */

