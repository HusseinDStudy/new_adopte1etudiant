import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import OfferForm from '../../components/company/OfferForm';
import { getOfferById, updateOffer } from '../../services/offerService';
import { CreateOfferInput } from 'shared-types';
import SidebarLayout from '../../components/layout/SidebarLayout';

const EditOfferPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
        setError(t('editOffer.failedToFetch'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [id, t]);

  const handleUpdateOffer = async (data: CreateOfferInput) => {
    if (!id) return;
    setIsSubmitting(true);
    setError('');
    try {
      await updateOffer(id, data);
      navigate('/company/offers');
    } catch (err) {
      setError(t('editOffer.failedToUpdate'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <SidebarLayout>
      <div className="container mx-auto">
        <div className="flex h-64 items-center justify-center">
          <div className="text-lg">{t('editOffer.loadingOffer')}</div>
        </div>
      </div>
    </SidebarLayout>
  );
  
  if (error) return (
    <SidebarLayout>
      <div className="container mx-auto">
        <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <strong>{t('editOffer.error')}:</strong> {error}
        </div>
      </div>
    </SidebarLayout>
  );

  return (
    <SidebarLayout>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold">{t('editOffer.title')}</h1>
        <div className="mt-6">
          <OfferForm
            onSubmit={handleUpdateOffer}
            isSubmitting={isSubmitting}
            defaultValues={offer!}
          />
        </div>
      </div>
    </SidebarLayout>
  );
};

export default EditOfferPage; 