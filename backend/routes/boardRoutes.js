const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getBoards, getBoardById, createBoard, updateBoard, deleteBoard } = require('../controllers/boardController');

router.use(authMiddleware);

router.get('/', getBoards);
router.post('/', createBoard);
router.get('/:id', getBoardById);
router.put('/:id', updateBoard);
router.delete('/:id', deleteBoard);

module.exports = router;
