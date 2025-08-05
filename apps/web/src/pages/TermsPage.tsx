import React from 'react';
import HeroSection from '../components/common/HeroSection';

const TermsPage = () => {
  return (
    <>
      {/* Hero Section - Full Width */}
      <HeroSection
        title="Conditions d'Utilisation"
        description="Dernière mise à jour : 27 juillet 2025"
        variant="default"
      />

      {/* Rest of content */}
      <div className="min-h-screen bg-gray-50">

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptation des conditions</h2>
            <p className="text-gray-600 leading-relaxed">
              En accédant et en utilisant la plateforme Adopte un Étudiant, vous acceptez d'être lié 
              par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas 
              utiliser notre service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description du service</h2>
            <p className="text-gray-600 leading-relaxed">
              Adopte un Étudiant est une plateforme en ligne qui facilite la mise en relation entre 
              étudiants à la recherche de stages ou d'alternances et entreprises proposant des 
              opportunités professionnelles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Inscription et compte utilisateur</h2>
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                Pour utiliser nos services, vous devez :
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Être âgé d'au moins 16 ans</li>
                <li>Fournir des informations exactes et complètes</li>
                <li>Maintenir la confidentialité de vos identifiants</li>
                <li>Nous notifier immédiatement de toute utilisation non autorisée</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Utilisation acceptable</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Vous vous engagez à ne pas :
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Publier de contenu illégal, offensant ou inapproprié</li>
              <li>Usurper l'identité d'une autre personne ou entité</li>
              <li>Utiliser la plateforme à des fins commerciales non autorisées</li>
              <li>Tenter d'accéder aux comptes d'autres utilisateurs</li>
              <li>Perturber le fonctionnement de la plateforme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Contenu utilisateur</h2>
            <p className="text-gray-600 leading-relaxed">
              Vous conservez la propriété de votre contenu, mais vous nous accordez une licence 
              pour l'utiliser dans le cadre de nos services. Vous êtes responsable de la véracité 
              et de la légalité de votre contenu.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Responsabilité</h2>
            <p className="text-gray-600 leading-relaxed">
              Adopte un Étudiant agit en tant qu'intermédiaire. Nous ne sommes pas responsables 
              des relations entre utilisateurs, de la qualité des offres ou des candidatures, 
              ni des décisions d'embauche.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Suspension et résiliation</h2>
            <p className="text-gray-600 leading-relaxed">
              Nous nous réservons le droit de suspendre ou de résilier votre compte en cas de 
              violation de ces conditions d'utilisation ou pour toute autre raison légitime.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Modifications</h2>
            <p className="text-gray-600 leading-relaxed">
              Nous pouvons modifier ces conditions d'utilisation à tout moment. Les modifications 
              importantes vous seront notifiées par email ou via la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Droit applicable</h2>
            <p className="text-gray-600 leading-relaxed">
              Ces conditions d'utilisation sont régies par le droit français. Tout litige sera 
              soumis à la compétence exclusive des tribunaux de Paris.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              Pour toute question concernant ces conditions d'utilisation, contactez-nous à : 
              <a href="mailto:legal@adopte-un-etudiant.fr" className="text-blue-600 hover:text-blue-700 ml-1">
                legal@adopte-un-etudiant.fr
              </a>
            </p>
          </section>

        </div>
      </div>
      </div>
    </>
  );
};

export default TermsPage;
