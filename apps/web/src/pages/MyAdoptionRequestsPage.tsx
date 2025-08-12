import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getMyAdoptionRequests, updateAdoptionRequestStatus } from '../services/adoptionRequestService';
import SidebarLayout from '../components/layout/SidebarLayout';

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
    const { t } = useTranslation();
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
            setError(t('adoptionRequests.failedToFetch'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [t]);

    const handleStatusUpdate = async (id: string, status: string) => {
        setUpdating(id);
        try {
            await updateAdoptionRequestStatus(id, status);
            await fetchRequests();
        } catch (err) {
            console.error('Failed to update request status', err);
            alert(t('adoptionRequests.failedToUpdateStatus'));
        } finally {
            setUpdating(null);
        }
    }

    if (loading) return (
        <SidebarLayout>
            <div className="container mx-auto">
                <div className="flex h-64 items-center justify-center">
                    <div className="text-lg">{t('adoptionRequests.loading')}</div>
                </div>
            </div>
        </SidebarLayout>
    );

    if (error) return (
        <SidebarLayout>
            <div className="container mx-auto">
                <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
                    <strong>{t('adoptionRequests.error')}:</strong> {error}
                    <div className="mt-2">
                        <button
                            onClick={fetchRequests}
                            className="text-red-600 underline hover:text-red-800"
                        >
                            {t('adoptionRequests.tryAgain')}
                        </button>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );

    return (
        <SidebarLayout>
            <div className="container mx-auto">
            <h1 className="mb-6 text-3xl font-bold">{t('adoptionRequests.title')}</h1>
            {requests.length === 0 ? (
                 <div className="rounded-lg bg-white p-12 text-center shadow-md">
                    <h2 className="text-xl font-semibold">{t('adoptionRequests.noRequestsYet')}</h2>
                    <p className="mt-2 text-gray-500">{t('adoptionRequests.noRequestsDescription')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {Array.isArray(requests) ? requests.map((req, index) => (
                        <div key={req.id || `request-${index}`} className="rounded-lg bg-white p-6 shadow-md">
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold">{req.company.name}</h2>
                                    {req.conversation && req.conversation.messages.length > 0 && (
                                        <div className="mt-4 rounded-md border-l-4 border-blue-400 bg-blue-50 p-4">
                                            <p className="mb-1 text-sm font-medium text-gray-700">{t('adoptionRequests.messageFrom')} {req.company.name}:</p>
                                            <p className="text-sm text-gray-800">"{req.conversation.messages[0].content}"</p>
                                        </div>
                                    )}
                                    <p className="mt-3 text-sm text-gray-500">{t('adoptionRequests.receivedOn')}: {new Date(req.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex flex-col gap-3 md:items-end">
                                    {req.status === 'PENDING' ? (
                                        <div className="flex flex-col gap-2 sm:flex-row">
                                            <button
                                                onClick={() => handleStatusUpdate(req.id, 'ACCEPTED')}
                                                disabled={updating === req.id}
                                                className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
                                            >
                                                {updating === req.id ? t('adoptionRequests.accepting') : t('adoptionRequests.accept')}
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
                                                disabled={updating === req.id}
                                                className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50"
                                            >
                                                {updating === req.id ? t('adoptionRequests.rejecting') : t('adoptionRequests.reject')}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center md:text-right">
                                            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
                                                req.status === 'ACCEPTED' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                                            }`}>
                                                {req.status}
                                            </span>
                                            {req.conversation && (req.status === 'ACCEPTED' || req.status === 'REJECTED') && (
                                                <div className="mt-2">
                                                    <Link to={`/conversations/${req.conversation.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                                        {req.status === 'ACCEPTED' ? t('adoptionRequests.viewConversation') : t('adoptionRequests.viewMessage')}
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