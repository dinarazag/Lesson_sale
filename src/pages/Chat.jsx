import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Paperclip, User, Loader2, X } from 'lucide-react';
import MessageBubble from '@/components/chat/MessageBubble';

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadUser();
    const params = new URLSearchParams(location.search);
    setChatId(params.get('id'));
  }, [location]);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  // Fetch chat
  const { data: chat } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => base44.entities.Chat.filter({ id: chatId }).then(res => res[0]),
    enabled: !!chatId
  });

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => base44.entities.Message.filter({ chat_id: chatId }, 'created_date'),
    enabled: !!chatId,
    refetchInterval: 2000 // Poll every 2 seconds
  });

  // Mark messages as read
  useEffect(() => {
    if (messages.length > 0 && user && chat) {
      const unreadMessages = messages.filter(m => 
        !m.is_read && m.sender_id !== user.id
      );
      
      if (unreadMessages.length > 0) {
        unreadMessages.forEach(msg => {
          base44.entities.Message.update(msg.id, { is_read: true });
        });

        // Update chat unread count
        const isTeacher = user.user_type === 'teacher';
        const updateField = isTeacher ? 'unread_count_teacher' : 'unread_count_student';
        base44.entities.Chat.update(chat.id, { [updateField]: 0 });
        
        queryClient.invalidateQueries({ queryKey: ['chats'] });
      }
    }
  }, [messages, user, chat]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, file_url, file_name }) => {
      await base44.entities.Message.create({
        chat_id: chatId,
        sender_id: user.id,
        sender_name: user.full_name,
        sender_role: user.user_type,
        content,
        file_url,
        file_name,
        is_read: false
      });

      // Update chat last message
      const isTeacher = user.user_type === 'teacher';
      const updateField = isTeacher ? 'unread_count_student' : 'unread_count_teacher';
      const recipientId = isTeacher ? chat.student_id : chat.teacher_id;
      
      await base44.entities.Chat.update(chatId, {
        last_message: content,
        last_message_at: new Date().toISOString(),
        [updateField]: (chat[updateField] || 0) + 1
      });

      // Create notification for recipient
      if (chat.lesson_id !== 'support') {
        await base44.entities.Notification.create({
          user_id: recipientId,
          type: 'new_message',
          title: 'Новое сообщение',
          message: `${user.full_name}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
          link: createPageUrl(`Chat?id=${chatId}`),
          related_chat_id: chatId,
          is_read: false
        });

        // Send email notification if enabled
        const recipients = await base44.entities.User.filter({ id: recipientId });
        if (recipients.length > 0 && recipients[0].notification_settings?.email_new_message) {
          await base44.integrations.Core.SendEmail({
              to: recipients[0].email,
              subject: 'Новое сообщение - lesson_sale',
              body: `Здравствуйте!

          У вас новое сообщение от ${user.full_name}:

          "${content}"

          Ответьте в чате на платформе lesson_sale.

          С уважением,
          Команда lesson_sale`
            });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setMessageText('');
      setAttachedFile(null);
    }
  });

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setAttachedFile({ url: file_url, name: file.name });
    setIsUploading(false);
  };

  const handleSend = () => {
    if (!messageText.trim() && !attachedFile) return;

    sendMessageMutation.mutate({
      content: messageText.trim() || 'Прикреплён файл',
      file_url: attachedFile?.url,
      file_name: attachedFile?.name
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user || !chat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const isTeacher = user.user_type === 'teacher';
  const otherUserName = isTeacher ? chat.student_name : chat.teacher_name;
  const otherUserAvatar = isTeacher ? chat.student_avatar : chat.teacher_avatar;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        
        {otherUserAvatar ? (
          <img
            src={otherUserAvatar}
            alt={otherUserName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 truncate">{otherUserName}</h2>
          <p className="text-xs text-gray-500">{chat.lesson_subject}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Send className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">Начните диалог</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = message.sender_id === user.id;
              const prevMessage = messages[index - 1];
              const showAvatar = !prevMessage || prevMessage.sender_id !== message.sender_id;
              
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  avatar={isOwn ? user.avatar_url : otherUserAvatar}
                  senderName={message.sender_name}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* File preview */}
      {attachedFile && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center gap-2 bg-white rounded-xl p-3 border border-gray-200">
            <Paperclip className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700 flex-1 truncate">{attachedFile.name}</span>
            <button onClick={() => setAttachedFile(null)} className="p-1">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 pb-safe">
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </button>

          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Написать сообщение..."
            className="flex-1 rounded-2xl border-gray-200 min-h-[44px] max-h-32 resize-none"
            disabled={sendMessageMutation.isPending}
          />

          <Button
            onClick={handleSend}
            disabled={(!messageText.trim() && !attachedFile) || sendMessageMutation.isPending}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-2xl h-11 px-5"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}