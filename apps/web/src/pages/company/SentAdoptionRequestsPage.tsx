import React, { useState, useEffect } from 'react';
import { getSentAdoptionRequests } from '../../services/adoptionRequestService';

interface StudentProfile {
    firstName: string;
    lastName: string;
}

interface Student {
    id: string;
    studentProfile: StudentProfile | null;
}

interface AdoptionRequest {
    id: string;
    student: Student;
    status: string;
    createdAt: string;
}

const SentAdoptionRequestsPage: React.FC = () => {
    const [requests, setRequests] = useState<AdoptionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                setLoading(true);
                const data = await getSentAdoptionRequests();
                setRequests(data);
            } catch (err) {
                setError('Failed to fetch sent adoption requests.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

    const getStatusPill = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-200 text-yellow-800">Pending</span>;
            case 'ACCEPTED':
                return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-200 text-green-800">Accepted</span>;
            case 'REJECTED':
                return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-200 text-red-800">Rejected</span>;
            default:
                return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-200 text-gray-800">{status}</span>;
        }
    }

    if (loading) return <div className="text-center p-8">Loading requests...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Sent Adoption Requests</h1>
            {requests.length === 0 ? (
                 <div className="text-center bg-white p-12 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold">You haven't sent any adoption requests yet.</h2>
                    <p className="mt-2 text-gray-500">Find interesting students in the Student Directory.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map(req => (
                        <div key={req.id} className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    {req.student.studentProfile ? `${req.student.studentProfile.firstName} ${req.student.studentProfile.lastName}` : 'A Student'}
                                </h2>
                                <p className="text-gray-500 text-sm mt-2">Sent on: {new Date(req.createdAt).toLocaleDateString()}</p>
                            </div>
                            {getStatusPill(req.status)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SentAdoptionRequestsPage; 