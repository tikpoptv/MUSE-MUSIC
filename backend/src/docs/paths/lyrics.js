/**
 * @swagger
 * /api/lyrics/search:
 *   get:
 *     summary: Search for lyrics
 *     description: Search for lyrics using query parameters
 *     tags: [Lyrics]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query (at least one of q or track_name required)
 *       - in: query
 *         name: track_name
 *         schema:
 *           type: string
 *         description: Track name (at least one of q or track_name required)
 *       - in: query
 *         name: artist_name
 *         schema:
 *           type: string
 *         description: Artist name (optional)
 *       - in: query
 *         name: album_name
 *         schema:
 *           type: string
 *         description: Album name (optional)
 *     responses:
 *       200:
 *         description: Lyrics search results
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
 *                   example: "Lyrics search results"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Validation error - at least one of q or track_name is required
 *       500:
 *         description: Server error
 *
 * /api/lyrics/get:
 *   get:
 *     summary: Get lyrics by metadata
 *     description: Fetch lyrics using track metadata (all fields required)
 *     tags: [Lyrics]
 *     parameters:
 *       - in: query
 *         name: track_name
 *         required: true
 *         schema:
 *           type: string
 *         description: Track name
 *       - in: query
 *         name: artist_name
 *         required: true
 *         schema:
 *           type: string
 *         description: Artist name
 *       - in: query
 *         name: album_name
 *         required: true
 *         schema:
 *           type: string
 *         description: Album name
 *       - in: query
 *         name: duration
 *         required: true
 *         schema:
 *           type: integer
 *         description: Track duration in seconds
 *     responses:
 *       200:
 *         description: Lyrics fetched successfully
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
 *                   example: "Lyrics fetched"
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error - missing required fields
 *       500:
 *         description: Server error
 *
 * /api/lyrics/get-cached:
 *   get:
 *     summary: Get cached lyrics only
 *     description: Fetch lyrics from cache only (no external API calls)
 *     tags: [Lyrics]
 *     parameters:
 *       - in: query
 *         name: track_name
 *         required: true
 *         schema:
 *           type: string
 *         description: Track name
 *       - in: query
 *         name: artist_name
 *         required: true
 *         schema:
 *           type: string
 *         description: Artist name
 *       - in: query
 *         name: album_name
 *         required: true
 *         schema:
 *           type: string
 *         description: Album name
 *       - in: query
 *         name: duration
 *         required: true
 *         schema:
 *           type: integer
 *         description: Track duration in seconds
 *     responses:
 *       200:
 *         description: Cached lyrics fetched successfully
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
 *                   example: "Lyrics fetched (cached only)"
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error - missing required fields
 *       404:
 *         description: Lyrics not found in cache
 *       500:
 *         description: Server error
 *
 * /api/lyrics/get/{id}:
 *   get:
 *     summary: Get lyrics by ID
 *     description: Fetch lyrics using external lyrics ID
 *     tags: [Lyrics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: External lyrics ID
 *     responses:
 *       200:
 *         description: Lyrics fetched successfully
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
 *                   example: "Lyrics fetched"
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request - invalid ID
 *       404:
 *         description: Lyrics not found
 *       500:
 *         description: Server error
 */

