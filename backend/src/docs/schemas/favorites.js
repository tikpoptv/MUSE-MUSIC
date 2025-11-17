module.exports = {};

/**
 * @swagger
 * components:
 *   schemas:
 *     FavoriteItem:
 *       type: object
 *       properties:
 *         favoriteID:
 *           type: string
 *           format: uuid
 *           example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
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
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *     
 *     FavoritePagination:
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
 *     UserFavoritesResponse:
 *       type: object
 *       properties:
 *         favorites:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FavoriteItem'
 *         pagination:
 *           $ref: '#/components/schemas/FavoritePagination'
 *     
 *     AddFavoriteRequest:
 *       type: object
 *       required:
 *         - songID
 *       properties:
 *         songID:
 *           type: string
 *           format: uuid
 *           example: "84031827-4916-41a7-acfa-5539ba484bdd"
 *     
 *     AddFavoriteResponse:
 *       type: object
 *       properties:
 *         favoriteID:
 *           type: string
 *           format: uuid
 *           example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2024-01-15T10:30:00Z"
 *         isNew:
 *           type: boolean
 *           example: true
 *     
 *     RemoveFavoriteRequest:
 *       type: object
 *       required:
 *         - songID
 *       properties:
 *         songID:
 *           type: string
 *           format: uuid
 *           example: "84031827-4916-41a7-acfa-5539ba484bdd"
 *     
 *     CheckFavoriteResponse:
 *       type: object
 *       properties:
 *         isFavorite:
 *           type: boolean
 *           example: true
 */

