import React from 'react';
import HeroSection from '../components/common/HeroSection';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection
        title="Notre Mission"
        subtitle="Faciliter la rencontre entre les étudiants talentueux et les entreprises innovantes pour créer les opportunités de demain."
        variant="medium"
      />

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Notre Mission</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Faciliter la rencontre entre les étudiants talentueux et les entreprises innovantes pour 
              créer les opportunités de demain.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nos Valeurs</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Innovation */}
            <div className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg transition-all duration-300">
                <svg className="w-10 h-10 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">Innovation</h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                Nous croyons en l'innovation et l'adaptation constante aux besoins du marché du travail.
              </p>
            </div>

            {/* Community */}
            <div className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg transition-all duration-300">
                <svg className="w-10 h-10 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">Communauté</h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                Nous construisons une communauté forte entre étudiants et entreprises.
              </p>
            </div>

            {/* Excellence */}
            <div className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg transition-all duration-300">
                <svg className="w-10 h-10 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">Excellence</h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                Nous visons l'excellence dans chaque aspect de notre service.
              </p>
            </div>

            {/* Transparence */}
            <div className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg transition-all duration-300">
                <svg className="w-10 h-10 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">Transparence</h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                Nous privilégions une communication claire et honnête avec tous nos utilisateurs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Notre Histoire</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Fondée en 2021, Adopte un Étudiant est née d'une vision simple : créer un pont entre le monde 
                académique et professionnel. Notre plateforme facilite la mise en relation entre étudiants et 
                entreprises, permettant à chacun de trouver l'opportunité qui lui correspond.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Aujourd'hui, nous continuons à innover et à développer nos services pour répondre aux besoins 
                évolutifs du marché du travail et des nouvelles générations d'étudiants.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
