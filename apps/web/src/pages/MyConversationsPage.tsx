import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyConversations } from '../services/messageService'; // This service/function needs to be created
import { useAuth } from '../context/AuthContext';
import SidebarLayout from '../components/SidebarLayout';

interface Conversation {
  id: string;
  // Depending on what you want to show, you might need more details
  // For example, the name of the other person, last message snippet, etc.
  // This will require backend changes to the conversation fetching logic.
  topic: string; // e.g., "Application for Senior Developer" or "Adoption Request from Google"
  lastMessage: string;
  updatedAt: string;
}

const MyConversationsPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        // We'll need to implement getMyConversations in messageService
        const data = await getMyConversations(); 
        setConversations(data);
      } catch (err) {
        setError('Failed to fetch conversations.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchConversations();
    }
  }, [user]);

  if (loading) return <div>Loading conversations...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <SidebarLayout>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Conversations</h1>
        <div className="bg-white shadow rounded-lg">
          <ul className="divide-y divide-gray-200">
            {conversations.length > 0 ? (
              conversations.map(convo => (
                <li key={convo.id} className="p-4 hover:bg-gray-50">
                  <Link to={`/conversations/${convo.id}`} className="block">
                    <div className="flex justify-between">
                      <p className="font-semibold text-lg">{convo.topic}</p>
                      <p className="text-sm text-gray-500">{new Date(convo.updatedAt).toLocaleString()}</p>
                    </div>
                    <p className="text-gray-600 mt-1 truncate">{convo.lastMessage}</p>
                  </Link>
                </li>
              ))
            ) : (
              <li className="p-4 text-center text-gray-500">You have no conversations yet.</li>
            )}
          </ul>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default MyConversationsPage; 