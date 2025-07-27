import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HeroSection from '../components/HeroSection';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* Hero Section - Full Width */}
      <HeroSection
        title={
          <>
            Adoptez <span className="text-blue-200">le talent</span><br />
            qui vous correspond
          </>
        }
        description="La plateforme qui connecte étudiants et entreprises pour des stages et alternances qui correspondent vraiment à vos attentes."
        variant="large"
      >
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            to="/register"
            className="bg-teal-500 hover:bg-teal-600 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            Commencer maintenant
          </Link>
          <Link
            to="/offers"
            className="bg-white hover:bg-gray-50 text-blue-700 px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            Voir les offres
          </Link>
        </div>
      </HeroSection>

      {/* Rest of content with container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Statistics Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <svg className="w-10 h-10 text-blue-500 group-hover:text-blue-600 transition-all duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-3 group-hover:text-blue-700 transition-colors duration-300">2,500+</div>
              <div className="text-gray-600 font-medium group-hover:text-gray-700 transition-colors duration-300">Étudiants actifs</div>
            </div>

            <div className="bg-white rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <svg className="w-10 h-10 text-blue-500 group-hover:text-blue-600 transition-all duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z"/>
                </svg>
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-3 group-hover:text-blue-700 transition-colors duration-300">500+</div>
              <div className="text-gray-600 font-medium group-hover:text-gray-700 transition-colors duration-300">Entreprises partenaires</div>
            </div>

            <div className="bg-white rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <svg className="w-10 h-10 text-blue-500 group-hover:text-blue-600 transition-all duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-3 group-hover:text-blue-700 transition-colors duration-300">1,200+</div>
              <div className="text-gray-600 font-medium group-hover:text-gray-700 transition-colors duration-300">Stages pourvus</div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Features Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="text-blue-500 font-semibold text-lg mb-4 uppercase tracking-wide">Nos services</div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Une plateforme complète</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Découvrez tous nos services pour faciliter votre recherche de stage et d'alternance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {/* Profil personnalisé */}
            <div className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-blue-100 group-hover:to-blue-200">
                <svg className="w-12 h-12 text-blue-500 group-hover:text-blue-600 transition-all duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 group-hover:text-blue-700 transition-colors duration-300">Profil personnalisé</h3>
              <p className="text-gray-600 leading-relaxed mb-6 text-lg group-hover:text-gray-700 transition-colors duration-300">
                Créez votre profil et mettez en avant vos compétences et vos meilleures opportunités.
              </p>
              <Link to="/register" className="inline-flex items-center text-blue-500 font-semibold hover:text-blue-600 transition-all duration-300 text-lg group-hover:translate-x-1">
                Se connecter
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Offres ciblées */}
            <div className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-blue-100 group-hover:to-blue-200">
                <svg className="w-12 h-12 text-blue-500 group-hover:text-blue-600 transition-all duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 group-hover:text-blue-700 transition-colors duration-300">Offres ciblées</h3>
              <p className="text-gray-600 leading-relaxed mb-6 text-lg group-hover:text-gray-700 transition-colors duration-300">
                Accédez à des offres correspondant parfaitement à votre profil et vos aspirations.
              </p>
              <Link to="/offers" className="inline-flex items-center text-blue-500 font-semibold hover:text-blue-600 transition-all duration-300 text-lg group-hover:translate-x-1">
                Voir les offres
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Mise en relation */}
            <div className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-blue-100 group-hover:to-blue-200">
                <svg className="w-12 h-12 text-blue-500 group-hover:text-blue-600 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 group-hover:text-blue-700 transition-colors duration-300">Mise en relation</h3>
              <p className="text-gray-600 leading-relaxed mb-6 text-lg group-hover:text-gray-700 transition-colors duration-300">
                Connectez-vous directement avec les entreprises et étudiants qui vous correspondent.
              </p>
              <Link to="/students" className="inline-flex items-center text-blue-500 font-semibold hover:text-blue-600 transition-all duration-300 text-lg group-hover:translate-x-1">
                Voir les profils
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 py-24 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 200C200 100 400 300 600 200C700 150 750 250 800 200V400H0V200Z" fill="white"/>
            <circle cx="100" cy="100" r="50" fill="white"/>
            <circle cx="700" cy="300" r="40" fill="white"/>
          </svg>
        </div>

        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Prêt à commencer l'aventure ?
          </h2>
          <p className="text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Rejoignez notre communauté et trouvez le stage ou l'alternance de vos rêves
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-blue-700 px-12 py-5 rounded-2xl font-bold text-xl hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2"
          >
            Créer un compte gratuitement
          </Link>
        </div>
      </div>
      </div>
    </>
  );
};

export default HomePage;