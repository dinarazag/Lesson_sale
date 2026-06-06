import React from 'react';
import { File, Download, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function MessageBubble({ message, isOwn, showAvatar, avatar, senderName }) {
  const isSystem = message.is_system;

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 text-gray-600 text-xs px-4 py-2 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} mb-3`}>
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <div className="flex-shrink-0">
          {avatar ? (
            <img src={avatar} alt={senderName} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-500">{senderName?.[0]}</span>
            </div>
          )}
        </div>
      )}
      {showAvatar && isOwn && <div className="w-8" />}

      {/* Message */}
      <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwn
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-tr-sm'
              : 'bg-white border border-gray-100 text-gray-900 rounded-tl-sm'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          
          {/* File attachment */}
          {message.file_url && (
            <a
              href={message.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 mt-2 pt-2 border-t ${
                isOwn ? 'border-white/30' : 'border-gray-200'
              }`}
            >
              {message.file_url.startsWith('http') && !message.file_name ? (
                <>
                  <LinkIcon className="w-4 h-4" />
                  <span className="text-xs underline truncate">Ссылка</span>
                </>
              ) : (
                <>
                  <File className="w-4 h-4" />
                  <span className="text-xs truncate">{message.file_name || 'Файл'}</span>
                  <Download className="w-3 h-3 ml-auto" />
                </>
              )}
            </a>
          )}
        </div>

        {/* Timestamp */}
        <span className={`text-xs text-gray-400 mt-1 ${isOwn ? 'mr-1' : 'ml-1'}`}>
          {format(new Date(message.created_date), 'HH:mm', { locale: ru })}
        </span>
      </div>

      {!showAvatar && <div className="w-8" />}
    </div>
  );
}