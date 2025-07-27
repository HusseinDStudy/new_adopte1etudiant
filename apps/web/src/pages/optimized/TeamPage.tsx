import { Link } from 'react-router-dom';
import { ArrowRight, Linkedin, Twitter, Mail, Users, Target, Lightbulb } from 'lucide-react';
import { Layout, Hero, Section, Card, Grid } from '../../components/optimized/Layout';

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
      bio: 'Expert en technologie avec 10 ans d\'expérience, Marc dirige le développement technique de notre plateforme.',
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
      description: 'Nous croyons en la force du travail d\'équipe et de la collaboration.'
    },
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: 'Excellence',
      description: 'Nous visons l\'excellence dans tout ce que nous entreprenons.'
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-blue-600" />,
      title: 'Innovation',
      description: 'Nous innovons constamment pour améliorer notre service.'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <Hero
        title="Notre Équipe"
        subtitle="Rencontrez les personnes passionnées qui rendent possible la connexion entre talents et opportunités."
        background="gradient"
      />

      {/* Team Grid */}
      <Section background="white">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Les Visages de Notre Succès</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>
        
        <Grid cols={2} gap={8}>
          {teamMembers.map((member, index) => (
            <Card key={index} className="text-center group hover:shadow-xl transition-all duration-300">
              <div className="relative mb-6">
                <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=128&background=3b82f6&color=ffffff`;
                    }}
                  />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
              <p className="text-blue-600 font-semibold mb-4">{member.role}</p>
              <p className="text-gray-600 mb-6 leading-relaxed">{member.bio}</p>
              
              <div className="flex justify-center space-x-4">
                <a
                  href={member.linkedin}
                  className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                >
                  <Linkedin className="w-5 h-5 text-blue-600" />
                </a>
                <a
                  href={member.twitter}
                  className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                >
                  <Twitter className="w-5 h-5 text-blue-600" />
                </a>
                <a
                  href={`mailto:${member.email}`}
                  className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                >
                  <Mail className="w-5 h-5 text-blue-600" />
                </a>
              </div>
            </Card>
          ))}
        </Grid>
      </Section>

      {/* Company Values */}
      <Section background="gray">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Valeurs d'Équipe</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ces valeurs guident notre travail quotidien et notre vision commune.
          </p>
        </div>
        
        <Grid cols={3}>
          {values.map((value, index) => (
            <Card key={index} className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  {value.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </Card>
          ))}
        </Grid>
      </Section>

      {/* Join Us CTA */}
      <Section background="blue">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Rejoignez Notre Équipe</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Vous partagez notre vision ? Nous sommes toujours à la recherche de talents passionnés pour nous rejoindre dans cette aventure.
          </p>
          
          <div className="bg-white/10 rounded-lg p-8 max-w-2xl mx-auto mb-8">
            <h3 className="text-xl font-semibold mb-4">Pourquoi nous rejoindre ?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Environnement de travail stimulant</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Opportunités de croissance</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Impact social positif</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Équipe passionnée</span>
              </div>
            </div>
          </div>
          
          <Link
            to="/contact"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center text-lg"
          >
            Nous Contacter
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </Section>
    </Layout>
  );
};

export default TeamPage;
