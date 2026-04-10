import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-8 animate-fade-in">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center text-accent border border-accent/30">
            <UserPlus className="w-8 h-8" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center mb-2">Create Account</h2>
        <p className="text-textSecondary text-center mb-8">Join us and start organizing your tasks</p>
        
        {error && <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-textSecondary">Full Name</label>
            <input 
              type="text" 
              required
              className="glass-input" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-textSecondary">Email</label>
            <input 
              type="email" 
              required
              className="glass-input" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-textSecondary">Password</label>
            <input 
              type="password" 
              required
              className="glass-input" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button type="submit" className="w-full bg-accent hover:bg-violet-600 text-white py-2.5 rounded-lg transition-colors font-medium">
            Sign Up
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-textSecondary">
          Already have an account? <Link to="/login" className="text-accent hover:text-violet-400 font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
