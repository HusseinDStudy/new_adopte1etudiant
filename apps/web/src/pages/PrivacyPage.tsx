import React from 'react';
import HeroSection from '../components/HeroSection';

const PrivacyPage = () => {
  return (
    <>
      {/* Hero Section - Full Width */}
      <HeroSection
        title="Politique de Confidentialité"
        description="Dernière mise à jour : 27 juillet 2025"
        variant="default"
      />

      {/* Rest of content */}
      <div className="min-h-screen bg-gray-50">

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              Adopte un Étudiant s'engage à protéger la confidentialité de vos données personnelles. 
              Cette politique de confidentialité explique comment nous collectons, utilisons, stockons 
              et protégeons vos informations personnelles lorsque vous utilisez notre plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Données collectées</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Informations d'identification</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Nom et prénom</li>
                  <li>Adresse email</li>
                  <li>Numéro de téléphone</li>
                  <li>Date de naissance</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Informations professionnelles</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Formation et diplômes</li>
                  <li>Expériences professionnelles</li>
                  <li>Compétences et certifications</li>
                  <li>CV et documents associés</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Utilisation des données</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Nous utilisons vos données personnelles pour :
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Créer et gérer votre compte utilisateur</li>
              <li>Faciliter la mise en relation entre étudiants et entreprises</li>
              <li>Améliorer nos services et votre expérience utilisateur</li>
              <li>Vous envoyer des notifications importantes</li>
              <li>Assurer la sécurité de la plateforme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Partage des données</h2>
            <p className="text-gray-600 leading-relaxed">
              Nous ne vendons jamais vos données personnelles. Nous pouvons partager certaines 
              informations avec des entreprises partenaires uniquement dans le cadre du processus 
              de candidature, et toujours avec votre consentement explicite.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Sécurité</h2>
            <p className="text-gray-600 leading-relaxed">
              Nous mettons en place des mesures de sécurité techniques et organisationnelles 
              appropriées pour protéger vos données contre tout accès non autorisé, modification, 
              divulgation ou destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Vos droits</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Droit d'accès à vos données personnelles</li>
              <li>Droit de rectification des données inexactes</li>
              <li>Droit à l'effacement de vos données</li>
              <li>Droit à la portabilité de vos données</li>
              <li>Droit d'opposition au traitement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              Pour toute question concernant cette politique de confidentialité ou pour exercer 
              vos droits, contactez-nous à : 
              <a href="mailto:privacy@adopte-un-etudiant.fr" className="text-blue-600 hover:text-blue-700 ml-1">
                privacy@adopte-un-etudiant.fr
              </a>
            </p>
          </section>

        </div>
      </div>
      </div>
    </>
  );
};

export default PrivacyPage;
