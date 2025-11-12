/**
 * @swagger
 * /api/prompt-test/test:
 *   post:
 *     summary: Test a new prompt against the original prompt (Admin only)
 *     description: |
 *       Tests a new prompt by comparing its results with the original prompt.
 *       Process:
 *       1. Retrieves original prompt from production n8n workflow
 *       2. Saves original prompt to database temp field (backup)
 *       3. Updates TEST n8n workflow with original prompt
 *       4. Runs analysis with original prompt on test workflow
 *       5. Updates TEST n8n workflow with new prompt
 *       6. Runs analysis with new prompt on test workflow
 *       7. Compares results (original vs new)
 *       8. Restores test workflow to original prompt (cleanup)
 *       9. Returns comparison results
 *       
 *       Note: Production workflow is never modified. All testing uses separate test workflow.
 *       Requires admin or super_admin role.
 *     tags: [Prompt Test]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPromptText
 *               - lyrics
 *               - language1
 *               - language2
 *             properties:
 *               newPromptText:
 *                 type: string
 *                 description: The new prompt text to test
 *                 example: "Translate the following lyrics from {{$json.body.language1}} to {{$json.body.language2}}..."
 *               lyrics:
 *                 type: string
 *                 description: Song lyrics to use for testing
 *                 example: "Hello world, how are you today?"
 *               language1:
 *                 type: string
 *                 description: Source language
 *                 example: "English"
 *               language2:
 *                 type: string
 *                 description: Target language
 *                 example: "Thai"
 *               moodEnabled:
 *                 type: boolean
 *                 description: Enable mood analysis
 *                 default: true
 *               moodTopK:
 *                 type: integer
 *                 description: Number of top moods to return
 *                 default: 4
 *                 minimum: 3
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Test completed successfully
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
 *                   example: "Prompt test completed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     original:
 *                       type: object
 *                       properties:
 *                         prompt:
 *                           type: string
 *                           description: Original prompt text
 *                         result:
 *                           type: object
 *                           properties:
 *                             translation:
 *                               type: string
 *                             interpretation:
 *                               type: string
 *                             moodAnalyze:
 *                               type: string
 *                     new:
 *                       type: object
 *                       properties:
 *                         prompt:
 *                           type: string
 *                           description: New prompt text
 *                         result:
 *                           type: object
 *                           properties:
 *                             translation:
 *                               type: string
 *                             interpretation:
 *                               type: string
 *                             moodAnalyze:
 *                               type: string
 *                     comparison:
 *                       type: object
 *                       properties:
 *                         translationChanged:
 *                           type: boolean
 *                           description: Whether translation results differ
 *                         interpretationChanged:
 *                           type: boolean
 *                           description: Whether interpretation results differ
 *                         moodChanged:
 *                           type: boolean
 *                           description: Whether mood analysis results differ
 *                         summary:
 *                           type: object
 *                           properties:
 *                             hasChanges:
 *                               type: boolean
 *                               description: Whether any results differ
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Bad request - missing or invalid parameters
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
 *                   example: "newPromptText is required and must be a string"
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
 *                   example: "Failed to test prompt"
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 */

module.exports = {};

