import React from 'react';
import HeroSection from '../components/HeroSection';

const TeamPage: React.FC = () => {
  const teamMembers = [
    {
      name: "Sophie Durand",
      role: "Directrice Générale",
      description: "Diplômée de l'ESSEC, Sophie a fondé 'Adopte un Étudiant' après avoir constaté les difficultés d'insertion professionnelle des jeunes.",
      image: "/api/placeholder/300/300",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "sophie@adopte-un-etudiant.fr"
      }
    },
    {
      name: "Thomas Lefebvre",
      role: "Directeur Technique",
      description: "Expert en développement web, Thomas a créé pour plusieurs startups avant de rejoindre notre équipe.",
      image: "/api/placeholder/300/300",
      social: {
        linkedin: "#",
        github: "#",
        email: "thomas@adopte-un-etudiant.fr"
      }
    },
    {
      name: "Amina Benali",
      role: "Responsable Relations Écoles",
      description: "Amina développe les partenariats avec les établissements d'enseignement supérieur.",
      image: "/api/placeholder/300/300",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "amina@adopte-un-etudiant.fr"
      }
    },
    {
      name: "Lucas Martin",
      role: "Responsable Relations Entreprises",
      description: "Lucas a pour mission de convaincre les entreprises de tous secteurs de rejoindre la plateforme.",
      image: "/api/placeholder/300/300",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "lucas@adopte-un-etudiant.fr"
      }
    }
  ];

  const values = [
    {
      number: "1",
      title: "Transparence",
      description: "Nous croyons en une communication honnête et claire avec tous nos utilisateurs et partenaires."
    },
    {
      number: "2", 
      title: "Accessibilité",
      description: "Nous rendons les opportunités de stage accessibles à tous les étudiants, quelle que soit leur formation ou leur origine."
    },
    {
      number: "3",
      title: "Innovation",
      description: "Nous cherchons constamment à améliorer notre plateforme pour offrir la meilleure expérience possible à tous utilisateurs."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection
        title="Notre Équipe"
        subtitle="Découvrez les personnes passionnées qui travaillent chaque jour pour connecter étudiants et entreprises."
        variant="medium"
      />

      {/* Team Members Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl hover:transform hover:-translate-y-2 transition-all duration-300 group">
                <div className="aspect-square bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300">
                  <div className="w-32 h-32 bg-blue-200 rounded-full flex items-center justify-center group-hover:bg-blue-300 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <span className="text-4xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors duration-300">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3 group-hover:text-blue-700 transition-colors duration-300">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 group-hover:text-gray-700 transition-colors duration-300">{member.description}</p>
                  
                  <div className="flex space-x-3">
                    <a href={member.social.linkedin} className="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                    <a href={member.social.twitter || member.social.github} className="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                    <a href={`mailto:${member.social.email}`} className="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nos Valeurs</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Les principes qui guident nos actions et définissent notre culture d'entreprise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl hover:transform hover:-translate-y-2 transition-all duration-300 group">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-200 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <span className="text-2xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors duration-300">{value.number}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Team Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Rejoignez Notre Équipe</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Nous sommes toujours à la recherche de personnes talentueuses et passionnées pour nous 
            aider à accomplir notre mission.
          </p>
          <a
            href="/careers"
            className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-lg transform active:scale-95 group"
          >
            Voir nos offres d'emploi
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
};

export default TeamPage;
