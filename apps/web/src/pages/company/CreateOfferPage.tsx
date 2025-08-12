import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import OfferForm from '../../components/company/OfferForm';
import { createOffer } from '../../services/offerService';
import { CreateOfferInput } from 'shared-types';
import SidebarLayout from '../../components/layout/SidebarLayout';

const CreateOfferPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCreateOffer = async (data: CreateOfferInput) => {
    setIsSubmitting(true);
    setError('');
    try {
      await createOffer(data);
      navigate('/company/offers');
    } catch (err) {
      setError(t('createOffer.failedToCreate'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold">{t('createOffer.title')}</h1>
        {error && (
          <div className="mt-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            <strong>{t('createOffer.error')}:</strong> {error}
          </div>
        )}
        <div className="mt-6">
          <OfferForm onSubmit={handleCreateOffer} isSubmitting={isSubmitting} />
        </div>
      </div>
    </SidebarLayout>
  );
};

export default CreateOfferPage; 