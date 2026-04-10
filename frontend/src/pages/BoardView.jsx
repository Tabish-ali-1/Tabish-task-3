import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Navbar from '../components/Navbar';
import BoardChat from '../components/BoardChat';
import { Plus, MessageSquare } from 'lucide-react';
import { io } from 'socket.io-client';

const COLUMNS = ['To Do', 'In Progress', 'Done'];

const BoardView = () => {
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState({ 'To Do': [], 'In Progress': [], 'Done': [] });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeColumn, setActiveColumn] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchBoardData();
    
    // Initialize socket
    const newSocket = io('http://localhost:5001');
    setSocket(newSocket);
    
    newSocket.emit('join_board', boardId);
    
    newSocket.on('task_updated', () => {
      fetchBoardData(); // Best to refetch, or optimistically update
    });

    return () => newSocket.close();
  }, [boardId]);

  const fetchBoardData = async () => {
    try {
      const boardRes = await axios.get(`/boards/${boardId}`);
      setBoard(boardRes.data);
      
      const tasksRes = await axios.get(`/tasks/board/${boardId}`);
      const organizedTasks = { 'To Do': [], 'In Progress': [], 'Done': [] };
      
      // Sort tasks by position before organizing
      const sortedTasks = tasksRes.data.sort((a, b) => a.position - b.position);
      
      sortedTasks.forEach(task => {
        if (organizedTasks[task.status]) {
          organizedTasks[task.status].push(task);
        }
      });
      
      setTasks(organizedTasks);
    } catch (err) {
      console.error('Error fetching board data', err);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceCol = [...tasks[source.droppableId]];
    const destCol = [...tasks[destination.droppableId]];
    const [movedTask] = sourceCol.splice(source.index, 1);
    
    // Calculate new position
    let newPosition = 1024;
    if (destCol.length > 0) {
      if (destination.index === 0) {
        newPosition = destCol[0].position / 2;
      } else if (destination.index === destCol.length) {
        newPosition = destCol[destCol.length - 1].position + 1024;
      } else {
        const prevPos = destCol[destination.index - 1].position;
        const nextPos = destCol[destination.index].position;
        newPosition = (prevPos + nextPos) / 2;
      }
    }
    
    movedTask.position = newPosition;
    movedTask.status = destination.droppableId;
    destCol.splice(destination.index, 0, movedTask);

    setTasks(prev => ({
      ...prev,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol
    }));

    try {
      await axios.put(`/tasks/${draggableId}/status`, {
        status: destination.droppableId,
        position: newPosition
      });
      // Emit socket event
      if (socket) {
        socket.emit('task_updated', { boardId });
      }
    } catch (err) {
      console.error('Error updating task', err);
      fetchBoardData(); // Revert on failure
    }
  };

  const createTask = async (columnId) => {
    if (!newTaskTitle.trim()) return;
    try {
      await axios.post('/tasks', {
        title: newTaskTitle,
        boardId,
        status: columnId
      });
      setNewTaskTitle('');
      setActiveColumn(null);
      fetchBoardData();
      if (socket) socket.emit('task_updated', { boardId });
    } catch (err) {
      console.error('Error creating task', err);
    }
  };

  if (!board) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-primary font-medium text-xl">Loading Board...</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col hide-scrollbar overflow-hidden">
      <Navbar />
      <main className="flex-1 p-6 overflow-hidden flex flex-col w-full h-[calc(100vh-73px)]">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-white">{board.title}</h1>
            <input 
              type="text"
              placeholder="Search tasks..."
              className="glass-input py-1.5 px-3 text-sm w-48 hidden sm:block"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="glass-button bg-primary/20 text-primary border-primary/30 py-1.5 px-3 flex"
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex-1 flex gap-6 overflow-x-auto pb-4 items-start">
            {COLUMNS.map(columnId => (
              <div key={columnId} className="w-80 shrink-0 glass-panel border border-surfaceBorder rounded-xl flex flex-col max-h-full">
                <div className="p-4 border-b border-surfaceBorder flex justify-between items-center bg-slate-800/50 rounded-t-xl">
                  <h3 className="font-semibold text-white">{columnId}</h3>
                  <span className="text-xs w-6 h-6 flex items-center justify-center rounded-full bg-slate-700 text-textSecondary">{tasks[columnId].length}</span>
                </div>
                
                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-3 overflow-y-auto min-h-[150px] transition-colors ${snapshot.isDraggingOver ? 'bg-slate-700/20' : ''}`}
                    >
                      {tasks[columnId]
                        .filter(task => task.title.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-slate-800 border border-slate-700 p-3 mb-3 rounded-lg shadow-sm group hover:border-primary/50 transition-colors ${snapshot.isDragging ? 'shadow-lg border-primary shadow-primary/20 !bg-slate-800/90' : ''}`}
                            >
                              <h4 className="text-sm font-medium text-white mb-2">{task.title}</h4>
                              {task.description && <p className="text-xs text-textSecondary line-clamp-2 mb-2">{task.description}</p>}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {activeColumn === columnId ? (
                        <div className="mt-2 p-2 bg-slate-800 rounded-lg border border-primary/50">
                          <input 
                            autoFocus
                            placeholder="Enter task title..."
                            className="w-full bg-transparent text-sm text-white focus:outline-none mb-2"
                            value={newTaskTitle}
                            onChange={e => setNewTaskTitle(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') createTask(columnId);
                              if (e.key === 'Escape') setActiveColumn(null);
                            }}
                          />
                          <div className="flex justify-between items-center">
                            <button className="px-2 py-1 bg-primary text-white text-xs rounded" onClick={() => createTask(columnId)}>Add</button>
                            <button className="px-2 py-1 text-textSecondary text-xs" onClick={() => setActiveColumn(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setActiveColumn(columnId)}
                          className="w-full py-2 flex items-center justify-center gap-1 text-sm text-textSecondary hover:bg-slate-700/30 hover:text-white rounded-lg transition-colors mt-2"
                        >
                          <Plus className="w-4 h-4" /> Add Task
                        </button>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
            </div>
          </DragDropContext>
          
          {isChatOpen && <BoardChat socket={socket} boardId={boardId} onClose={() => setIsChatOpen(false)} />}
        </div>
      </main>
    </div>
  );
};

export default BoardView;
