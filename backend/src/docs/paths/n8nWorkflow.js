/**
 * @swagger
 * /api/n8n/workflow:
 *   get:
 *     summary: Get N8N workflow information
 *     description: Retrieves workflow information from N8N including AI Agent node configuration and prompt. Requires authentication.
 *     tags: [N8N Workflow]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workflow info retrieved successfully
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
 *                   example: "Workflow info retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     workflow:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "sCPTsY05vDzxQ1UF"
 *                         name:
 *                           type: string
 *                           example: "Song Translation Workflow"
 *                         active:
 *                           type: boolean
 *                           example: true
 *                     prompt:
 *                       type: string
 *                       nullable: true
 *                       description: Prompt text from AI Agent node
 *                       example: "# Song Translation — SLIM+ (n8n / oos:120:b – Production Lyric Mode)..."
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error - N8N API call failed or configuration error
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
 *                   example: "Failed to fetch N8N workflow info"
 *                 error:
 *                   type: string
 *                   example: "N8N_API_KEY environment variable is missing"
 *
 * /api/n8n/workflow:
 *   post:
 *     summary: Execute N8N workflow for song translation and mood analysis
 *     description: Calls N8N workflow API to translate lyrics and optionally perform mood analysis. Requires authentication.
 *     tags: [N8N Workflow]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lyrics
 *             properties:
 *               language1:
 *                 type: string
 *                 example: "English"
 *                 description: Source language for translation
 *               language2:
 *                 type: string
 *                 example: "Thai"
 *                 description: Target language for translation
 *               lyrics:
 *                 type: string
 *                 example: "Hello world\nThis is a test"
 *                 description: Lyrics text to translate (required)
 *               moodEnabled:
 *                 type: boolean
 *                 example: true
 *                 description: Enable mood analysis (optional)
 *               moodTopK:
 *                 type: integer
 *                 example: 4
 *                 description: Number of top moods to return (optional, defaults to 4)
 *     responses:
 *       200:
 *         description: Workflow executed successfully
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
 *                   example: "Workflow executed successfully"
 *                 data:
 *                   type: object
 *                   description: Response data from N8N workflow
 *       400:
 *         description: Bad request - missing required fields
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
 *                   example: "Lyrics is required"
 *                 error:
 *                   type: string
 *                   example: "Missing required field: lyrics"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error - N8N workflow execution failed or configuration error
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
 *                   example: "Failed to execute N8N workflow"
 *                 error:
 *                   type: string
 *                   example: "N8N_API_KEY environment variable is missing"
 */

