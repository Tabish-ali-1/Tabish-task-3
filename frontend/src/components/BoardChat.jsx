import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Send, X } from 'lucide-react';

const BoardChat = ({ socket, boardId, onClose }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputVal.trim() && socket) {
      const messageData = {
        boardId,
        userId: user._id || user.id,
        userName: user.name,
        text: inputVal,
        timestamp: new Date().toISOString(),
      };
      socket.emit('send_message', messageData);
      setInputVal('');
    }
  };

  return (
    <div className="w-80 border-l border-surfaceBorder bg-surface/50 backdrop-blur-xl h-full flex flex-col shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.5)] z-20 transition-transform">
      <div className="p-4 border-b border-surfaceBorder flex justify-between items-center bg-slate-800/80">
        <h3 className="font-semibold text-white">Team Chat</h3>
        <button onClick={onClose} className="text-textSecondary hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
          const isMe = msg.userId === (user._id || user.id);
          return (
            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-textSecondary mb-1 ml-1">{isMe ? 'You' : msg.userName}</span>
              <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-slate-700 text-white rounded-tl-none border border-slate-600'}`}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-surfaceBorder bg-slate-800/80">
        <div className="flex relative">
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-700 rounded-full pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
            placeholder="Type a message..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
          <button type="submit" disabled={!inputVal.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary rounded-full text-white disabled:opacity-50 hover:bg-primaryHover transition-colors">
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default BoardChat;
