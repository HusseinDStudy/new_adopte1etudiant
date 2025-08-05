import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Mail, Users, Target, Lightbulb, Heart, Award, ArrowRight } from 'lucide-react';
import {
  PageLayout,
  HeroSection,
  ContentSection,
  SectionHeader,
  UnifiedCard,
  ResponsiveGrid,
  CTASection
} from '../../components/unified/DesignSystem';

const TeamPage = () => {
  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Fondatrice',
      image: '/team-member-1.jpg',
      bio: 'Passionnée par l\'innovation et l\'éducation, Sarah a créé cette plateforme pour révolutionner la mise en relation étudiants-entreprises.',
      linkedin: '#',
      twitter: '#',
      email: 'sarah@adopte1etudiant.com'
    },
    {
      name: 'Marc Dubois',
      role: 'CTO',
      image: '/team-member-2.jpg',
      bio: 'Expert en technologie avec 10 ans d\'expérience, Marc dirige le développement technique de notre plateforme innovante.',
      linkedin: '#',
      twitter: '#',
      email: 'marc@adopte1etudiant.com'
    },
    {
      name: 'Julie Martin',
      role: 'Head of Partnerships',
      image: '/team-member-3.jpg',
      bio: 'Spécialiste des relations entreprises, Julie développe notre réseau de partenaires et accompagne nos clients.',
      linkedin: '#',
      twitter: '#',
      email: 'julie@adopte1etudiant.com'
    },
    {
      name: 'Thomas Leroy',
      role: 'Lead Developer',
      image: '/team-member-4.jpg',
      bio: 'Développeur passionné, Thomas conçoit et améliore continuellement l\'expérience utilisateur de notre plateforme.',
      linkedin: '#',
      twitter: '#',
      email: 'thomas@adopte1etudiant.com'
    }
  ];

  const values = [
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: 'Collaboration',
      description: 'Nous croyons en la force du travail d\'équipe et de la collaboration pour atteindre l\'excellence.'
    },
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: 'Excellence',
      description: 'Nous visons l\'excellence dans tout ce que nous entreprenons, avec un souci constant de la qualité.'
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-blue-600" />,
      title: 'Innovation',
      description: 'Nous innovons constamment pour améliorer notre service et répondre aux besoins évolutifs.'
    }
  ];

  const benefits = [
    'Environnement de travail stimulant et bienveillant',
    'Opportunités de croissance et de développement',
    'Impact social positif sur l\'avenir des étudiants',
    'Équipe passionnée et collaborative',
    'Technologies de pointe et projets innovants',
    'Flexibilité et équilibre vie pro/perso'
  ];

  return (
    <PageLayout>
      {/* Hero Section */}
      <HeroSection
        title="Notre Équipe"
        subtitle="Rencontrez les personnes passionnées qui rendent possible la connexion entre talents et opportunités."
        variant="gradient"
      />

      {/* Team Grid */}
      <ContentSection background="white">
        <SectionHeader
          title="Les Visages de Notre Succès"
          subtitle="Une équipe diverse et expérimentée, unie par la passion de transformer l'avenir professionnel des étudiants."
          icon={<Users className="w-6 h-6 text-blue-600" />}
        />
        
        <ResponsiveGrid cols={2} gap={8}>
          {teamMembers.map((member, index) => (
            <UnifiedCard key={index} className="text-center group">
              <div className="relative mb-6">
                <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 overflow-hidden shadow-lg">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=128&background=3b82f6&color=ffffff`;
                    }}
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
              <p className="text-blue-600 font-semibold mb-4">{member.role}</p>
              <p className="text-gray-600 mb-6 leading-relaxed text-sm">{member.bio}</p>
              
              <div className="flex justify-center space-x-3">
                <a
                  href={member.linkedin}
                  className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors group/link"
                >
                  <Linkedin className="w-5 h-5 text-blue-600 group-hover/link:scale-110 transition-transform" />
                </a>
                <a
                  href={member.twitter}
                  className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors group/link"
                >
                  <Twitter className="w-5 h-5 text-blue-600 group-hover/link:scale-110 transition-transform" />
                </a>
                <a
                  href={`mailto:${member.email}`}
                  className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors group/link"
                >
                  <Mail className="w-5 h-5 text-blue-600 group-hover/link:scale-110 transition-transform" />
                </a>
              </div>
            </UnifiedCard>
          ))}
        </ResponsiveGrid>
      </ContentSection>

      {/* Company Values */}
      <ContentSection background="gray">
        <SectionHeader
          title="Nos Valeurs d'Équipe"
          subtitle="Ces valeurs guident notre travail quotidien et notre vision commune pour transformer l'avenir professionnel."
          icon={<Heart className="w-6 h-6 text-blue-600" />}
        />
        
        <ResponsiveGrid cols={3}>
          {values.map((value, index) => (
            <UnifiedCard key={index} className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  {value.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
              <p className="text-gray-600 leading-relaxed">{value.description}</p>
            </UnifiedCard>
          ))}
        </ResponsiveGrid>
      </ContentSection>

      {/* Join Us Section */}
      <ContentSection background="blue">
        <div className="text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-6">Rejoignez Notre Équipe</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Vous partagez notre vision ? Nous sommes toujours à la recherche de talents passionnés 
            pour nous rejoindre dans cette aventure qui transforme l'avenir professionnel.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 max-w-4xl mx-auto mb-8">
            <h3 className="text-xl font-semibold mb-6">Pourquoi nous rejoindre ?</h3>
            <ResponsiveGrid cols={2} gap={4} className="text-left">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-white/90">{benefit}</span>
                </div>
              ))}
            </ResponsiveGrid>
          </div>
          
          <Link
            to="/contact"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Nous Contacter
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </ContentSection>
    </PageLayout>
  );
};

export default TeamPage;
