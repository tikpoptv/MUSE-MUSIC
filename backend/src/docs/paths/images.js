/**
 * @swagger
 * /api/images/upload:
 *   post:
 *     summary: Upload an image to MinIO
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (max 5MB)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     objectName:
 *                       type: string
 *                     proxyUrl:
 *                       type: string
 *                     bucketName:
 *                       type: string
 *       400:
 *         description: Bad request (no file, invalid file type, or file too large)
 *       401:
 *         description: Unauthorized
 *       503:
 *         description: Service unavailable (MinIO not configured)
 */

/**
 * @swagger
 * /api/images/delete:
 *   delete:
 *     summary: Delete an image from MinIO
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 description: Proxy URL or object name of the image to delete
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       400:
 *         description: Bad request (invalid URL)
 *       401:
 *         description: Unauthorized
 *       503:
 *         description: Service unavailable (MinIO not configured)
 */

/**
 * @swagger
 * /api/images/{objectName}:
 *   get:
 *     summary: Get an image from MinIO (proxy endpoint)
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: objectName
 *         required: true
 *         schema:
 *           type: string
 *         description: Object name (path) in MinIO bucket (e.g., images/1234567890-abc123.jpg)
 *     responses:
 *       200:
 *         description: Image file
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Image not found
 *       503:
 *         description: Service unavailable (MinIO not configured)
 */

