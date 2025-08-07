import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSentAdoptionRequests } from '../../services/adoptionRequestService';
import SidebarLayout from '../../components/layout/SidebarLayout';

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
    conversation: {
        id: string;
    } | null;
}

const SentAdoptionRequestsPage: React.FC = () => {
    const [requests, setRequests] = useState<AdoptionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                setLoading(true);
                const data = await getSentAdoptionRequests();
                setRequests(data);
            } catch (err: any) {
                setError(err.response?.data?.message || t('adoptionRequests.failedToFetchSent'));
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [t]);

    const getStatusPill = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-200 text-yellow-800">{t('adoptionRequests.pending')}</span>;
            case 'ACCEPTED':
                return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-200 text-green-800">{t('adoptionRequests.accepted')}</span>;
            case 'REJECTED':
                return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-200 text-red-800">{t('adoptionRequests.rejected')}</span>;
            default:
                return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-200 text-gray-800">{status}</span>;
        }
    }

    if (loading) return <div className="text-center p-8">{t('adoptionRequests.loadingRequests')}</div>;

    return (
        <SidebarLayout>
            <div className="container mx-auto">
                {error && (
                    <div className="mb-4 text-center bg-red-100 p-4 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-red-800">{t('adoptionRequests.errorOccurred')}</h2>
                        <p className="mt-2 text-red-600">{error}</p>
                    </div>
                )}
                <h1 className="text-3xl font-bold mb-6">{t('adoptionRequests.sentRequestsTitle')}</h1>
                {requests.length === 0 && !error ? (
                     <div className="text-center bg-white p-12 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold">{t('adoptionRequests.noSentRequestsYet')}</h2>
                        <p className="mt-2 text-gray-500">{t('adoptionRequests.noSentRequestsDescription')}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map(req => (
                            <div key={req.id} className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-semibold">
                                        {req.student.studentProfile ? `${req.student.studentProfile.firstName} ${req.student.studentProfile.lastName}` : t('adoptionRequests.aStudent')}
                                    </h2>
                                    <p className="text-gray-500 text-sm mt-2">{t('adoptionRequests.sentOn')}: {new Date(req.createdAt).toLocaleDateString()}</p>
                                </div>
                                 <div className="text-right">
                                    {getStatusPill(req.status)}
                                    {req.conversation && (
                                        <div className="mt-2">
                                            <Link to={`/conversations/${req.conversation.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                                {t('adoptionRequests.viewConversation')}
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
};

export default SentAdoptionRequestsPage; 