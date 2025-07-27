import React from 'react';
import HeroSection from '../components/HeroSection';

const MissionsPage: React.FC = () => {
  const missions = [
    {
      icon: (
        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      title: "Accompagnement Personnalisé",
      description: "Nous guidons chaque étudiant dans son parcours professionnel avec un suivi adapté à ses besoins et aspirations."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Matching Entreprises-Étudiants",
      description: "Notre plateforme met en relation les entreprises avec des talents qui correspondent le mieux à leurs besoins."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Innovation Pédagogique",
      description: "Nous développons des outils innovants pour faciliter l'apprentissage et l'insertion professionnelle."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: "Formation Continue",
      description: "Nous proposons des ressources et formations pour développer les compétences professionnelles des étudiants."
    }
  ];

  const stats = [
    { number: "5000+", label: "Étudiants accompagnés" },
    { number: "1000+", label: "Entreprises partenaires" },
    { number: "90%", label: "Taux d'insertion" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection
        title="Nos Missions"
        subtitle="Faciliter l'insertion professionnelle des étudiants et répondre aux besoins des entreprises."
        variant="medium"
      />

      {/* Missions Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {missions.map((mission, index) => (
              <div key={index} className="flex items-start space-x-6 group hover:transform hover:-translate-y-2 transition-all duration-300 p-6 rounded-2xl hover:bg-gray-50 hover:shadow-lg">
                <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  {mission.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">{mission.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-lg group-hover:text-gray-700 transition-colors duration-300">{mission.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Notre Impact</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg transition-all duration-300">
                  <span className="text-4xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors duration-300">{stat.number}</span>
                </div>
                <p className="text-xl font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Prêt à rejoindre l'aventure ?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Que vous soyez étudiant à la recherche d'un stage ou une entreprise cherchant des 
            talents, nous sommes là pour vous accompagner dans votre parcours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/students"
              className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-lg transform active:scale-95"
            >
              Découvrir les étudiants
            </a>
            <a
              href="/contact"
              className="inline-flex items-center bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 hover:scale-105 hover:shadow-2xl transition-all duration-300 transform active:scale-95"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MissionsPage;
