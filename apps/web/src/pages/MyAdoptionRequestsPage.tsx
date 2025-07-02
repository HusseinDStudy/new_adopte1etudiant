import React, { useState, useEffect } from 'react';
import { getMyAdoptionRequests, updateAdoptionRequestStatus } from '../services/adoptionRequestService';

interface Company {
    name: string;
    logoUrl?: string | null;
}

interface AdoptionRequest {
    id: string;
    company: Company;
    status: string;
    createdAt: string;
}

const MyAdoptionRequestsPage: React.FC = () => {
    const [requests, setRequests] = useState<AdoptionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        try {
            await updateAdoptionRequestStatus(id, status);
            // Refetch all requests to ensure UI is perfectly in sync
            fetchRequests(); 
        } catch (err) {
            console.error('Failed to update request status', err);
            alert('Failed to update status. Please try again.');
        }
    }

    if (loading) return <div className="text-center p-8">Loading requests...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Adoption Requests</h1>
            {requests.length === 0 ? (
                 <div className="text-center bg-white p-12 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold">No adoption requests yet.</h2>
                    <p className="mt-2 text-gray-500">When a company is interested in you, you'll see their request here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map(req => (
                        <div key={req.id} className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-semibold">{req.company.name}</h2>
                                <p className="text-gray-500 text-sm mt-2">Received on: {new Date(req.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                {req.status === 'PENDING' ? (
                                    <>
                                        <button onClick={() => handleStatusUpdate(req.id, 'ACCEPTED')} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">Accept</button>
                                        <button onClick={() => handleStatusUpdate(req.id, 'REJECTED')} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Reject</button>
                                    </>
                                ) : (
                                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                        req.status === 'ACCEPTED' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                                    }`}>
                                        {req.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyAdoptionRequestsPage; 