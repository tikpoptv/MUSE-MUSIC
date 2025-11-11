/**
 * @swagger
 * /api/admin/songs:
 *   get:
 *     summary: Get songs for approval with pagination and search
 *     description: Retrieve list of songs pending approval or approved with pagination, search, and status filtering. Requires admin or super_admin role.
 *     tags: [Admin Songs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for song name, artist name, or language
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, pending, approved, rejected, private, public_pending, public_approved, not_approve, done]
 *           default: all
 *         description: Filter by status (default: all). Use 'pending', 'approved', 'rejected', 'private', 'public_pending', or 'public_approved'. 'not_approve' and 'done' are supported for backward compatibility.
 *     responses:
 *       200:
 *         description: Songs retrieved successfully
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
 *                   example: "Songs retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     songs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           processingID:
 *                             type: string
 *                             format: uuid
 *                           songID:
 *                             type: string
 *                             format: uuid
 *                           songName:
 *                             type: string
 *                           songNameEnglish:
 *                             type: string
 *                           artistName:
 *                             type: string
 *                           language:
 *                             type: string
 *                           status:
 *                             type: string
 *                           coverImage:
 *                             type: string
 *                             nullable: true
 *                           createdBy:
 *                             type: string
 *                           createdByUsername:
 *                             type: string
 *                           createdByAvatar:
 *                             type: string
 *                             nullable: true
 *                           highlight:
 *                             type: boolean
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       500:
 *         description: Server error
 *
 * /api/admin/songs/pending-count:
 *   get:
 *     summary: Get pending songs count
 *     description: Get the count of songs pending approval. Requires admin or super_admin role.
 *     tags: [Admin Songs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending count retrieved successfully
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
 *                   example: "Pending count retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 12
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       500:
 *         description: Server error
 *
 * /api/admin/songs/{processingID}/approve:
 *   post:
 *     summary: Approve a song
 *     description: Approve a song processing. Requires admin or super_admin role.
 *     tags: [Admin Songs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: processingID
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Processing ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 nullable: true
 *                 description: Optional approval note
 *     responses:
 *       200:
 *         description: Song approved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Processing not found
 *       500:
 *         description: Server error
 *
 * /api/admin/songs/{processingID}/reject:
 *   post:
 *     summary: Reject a song
 *     description: Reject a song processing. Requires admin or super_admin role.
 *     tags: [Admin Songs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: processingID
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Processing ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 nullable: true
 *                 description: Optional rejection note
 *     responses:
 *       200:
 *         description: Song rejected successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Processing not found
 *       500:
 *         description: Server error
 *
 * /api/admin/songs/bulk-approve:
 *   post:
 *     summary: Bulk approve songs
 *     description: Approve multiple songs at once. Requires admin or super_admin role.
 *     tags: [Admin Songs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - processingIDs
 *             properties:
 *               processingIDs:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of processing IDs to approve
 *               note:
 *                 type: string
 *                 nullable: true
 *                 description: Optional approval note
 *     responses:
 *       200:
 *         description: Songs approved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       500:
 *         description: Server error
 *
 * /api/admin/songs/bulk-reject:
 *   post:
 *     summary: Bulk reject songs
 *     description: Reject multiple songs at once. Requires admin or super_admin role.
 *     tags: [Admin Songs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - processingIDs
 *             properties:
 *               processingIDs:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of processing IDs to reject
 *               note:
 *                 type: string
 *                 nullable: true
 *                 description: Optional rejection note
 *     responses:
 *       200:
 *         description: Songs rejected successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       500:
 *         description: Server error
 */

