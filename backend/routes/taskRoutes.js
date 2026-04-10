const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createTask, getTasksByBoard, updateTaskDetails, updateTaskStatus, deleteTask } = require('../controllers/taskController');

router.use(authMiddleware);

router.post('/', createTask);
router.get('/board/:boardId', getTasksByBoard);
router.put('/:id', updateTaskDetails);
router.put('/:id/status', updateTaskStatus);
router.delete('/:id', deleteTask);

module.exports = router;
