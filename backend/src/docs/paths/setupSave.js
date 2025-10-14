/**
 * @swagger
 * /api/setup/save:
 *   post:
 *     summary: Save setup step data
 *     description: Save data for a specific setup step (step1, step2, step3, step4)
 *     tags: [Setup]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - step
 *               - data
 *             properties:
 *               step:
 *                 type: string
 *                 enum: [step1, step2, step3, step4]
 *                 description: The setup step to save
 *               data:
 *                 type: object
 *                 description: The data to save for the step
 *                 properties:
 *                   password:
 *                     type: string
 *                     description: Password for step1 (Google users only)
 *                   birthday:
 *                     type: string
 *                     format: date
 *                     description: Birthday for step2
 *                   country:
 *                     type: string
 *                     description: Country for step3
 *                   timezone:
 *                     type: string
 *                     description: Timezone for step3
 *                   language:
 *                     type: string
 *                     description: Language for step3
 *                   genres:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Music genres for step4
 *     responses:
 *       200:
 *         description: Step saved successfully
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
 *                   example: "Step step1 saved successfully"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
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
 */

/**
 * @swagger
 * /api/setup/skip:
 *   post:
 *     summary: Skip setup process
 *     description: Skip the setup process after accepting terms and conditions
 *     tags: [Setup]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - termsAccepted
 *             properties:
 *               termsAccepted:
 *                 type: boolean
 *                 description: Whether terms and conditions are accepted
 *                 example: true
 *     responses:
 *       200:
 *         description: Setup skipped successfully
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
 *                   example: "Setup skipped successfully"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
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
 */

/**
 * @swagger
 * /api/setup/complete:
 *   post:
 *     summary: Complete setup process
 *     description: Mark the setup process as completed
 *     tags: [Setup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Setup completed successfully
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
 *                   example: "Setup completed successfully"
 *       401:
 *         description: Unauthorized
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
 */
