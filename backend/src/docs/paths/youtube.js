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

/**
 * @swagger
 * /api/youtube/transcript/{videoId}:
 *   get:
 *     summary: Fetch YouTube transcript via python youtube-transcript-api
 *     description: Use the internal Python helper to fetch transcripts via youtube-transcript-api
 *     tags: [YouTube]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: YouTube video ID
 *       - in: query
 *         name: format
 *         required: false
 *         schema:
 *           type: string
 *           enum: [raw, text]
 *           default: raw
 *         description: raw returns list/dict structure, text returns merged plain text
 *       - in: query
 *         name: languages
 *         required: false
 *         schema:
 *           type: string
 *           example: "th,en"
 *         description: Optional comma-separated language priority list
 *       - in: query
 *         name: mode
 *         required: false
 *         schema:
 *           type: string
 *           enum: [fallback, multi]
 *           default: fallback
 *         description: fallback returns first available language, multi returns every requested language that exists
 *     responses:
 *       200:
 *         description: Transcript fetched successfully
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
 *                   example: "YouTube transcript retrieved"
 *                 data:
 *                   type: object
 *                   properties:
 *                     format:
 *                       type: string
 *                       enum: [raw, text]
 *                     strategy:
 *                       type: string
 *                       enum: [fallback, multi]
 *                     languages:
 *                       type: array
 *                       items:
 *                         type: string
 *                     transcript:
 *                       oneOf:
 *                         - type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               text:
 *                                 type: string
 *                               start:
 *                                 type: number
 *                               duration:
 *                                 type: number
 *                         - type: string
 *                           description: Transcript as plain text
 *                         - type: object
 *                           additionalProperties:
 *                             oneOf:
 *                               - type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     text:
 *                                       type: string
 *                                     start:
 *                                       type: number
 *                                     duration:
 *                                       type: number
 *                               - type: string
 *                             description: When mode=multi a map of language code -> transcript content
 *       400:
 *         description: Bad request - missing videoId
 *       500:
 *         description: Server error or helper script not available
 */

