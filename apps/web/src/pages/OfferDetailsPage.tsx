import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOfferById } from '../services/offerService';
import { useAuth } from '../context/AuthContext';
import { useOfferApplications } from '../hooks/useOfferApplications';

interface Company {
  name: string;
  logoUrl?: string | null;
}

// Skills are now strings, not objects

interface Offer {
  id: string;
  title: string;
  description: string;
  location: string | null;
  duration: string | null;
  company: Company;
  skills: string[];
  matchScore?: number;
}

const OfferDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyMessage, setApplyMessage] = useState('');
  const { isAuthenticated, user } = useAuth();

  const {
    appliedOfferIds,
    applyToOfferWithTracking,
    applicationLoading,
    refreshAppliedOffers,
  } = useOfferApplications();

  useEffect(() => {
    if (!id) return;
    const fetchOffer = async () => {
      try {
        const data = await getOfferById(id);
        setOffer(data);
      } catch (err) {
        setError('Failed to fetch offer details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [id]);

  const handleApply = async () => {
    if (!id) return;
    setApplyMessage('');
    try {
      await applyToOfferWithTracking(id);
      setApplyMessage('Application successful!');
    } catch (err: any) {
      // Handle specific error cases
      if (err.response?.status === 409 || err.message?.includes('already applied')) {
        setApplyMessage('You have already applied to this offer. Check your applications to view the status.');
      } else {
        setApplyMessage(err.response?.data?.message || 'Failed to apply. Please try again.');
      }
    }
  };

  if (loading) return (
    <div className="container mx-auto p-4">
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading offer details...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto p-4">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Error:</strong> {error}
        <div className="mt-2">
          <Link to="/offers" className="text-red-600 hover:text-red-800 underline">
            ← Back to Offers
          </Link>
        </div>
      </div>
    </div>
  );

  if (!offer) return (
    <div className="container mx-auto p-4">
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <strong>Not Found:</strong> Offer not found.
        <div className="mt-2">
          <Link to="/offers" className="text-yellow-600 hover:text-yellow-800 underline">
            ← Back to Offers
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      {/* Back Navigation */}
      <div className="mb-4">
        <Link to="/offers" className="text-indigo-600 hover:text-indigo-800 flex items-center">
          ← Back to Offers
        </Link>
      </div>

      <div className="rounded-lg bg-white p-8 shadow-md">
        {isAuthenticated && user?.role === 'STUDENT' && typeof offer.matchScore === 'number' && (
          <div className="mb-4 text-right">
            <span className="text-2xl font-bold text-indigo-600">
              Your Match Score: {offer.matchScore}%
            </span>
          </div>
        )}
        <h1 className="text-3xl font-bold">{offer.title}</h1>
        <p className="mt-2 text-xl text-gray-700">{offer.company.name}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-gray-600">
          {offer.location && <span>📍 {offer.location}</span>}
          {offer.duration && <span>⏰ {offer.duration}</span>}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {Array.isArray(offer.skills) ? offer.skills.map((skill, index) => (
              <span key={`detail-skill-${index}`} className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                {skill}
              </span>
            )) : null}
          </div>
          {isAuthenticated && user?.role === 'STUDENT' && (
            <div className="flex items-center gap-4">
              {appliedOfferIds.has(offer.id) ? (
                <div className="text-center">
                  <div className="bg-green-100 text-green-800 px-6 py-3 rounded-lg font-medium mb-2">
                    ✓ Application Submitted
                  </div>
                  <p className="text-xs text-gray-600">
                    Check your applications to view status
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={applicationLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {applicationLoading ? 'Submitting...' : 'Apply Now'}
                </button>
              )}
              <button
                onClick={refreshAppliedOffers}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                title="Refresh application status"
              >
                🔄
              </button>
            </div>
          )}
        </div>
        {applyMessage && (
          <div className={`mt-4 p-3 rounded-md ${applyMessage.includes('successful') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {applyMessage}
          </div>
        )}

        <hr className="my-6" />

        <div>
          <h3 className="text-xl font-semibold mb-4">Job Description</h3>
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            {offer.description && offer.description.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-3">{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDetailsPage; 