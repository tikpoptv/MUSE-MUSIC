/**
 * @swagger
 * /api/youtube/search:
 *   get:
 *     summary: Search YouTube videos by song name and artist
 *     description: Search for YouTube videos using song name and optionally artist name
 *     tags: [YouTube]
 *     parameters:
 *       - in: query
 *         name: songName
 *         required: true
 *         schema:
 *           type: string
 *         description: Song name to search for
 *       - in: query
 *         name: artistName
 *         required: false
 *         schema:
 *           type: string
 *         description: Artist name (optional, improves search accuracy)
 *       - in: query
 *         name: maxResults
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 5
 *         description: Maximum number of results to return
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
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
 *                   example: "YouTube videos found"
 *                 data:
 *                   type: object
 *                   properties:
 *                     videos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           videoId:
 *                             type: string
 *                             example: "dQw4w9WgXcQ"
 *                           title:
 *                             type: string
 *                             example: "Song Title - Artist Name"
 *                           description:
 *                             type: string
 *                           thumbnail:
 *                             type: string
 *                             format: uri
 *                           channelTitle:
 *                             type: string
 *                           publishedAt:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: Bad request - missing or invalid parameters
 *       500:
 *         description: Server error or YouTube API configuration issue
 */

/**
 * @swagger
 * /api/youtube/video/{videoId}:
 *   get:
 *     summary: Get YouTube video details by video ID
 *     description: Retrieve detailed information about a specific YouTube video including duration
 *     tags: [YouTube]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: YouTube video ID
 *     responses:
 *       200:
 *         description: Video details retrieved successfully
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
 *                   example: "YouTube video details retrieved"
 *                 data:
 *                   type: object
 *                   properties:
 *                     videoId:
 *                       type: string
 *                       example: "dQw4w9WgXcQ"
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     thumbnail:
 *                       type: string
 *                       format: uri
 *                     channelTitle:
 *                       type: string
 *                     publishedAt:
 *                       type: string
 *                       format: date-time
 *                     duration:
 *                       type: integer
 *                       description: Duration in seconds
 *                       example: 212
 *                     viewCount:
 *                       type: integer
 *                     likeCount:
 *                       type: integer
 *       400:
 *         description: Bad request - missing videoId
 *       404:
 *         description: Video not found
 *       500:
 *         description: Server error or YouTube API configuration issue
 */

