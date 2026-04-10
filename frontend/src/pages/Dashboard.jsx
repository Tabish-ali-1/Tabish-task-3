import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Plus } from 'lucide-react';

const Dashboard = () => {
  const [boards, setBoards] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const res = await axios.get('/boards');
      setBoards(res.data);
    } catch (err) {
      console.error('Error fetching boards', err);
    }
  };

  const createBoard = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/boards', { title: newTitle, description: newDesc });
      setIsModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      fetchBoards();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white">Your Workspaces</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="glass-button bg-primary/20 hover:bg-primary/30 text-primary border-primary/30"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Board</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up">
          {boards.map(board => (
            <Link key={board._id} to={`/b/${board._id}`} className="block group">
              <div className="glass-panel h-32 p-5 border-l-4 border-l-primary hover:border-l-accent flex flex-col justify-between hover:scale-[1.02] transition-transform">
                <h3 className="font-semibold text-lg text-white group-hover:text-accent transition-colors truncate">{board.title}</h3>
                <p className="text-sm text-textSecondary truncate">{board.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Basic Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Create New Board</h2>
            <form onSubmit={createBoard} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-textSecondary">Title</label>
                <input required className="glass-input" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-1 text-textSecondary">Description</label>
                <input className="glass-input" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-textSecondary hover:bg-surfaceHover">Cancel</button>
                <button type="submit" className="glass-button bg-primary text-white border-none">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
