import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import OfferForm from '../../components/company/OfferForm';
import { getOfferById, updateOffer } from '../../services/offerService';
import { CreateOfferInput } from 'shared-types';

const EditOfferPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<CreateOfferInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchOffer = async () => {
      try {
        const data = await getOfferById(id);
        setOffer(data);
      } catch (err) {
        setError('Failed to fetch offer data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [id]);

  const handleUpdateOffer = async (data: CreateOfferInput) => {
    if (!id) return;
    setIsSubmitting(true);
    setError('');
    try {
      await updateOffer(id, data);
      navigate('/company/offers');
    } catch (err) {
      setError('Failed to update offer.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading offer...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Edit Offer</h1>
      <div className="mt-6">
        <OfferForm
          onSubmit={handleUpdateOffer}
          isSubmitting={isSubmitting}
          defaultValues={offer!}
        />
      </div>
    </div>
  );
};

export default EditOfferPage; 