import React from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';

const MessageBubble = ({ message, isMe }) => {
  const timestamp = message.createdAt ? new Date(message.createdAt) : new Date();

  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-3`}>
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
          isMe
            ? 'bg-teal-600 text-white rounded-br-xs'
            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
        }`}
      >
        {!isMe && message.sender_name && (
          <p className="text-[10px] font-bold text-teal-700 mb-0.5">{message.sender_name}</p>
        )}
        <p className="whitespace-pre-wrap leading-relaxed">{message.message}</p>
      </div>

      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
        <span>{format(timestamp, 'hh:mm a')}</span>
        {isMe && (
          message.is_read ? (
            <CheckCheck className="w-3.5 h-3.5 text-teal-600" title="Read" />
          ) : (
            <Check className="w-3.5 h-3.5 text-slate-400" title="Sent" />
          )
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
