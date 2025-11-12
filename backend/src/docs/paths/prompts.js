/**
 * @swagger
 * /api/prompts/save:
 *   post:
 *     summary: Save prompt to production workflow and database
 *     description: |
 *       Saves a new prompt to:
 *       1. Production N8N workflow
 *       2. Database (Prompts table with isActive = TRUE)
 *       
 *       Requires admin or super_admin role.
 *     tags: [Prompts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - promptText
 *             properties:
 *               promptText:
 *                 type: string
 *                 description: The new prompt text to save
 *                 example: "=# Song Translation — SLIM+ (n8n / oos:120:b – Production Lyric Mode)\n\nYou are a professional lyric translator..."
 *     responses:
 *       200:
 *         description: Prompt saved successfully
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
 *                   example: "Prompt saved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     promptID:
 *                       type: string
 *                       format: uuid
 *                       example: "9be42a57-919a-4a26-ae67-f13124a50904"
 *                     promptText:
 *                       type: string
 *                       description: The saved prompt text
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Bad request - missing or invalid promptText
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "promptText is required and must be a string"
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - insufficient permissions (not admin)
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Failed to save prompt"
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 */

module.exports = {};

