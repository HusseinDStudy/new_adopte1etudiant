import React from 'react';
import HeroSection from '../components/HeroSection';

const CookiesPage = () => {
  return (
    <>
      {/* Hero Section - Full Width */}
      <HeroSection
        title="Politique des Cookies"
        description="Dernière mise à jour : 27 juillet 2025"
        variant="default"
      />

      {/* Rest of content */}
      <div className="min-h-screen bg-gray-50">

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Qu'est-ce qu'un cookie ?</h2>
            <p className="text-gray-600 leading-relaxed">
              Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez 
              un site web. Les cookies nous permettent de reconnaître votre navigateur et de 
              mémoriser certaines informations sur vos préférences ou actions passées.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Types de cookies utilisés</h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Cookies essentiels</h3>
                <p className="text-gray-600">
                  Ces cookies sont nécessaires au fonctionnement de base du site. Ils permettent 
                  la navigation, l'authentification et l'accès aux zones sécurisées.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Cookies de performance</h3>
                <p className="text-gray-600">
                  Ces cookies collectent des informations anonymes sur la façon dont vous utilisez 
                  notre site, nous aidant à améliorer ses performances et votre expérience.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Cookies de fonctionnalité</h3>
                <p className="text-gray-600">
                  Ces cookies permettent au site de se souvenir de vos choix (langue, région) 
                  et de fournir des fonctionnalités améliorées et personnalisées.
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Cookies publicitaires</h3>
                <p className="text-gray-600">
                  Ces cookies sont utilisés pour afficher des publicités pertinentes et limiter 
                  le nombre de fois qu'une publicité vous est présentée.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cookies tiers</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Nous utilisons également des services tiers qui peuvent placer des cookies sur votre appareil :
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>Google Analytics</strong> : Pour analyser l'utilisation du site</li>
              <li><strong>Google Maps</strong> : Pour afficher les cartes interactives</li>
              <li><strong>Réseaux sociaux</strong> : Pour les boutons de partage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Gestion des cookies</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Vous pouvez contrôler et gérer les cookies de plusieurs façons :
            </p>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Paramètres du navigateur</h3>
                <p className="text-blue-800 text-sm">
                  La plupart des navigateurs vous permettent de refuser ou d'accepter les cookies, 
                  de supprimer les cookies existants et de définir des préférences pour certains sites.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Outils de désactivation</h3>
                <p className="text-green-800 text-sm">
                  Vous pouvez utiliser des outils comme Google Analytics Opt-out pour désactiver 
                  spécifiquement certains cookies de suivi.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Impact de la désactivation</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                <strong>Attention :</strong> La désactivation de certains cookies peut affecter 
                le fonctionnement du site et limiter votre expérience utilisateur. Certaines 
                fonctionnalités peuvent ne plus être disponibles.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Durée de conservation</h2>
            <p className="text-gray-600 leading-relaxed">
              La durée de conservation des cookies varie selon leur type :
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mt-4">
              <li><strong>Cookies de session</strong> : Supprimés à la fermeture du navigateur</li>
              <li><strong>Cookies persistants</strong> : Conservés jusqu'à leur date d'expiration ou suppression manuelle</li>
              <li><strong>Cookies de préférences</strong> : Conservés jusqu'à 12 mois</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Modifications</h2>
            <p className="text-gray-600 leading-relaxed">
              Nous pouvons mettre à jour cette politique des cookies pour refléter les changements 
              dans nos pratiques ou pour d'autres raisons opérationnelles, légales ou réglementaires.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              Pour toute question concernant notre utilisation des cookies, contactez-nous à : 
              <a href="mailto:cookies@adopte-un-etudiant.fr" className="text-blue-600 hover:text-blue-700 ml-1">
                cookies@adopte-un-etudiant.fr
              </a>
            </p>
          </section>

        </div>
      </div>
      </div>
    </>
  );
};

export default CookiesPage;
