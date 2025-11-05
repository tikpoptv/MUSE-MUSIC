/**
 * @swagger
 * /api/home:
 *   get:
 *     summary: Get recommended songs for home page
 *     description: Returns recommended songs grouped by original language. Only includes approved and public processing.
 *     tags: [Recommendations]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Total number of songs to query
 *       - in: query
 *         name: limitPerSection
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of songs per language section
 *     responses:
 *       200:
 *         description: Home content retrieved successfully
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
 *                   example: "Home content retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     hero:
 *                       type: array
 *                       items:
 *                         type: object
 *                       example: []
 *                     sections:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: "English"
 *                           items:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   format: uuid
 *                                 processingID:
 *                                   type: string
 *                                   format: uuid
 *                                 title:
 *                                   type: string
 *                                 artist:
 *                                   type: string
 *                                 image:
 *                                   type: string
 *       500:
 *         description: Server error
 */

