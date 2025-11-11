/**
 * @swagger
 * /api/admin/manage:
 *   get:
 *     summary: Get all admin users
 *     description: Retrieve list of all admin and super_admin users. Requires admin or super_admin role.
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin users retrieved successfully
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
 *                   example: "Admin users retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userID:
 *                         type: string
 *                         format: uuid
 *                         example: "123e4567-e89b-12d3-a456-426614174000"
 *                       username:
 *                         type: string
 *                         example: "admin_user"
 *                       email:
 *                         type: string
 *                         example: "admin@example.com"
 *                       fullName:
 *                         type: string
 *                         example: "Admin User"
 *                       role:
 *                         type: string
 *                         enum: [admin, super_admin]
 *                         example: "admin"
 *                       registerDate:
 *                         type: string
 *                         format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   post:
 *     summary: Add admin user
 *     description: Promote a user to admin or super_admin role by email. Requires admin or super_admin role.
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *                 description: Email of the user to promote to admin
 *               role:
 *                 type: string
 *                 enum: [admin, super_admin]
 *                 default: admin
 *                 example: "admin"
 *                 description: Role to assign (admin or super_admin)
 *     responses:
 *       200:
 *         description: Admin user added successfully
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
 *                   example: "Admin user added successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userID:
 *                       type: string
 *                       format: uuid
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Bad request - Missing email
 *       404:
 *         description: User not found
 *       409:
 *         description: Conflict - User is already an admin
 *       500:
 *         description: Internal server error
 *
 * /api/admin/manage/{userID}:
 *   put:
 *     summary: Update user role
 *     description: Update a user's role. Requires admin or super_admin role.
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [customer, admin, super_admin]
 *                 example: "admin"
 *                 description: New role to assign
 *     responses:
 *       200:
 *         description: User role updated successfully
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
 *                   example: "User role updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userID:
 *                       type: string
 *                       format: uuid
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Bad request - Missing role or invalid role
 *       404:
 *         description: User not found
 *       409:
 *         description: Conflict - User already has this role
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Remove admin user
 *     description: Remove admin privileges from a user (change role to customer). Requires admin or super_admin role.
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID to remove admin privileges from
 *     responses:
 *       200:
 *         description: Admin removed successfully
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
 *                   example: "Admin removed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userID:
 *                       type: string
 *                       format: uuid
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: "customer"
 *       400:
 *         description: Bad request - User is not an admin
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

