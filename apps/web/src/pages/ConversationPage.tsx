import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getMessagesForConversation, createMessageInConversation, Message } from '../services/messageService';
import { useAuth } from '../context/AuthContext';

const ConversationPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [adoptionRequestStatus, setAdoptionRequestStatus] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (conversationId) {
      getMessagesForConversation(conversationId)
        .then((data) => {
          // Ensure messages is an array and filter out invalid messages
          const validMessages = Array.isArray(data.messages)
            ? data.messages.filter(msg => msg && msg.id && msg.sender && msg.sender.id)
            : [];
          setMessages(validMessages);
          setAdoptionRequestStatus(data.adoptionRequestStatus);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError('Failed to load messages.');
          setLoading(false);
        });
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationId || !newMessage.trim()) return;

    try {
      const sentMessage = await createMessageInConversation(conversationId, newMessage);
      setMessages((prevMessages) => [...prevMessages, sentMessage]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  if (loading) return (
    <div className="container mx-auto p-4">
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading conversation...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto p-4">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Error:</strong> {error}
        <div className="mt-2">
          <button
            onClick={() => window.location.reload()}
            className="text-red-600 hover:text-red-800 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 flex flex-col h-[calc(100vh-120px)]">
      <h1 className="text-2xl font-bold mb-4 border-b pb-4">Conversation</h1>
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {Array.isArray(messages) ? messages.map((msg, index) => {
          // Additional safety check for each message
          if (!msg || !msg.id || !msg.sender || !msg.sender.id) {
            return null;
          }

          return (
            <div
              key={msg.id || `msg-${index}`}
              className={`flex items-end gap-2 ${msg.sender.id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-lg ${
                  msg.sender.id === user?.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p className="text-sm">{msg.content || 'No content'}</p>
                <p className="text-xs opacity-75 mt-1 text-right">
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : 'Unknown time'}
                </p>
              </div>
            </div>
          );
        }) : null}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4 border-t pt-4">
        {adoptionRequestStatus === 'REJECTED' ? (
          <div className="text-center text-gray-500 italic">
            This conversation is read-only because the adoption request was rejected.
          </div>
        ) : (
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </form>
        )}
      </div>
    </div>
  );
};

export default ConversationPage; 