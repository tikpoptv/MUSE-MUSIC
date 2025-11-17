module.exports = {};

/**
 * @swagger
 * components:
 *   schemas:
 *     HistorySong:
 *       type: object
 *       properties:
 *         songID:
 *           type: string
 *           format: uuid
 *           example: "84031827-4916-41a7-acfa-5539ba484bdd"
 *         songName:
 *           type: string
 *           example: "Shape of You"
 *         artistName:
 *           type: string
 *           example: "Ed Sheeran"
 *         coverImage:
 *           type: string
 *           nullable: true
 *           example: "https://example.com/cover.jpg"
 *     
 *     HistoryProcessing:
 *       type: object
 *       properties:
 *         processingID:
 *           type: string
 *           format: uuid
 *           example: "1c52b4f0-fc0f-4859-a743-c46106e31367"
 *         translation:
 *           type: string
 *           nullable: true
 *           example: "Translated lyrics..."
 *         targetLanguage:
 *           type: string
 *           nullable: true
 *           example: "Thai"
 *         originalLanguage:
 *           type: string
 *           nullable: true
 *           example: "English"
 *     
 *     HistoryItem:
 *       type: object
 *       properties:
 *         historyID:
 *           type: string
 *           format: uuid
 *           example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *         songID:
 *           type: string
 *           format: uuid
 *           example: "84031827-4916-41a7-acfa-5539ba484bdd"
 *         processingID:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           example: "1c52b4f0-fc0f-4859-a743-c46106e31367"
 *         timeStamp:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *         deviceInfo:
 *           type: string
 *           nullable: true
 *           example: "mobile"
 *         actionType:
 *           type: string
 *           enum: [view, save]
 *           example: "save"
 *         song:
 *           $ref: '#/components/schemas/HistorySong'
 *         processing:
 *           $ref: '#/components/schemas/HistoryProcessing'
 *           nullable: true
 *     
 *     HistoryPagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 20
 *         total:
 *           type: integer
 *           example: 50
 *         totalPages:
 *           type: integer
 *           example: 3
 *     
 *     UserHistoryResponse:
 *       type: object
 *       properties:
 *         history:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/HistoryItem'
 *         pagination:
 *           $ref: '#/components/schemas/HistoryPagination'
 *     
 *     SaveTranslationRequest:
 *       type: object
 *       required:
 *         - songID
 *         - processingID
 *       properties:
 *         songID:
 *           type: string
 *           format: uuid
 *           example: "84031827-4916-41a7-acfa-5539ba484bdd"
 *         processingID:
 *           type: string
 *           format: uuid
 *           example: "1c52b4f0-fc0f-4859-a743-c46106e31367"
 *     
 *     SaveTranslationResponse:
 *       type: object
 *       properties:
 *         historyID:
 *           type: string
 *           format: uuid
 *           example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *         timeStamp:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 */

