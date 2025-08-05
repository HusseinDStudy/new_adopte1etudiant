import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OfferForm from '../../components/company/OfferForm';
import { createOffer } from '../../services/offerService';
import { CreateOfferInput } from 'shared-types';
import SidebarLayout from '../../components/SidebarLayout';

const CreateOfferPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCreateOffer = async (data: CreateOfferInput) => {
    setIsSubmitting(true);
    setError('');
    try {
      await createOffer(data);
      navigate('/company/offers');
    } catch (err) {
      setError('Failed to create offer.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidebarLayout>
      <h1 className="text-3xl font-bold">Create a New Offer</h1>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      <div className="mt-6">
        <OfferForm onSubmit={handleCreateOffer} isSubmitting={isSubmitting} />
      </div>
    </SidebarLayout>
  );
};

export default CreateOfferPage; 