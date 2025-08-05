import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, AlertCircle, MessageSquare } from 'lucide-react';
import {
  PageLayout,
  HeroSection,
  ContentSection,
  SectionHeader,
  UnifiedCard,
  ResponsiveGrid
} from '../../components/unified/DesignSystem';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formErrors, setFormErrors] = useState({
    name: false,
    email: false,
    subject: false,
    message: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6 text-blue-600" />,
      title: 'Adresse',
      content: '123 Avenue des Champs-Élysées\n75008 Paris, France',
      link: null
    },
    {
      icon: <Phone className="w-6 h-6 text-blue-600" />,
      title: 'Téléphone',
      content: '+33 1 23 45 67 89',
      link: 'tel:+33123456789'
    },
    {
      icon: <Mail className="w-6 h-6 text-blue-600" />,
      title: 'Email',
      content: 'contact@adopte-un-etudiant.fr',
      link: 'mailto:contact@adopte-un-etudiant.fr'
    },
    {
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      title: 'Horaires',
      content: 'Lundi - Vendredi : 9h00 - 18h00\nSamedi - Dimanche : Fermé',
      link: null
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    // Simple validation
    const errors = {
      name: !formData.name.trim(),
      email: !formData.email.trim() || !formData.email.includes('@'),
      subject: !formData.subject.trim(),
      message: !formData.message.trim()
    };
    
    if (Object.values(errors).some(Boolean)) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    setIsSubmitting(false);
    
    alert('Message envoyé avec succès !');
  };

  return (
    <PageLayout>
      {/* Hero Section */}
      <HeroSection
        title="Contactez-nous"
        subtitle="Notre équipe est à votre disposition pour répondre à toutes vos questions et vous accompagner dans vos projets."
        variant="gradient"
      />

      {/* Contact Information */}
      <ContentSection background="white">
        <SectionHeader
          title="Nos Coordonnées"
          subtitle="Plusieurs moyens de nous contacter selon vos préférences et besoins."
          icon={<MessageSquare className="w-6 h-6 text-blue-600" />}
        />
        
        <ResponsiveGrid cols={2} gap={6}>
          {contactInfo.map((info, index) => (
            <UnifiedCard key={index} className="group">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                  {info.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2 text-gray-900">{info.title}</h3>
                  {info.link ? (
                    <a 
                      href={info.link}
                      className="text-gray-600 hover:text-blue-600 transition-colors whitespace-pre-line"
                    >
                      {info.content}
                    </a>
                  ) : (
                    <p className="text-gray-600 whitespace-pre-line">{info.content}</p>
                  )}
                </div>
              </div>
            </UnifiedCard>
          ))}
        </ResponsiveGrid>
      </ContentSection>

      {/* Contact Form */}
      <ContentSection background="gray">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            title="Envoyez-nous un message"
            subtitle="Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais."
          />
          
          <UnifiedCard>
            <form onSubmit={handleSubmit} className="space-y-6">
              <ResponsiveGrid cols={2} gap={6}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Votre nom complet"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500">Ce champ est requis</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="votre@email.com"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-500">Email invalide</p>
                  )}
                </div>
              </ResponsiveGrid>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Sujet *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    formErrors.subject ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Sujet de votre message"
                />
                {formErrors.subject && (
                  <p className="mt-1 text-sm text-red-500">Ce champ est requis</p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                    formErrors.message ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Votre message détaillé..."
                />
                {formErrors.message && (
                  <p className="mt-1 text-sm text-red-500">Ce champ est requis</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 hover:shadow-xl hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Envoyer le message</span>
                  </>
                )}
              </button>
            </form>
          </UnifiedCard>
        </div>
      </ContentSection>

      {/* Additional Info */}
      <ContentSection background="dark-blue">
        <div className="text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-6">Information Importante</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-xl mb-8 leading-relaxed">
              Notre équipe vous répond généralement sous 24 heures ouvrées. 
              Pour toute urgence, n'hésitez pas à nous contacter directement par téléphone.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Heures de réponse moyennes</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold mb-1">&lt; 2h</div>
                  <div className="text-white/80 text-sm">Questions urgentes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-1">&lt; 24h</div>
                  <div className="text-white/80 text-sm">Demandes générales</div>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-1">&lt; 48h</div>
                  <div className="text-white/80 text-sm">Demandes complexes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContentSection>
    </PageLayout>
  );
};

export default ContactPage;
