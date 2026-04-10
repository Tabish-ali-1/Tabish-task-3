const Board = require('../models/Board');
const Task = require('../models/Task');

exports.createBoard = async (req, res) => {
  try {
    const { title, description } = req.body;
    const board = new Board({
      title,
      description,
      owner: req.user.userId,
      members: [req.user.userId] // owner is implicitly a member
    });
    await board.save();
    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ message: 'Error creating board', error: err.message });
  }
};

exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { owner: req.user.userId },
        { members: req.user.userId }
      ]
    }).populate('owner', 'name email').sort({ updatedAt: -1 });
    res.json(boards);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching boards', error: err.message });
  }
};

exports.getBoardById = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');
      
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user is owner or member
    const isMember = board.members.some(member => member._id.toString() === req.user.userId);
    const isOwner = board.owner._id.toString() === req.user.userId;
    
    if (!isMember && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to view this board' });
    }

    res.json(board);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching board', error: err.message });
  }
};

exports.updateBoard = async (req, res) => {
  try {
    const { title, description } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) return res.status(404).json({ message: 'Board not found' });
    if (board.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this board' });
    }

    board.title = title || board.title;
    board.description = description || board.description;
    await board.save();
    
    res.json(board);
  } catch (err) {
    res.status(500).json({ message: 'Error updating board', error: err.message });
  }
};

exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    if (board.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this board' });
    }

    await board.deleteOne();
    await Task.deleteMany({ boardId: req.params.id });

    res.json({ message: 'Board deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting board', error: err.message });
  }
};
