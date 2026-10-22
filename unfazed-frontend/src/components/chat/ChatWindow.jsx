import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, MessageCircle, ShieldCheck } from 'lucide-react';
import MessageBubble from './MessageBubble';

// In production, when served as a unified full-stack web service, connect to same-origin.
// In local development, fall back to http://localhost:5000 (or VITE_API_BASE_URL if set).
const getSocketUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace('/api', '');
  }
  if (import.meta.env.PROD) {
    return typeof window !== 'undefined' ? window.location.origin : '';
  }
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

const ChatWindow = ({ therapistId, clientId, senderType = 'therapist', senderName = 'Dr. Ananya Roy', recipientName = 'Client' }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!therapistId || !clientId) return;

    // Connect socket
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.emit('join_chat', { therapistId, clientId });

    socket.on('chat_history', (history) => {
      setMessages(history);
    });

    socket.on('new_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('user_typing', ({ senderName }) => {
      setIsTyping(true);
      setTypingUser(senderName);
    });

    socket.on('user_stop_typing', () => {
      setIsTyping(false);
      setTypingUser('');
    });

    return () => {
      socket.disconnect();
    };
  }, [therapistId, clientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);

    if (socketRef.current) {
      socketRef.current.emit('typing', { therapistId, clientId, senderName });

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('stop_typing', { therapistId, clientId });
      }, 1500);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !socketRef.current) return;

    socketRef.current.emit('send_message', {
      therapistId,
      clientId,
      senderType,
      senderName,
      message: inputValue.trim(),
    });

    socketRef.current.emit('stop_typing', { therapistId, clientId });
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-[520px] bg-slate-50/50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="px-5 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
            {recipientName.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">{recipientName}</h4>
            <div className="flex items-center gap-1.5 text-[11px] text-teal-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Confidential Real-Time Channel</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-400 text-xs">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Encrypted</span>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
            <MessageCircle className="w-8 h-8 text-slate-300" />
            <p className="text-xs">No messages yet. Send a note to begin.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id || msg.createdAt}
              message={msg}
              isMe={msg.sender_type === senderType}
            />
          ))
        )}

        {isTyping && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 italic py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-100" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-200" />
            <span className="text-[11px] ml-1">{typingUser || 'User'} is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type a confidential message..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="p-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 transition flex items-center justify-center shadow-md shadow-teal-600/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
