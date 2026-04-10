const Task = require('../models/Task');
const Board = require('../models/Board');

// Helper to check board permission
const checkBoardAccess = async (boardId, userId) => {
  const board = await Board.findById(boardId);
  if (!board) return false;
  return board.owner.toString() === userId || board.members.some(m => m.toString() === userId);
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, boardId, dueDate } = req.body;

    const hasAccess = await checkBoardAccess(boardId, req.user.userId);
    if (!hasAccess) return res.status(403).json({ message: 'Not authorized to add task to this board' });

    // Calculate generic position (highest + 1)
    const taskStatus = status || 'To Do';
    const highestTask = await Task.findOne({ boardId, status: taskStatus }).sort('-position');
    const newPosition = highestTask ? highestTask.position + 1024 : 1024;

    const task = new Task({
      title,
      description,
      status: taskStatus,
      position: newPosition,
      boardId,
      dueDate,
      assignedTo: []
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error creating task', error: err.message });
  }
};

exports.getTasksByBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    
    // Sort tasks by explicitly set position (very important for Kanban view)
    const tasks = await Task.find({ boardId })
      .populate('assignedTo', 'name email')
      .sort('position');
      
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks', error: err.message });
  }
};

exports.updateTaskDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, assignedTo } = req.body;
    
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.dueDate = dueDate ?? task.dueDate;
    if (assignedTo) task.assignedTo = assignedTo;

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error updating task', error: err.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, position } = req.body; // usually sent by drag-and-drop
    
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.status = status ?? task.status;
    task.position = position ?? task.position;

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error updating task status', error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Ensure has access to the task's board
    const hasAccess = await checkBoardAccess(task.boardId, req.user.userId);
    if (!hasAccess) return res.status(403).json({ message: 'Not authorized manually' });

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting task', error: err.message });
  }
};
