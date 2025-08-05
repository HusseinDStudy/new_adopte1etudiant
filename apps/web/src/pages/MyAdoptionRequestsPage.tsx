import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyAdoptionRequests, updateAdoptionRequestStatus } from '../services/adoptionRequestService';
import SidebarLayout from '../components/SidebarLayout';

interface Company {
    name: string;
    logoUrl?: string | null;
}

interface Message {
  id: string;
  content: string;
}

interface AdoptionRequest {
    id: string;
    company: Company;
    status: string;
    createdAt: string;
    conversation: {
        id: string;
        messages: Message[];
    } | null;
}

const MyAdoptionRequestsPage: React.FC = () => {
    const [requests, setRequests] = useState<AdoptionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await getMyAdoptionRequests();
            setRequests(data);
        } catch (err) {
            setError('Failed to fetch adoption requests.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleStatusUpdate = async (id: string, status: string) => {
        setUpdating(id);
        try {
            await updateAdoptionRequestStatus(id, status);
            await fetchRequests();
        } catch (err) {
            console.error('Failed to update request status', err);
            alert('Failed to update status. Please try again.');
        } finally {
            setUpdating(null);
        }
    }

    if (loading) return (
        <SidebarLayout>
            <div className="container mx-auto">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg">Loading adoption requests...</div>
                </div>
            </div>
        </SidebarLayout>
    );

    if (error) return (
        <SidebarLayout>
            <div className="container mx-auto">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>Error:</strong> {error}
                    <div className="mt-2">
                        <button
                            onClick={fetchRequests}
                            className="text-red-600 hover:text-red-800 underline"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );

    return (
        <SidebarLayout>
            <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">Adoption Requests</h1>
            {requests.length === 0 ? (
                 <div className="text-center bg-white p-12 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold">No adoption requests yet.</h2>
                    <p className="mt-2 text-gray-500">When a company is interested in you, you'll see their request here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {Array.isArray(requests) ? requests.map((req, index) => (
                        <div key={req.id || `request-${index}`} className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold">{req.company.name}</h2>
                                    {req.conversation && req.conversation.messages.length > 0 && (
                                        <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-md">
                                            <p className="text-sm text-gray-700 font-medium mb-1">Message from {req.company.name}:</p>
                                            <p className="text-sm text-gray-800">"{req.conversation.messages[0].content}"</p>
                                        </div>
                                    )}
                                    <p className="text-gray-500 text-sm mt-3">Received on: {new Date(req.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex flex-col gap-3 md:items-end">
                                    {req.status === 'PENDING' ? (
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <button
                                                onClick={() => handleStatusUpdate(req.id, 'ACCEPTED')}
                                                disabled={updating === req.id}
                                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
                                            >
                                                {updating === req.id ? 'Accepting...' : 'Accept'}
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
                                                disabled={updating === req.id}
                                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
                                            >
                                                {updating === req.id ? 'Rejecting...' : 'Reject'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center md:text-right">
                                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                                req.status === 'ACCEPTED' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                                            }`}>
                                                {req.status}
                                            </span>
                                            {req.conversation && (req.status === 'ACCEPTED' || req.status === 'REJECTED') && (
                                                <div className="mt-2">
                                                    <Link to={`/conversations/${req.conversation.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                                        {req.status === 'ACCEPTED' ? 'View Conversation' : 'View Message'}
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )) : null}
                </div>
            )}
        </div>
    </SidebarLayout>
    );
};

export default MyAdoptionRequestsPage;