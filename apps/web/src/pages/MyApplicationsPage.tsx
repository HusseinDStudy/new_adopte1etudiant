import React, { useState, useEffect } from 'react';
import { getMyApplications } from '../services/applicationService';
import { Link } from 'react-router-dom';

// Type definition based on backend response
interface Application {
  id: string;
  status: string;
  createdAt: string;
  offer: {
    id: string;
    title: string;
    company: {
      name: string;
    };
  };
}

const MyApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const data = await getMyApplications();
        setApplications(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch your applications.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusClasses = (status: string) => {
    switch (status.toUpperCase()) {
      case 'HIRED':
        return 'bg-green-200 text-green-800';
      case 'REJECTED':
        return 'bg-red-200 text-red-800';
      case 'INTERVIEW':
        return 'bg-purple-200 text-purple-800';
      case 'SEEN':
        return 'bg-blue-200 text-blue-800';
      case 'NEW':
      default:
        return 'bg-yellow-200 text-yellow-800';
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Applications</h1>
      {applications.length === 0 ? (
        <p>You have not made any applications yet.</p>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-blue-600 hover:underline">
                  <Link to={`/offers/${app.offer.id}`}>{app.offer.title}</Link>
                </h2>
                <p className="text-gray-700 mt-1">{app.offer.company.name}</p>
                <p className="text-gray-500 text-sm mt-2">Applied on: {new Date(app.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right space-y-2">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusClasses(app.status)}`}>
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1).toLowerCase()}
                </span>
                <div className="mt-2">
                   <Link to={`/applications/${app.id}/thread`} className="text-sm text-indigo-600 hover:text-indigo-800">
                    View Conversation
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplicationsPage; 