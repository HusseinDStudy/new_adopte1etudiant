import { Link } from 'react-router-dom';
import { Building2, GraduationCap, Handshake, ArrowRight, Eye, Users, HeadphonesIcon } from 'lucide-react';
import { Layout, Hero, Section, Card, Grid } from '../../components/optimized/Layout';

const PartnersPage = () => {
  const companies = [
    { name: 'Tech Corp', logo: '/company-partner1.webp' },
    { name: 'Innovation Labs', logo: '/company-partner2.webp' },
    { name: 'Digital Solutions', logo: '/company-partner3.webp' },
    { name: 'Future Systems', logo: '/company-partner4.webp' },
    { name: 'Smart Tech', logo: '/company-partner5.webp' },
    { name: 'Data Analytics', logo: '/company-partner6.webp' }
  ];

  const schools = [
    { name: 'École Polytechnique', logo: '/school-partner1.webp' },
    { name: 'HEC Paris', logo: '/school-partner2.webp' },
    { name: 'ESSEC', logo: '/school-partner3.webp' },
    { name: 'École 42', logo: '/school-partner4.webp' },
    { name: 'EPITECH', logo: '/school-partner5.webp' },
    { name: 'ESCP', logo: '/school-partner6.webp' }
  ];

  const benefits = [
    {
      icon: <Eye className="w-8 h-8 text-blue-600" />,
      title: 'Visibilité',
      description: 'Mettez en avant votre marque auprès d\'une communauté ciblée d\'étudiants motivés.'
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: 'Recrutement',
      description: 'Trouvez les talents qui correspondent exactement à vos besoins.'
    },
    {
      icon: <HeadphonesIcon className="w-8 h-8 text-blue-600" />,
      title: 'Accompagnement',
      description: 'Bénéficiez d\'un suivi personnalisé tout au long du processus.'
    }
  ];

  const advantages = [
    'Accès prioritaire aux profils étudiants',
    'Événements de recrutement exclusifs',
    'Contenu personnalisé et stratégique',
    'Support dédié et assistance recrutement'
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <Hero
        title="Nos Partenaires"
        subtitle="Un réseau d'entreprises et d'écoles engagées pour la réussite des étudiants"
        background="gradient"
      />

      {/* Companies Section */}
      <Section background="white">
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Entreprises Partenaires</h2>
        </div>
        <p className="text-gray-600 max-w-3xl mb-10">
          Ces entreprises innovantes s'associent à notre plateforme pour proposer des opportunités 
          de stage de qualité et contribuer à la formation de la nouvelle génération de professionnels.
        </p>
        
        <Grid cols={3} gap={6}>
          {companies.map((company, index) => (
            <Card key={index} className="flex items-center justify-center p-8 group">
              <img
                src={company.logo}
                alt={company.name}
                className="w-24 h-24 object-contain group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&size=96&background=3b82f6&color=ffffff`;
                }}
              />
            </Card>
          ))}
        </Grid>
      </Section>

      {/* Schools Section */}
      <Section background="gray">
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <GraduationCap className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Écoles Partenaires</h2>
        </div>
        <p className="text-gray-600 max-w-3xl mb-10">
          Nous collaborons avec des institutions d'enseignement supérieur de premier plan pour faciliter 
          l'accès des étudiants à des opportunités professionnelles enrichissantes.
        </p>
        
        <Grid cols={3} gap={6}>
          {schools.map((school, index) => (
            <Card key={index} className="flex items-center justify-center p-8 group">
              <img
                src={school.logo}
                alt={school.name}
                className="w-24 h-24 object-contain group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(school.name)}&size=96&background=3b82f6&color=ffffff`;
                }}
              />
            </Card>
          ))}
        </Grid>
      </Section>

      {/* Partnership Benefits */}
      <Section background="white">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Avantages du Partenariat</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>
        
        <Grid cols={3}>
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  {benefit.icon}
                </div>
              </div>
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </Card>
          ))}
        </Grid>
      </Section>

      {/* Become Partner CTA */}
      <Section background="blue">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left side - Content */}
          <div className="flex-1 text-white">
            <div className="flex items-center mb-6">
              <Handshake className="w-10 h-10 mr-4" />
              <h2 className="text-3xl font-bold">Devenir Partenaire</h2>
            </div>
            <p className="text-xl mb-8 leading-relaxed">
              Rejoignez notre réseau de partenaires et participez à la formation de la prochaine génération de talents. 
              Ensemble, créons des opportunités qui façonneront l'avenir professionnel des étudiants.
            </p>
            <Link
              to="/contact"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center text-lg"
            >
              Nous Contacter
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>

          {/* Right side - Advantages Box */}
          <div className="bg-blue-500/30 backdrop-blur-sm rounded-3xl p-4 max-w-sm">
            <h3 className="text-xl font-bold text-white mb-6">Avantages partenaires</h3>
            <ul className="space-y-4">
              {advantages.map((advantage, index) => (
                <li key={index} className="flex items-start text-white">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-xs">✓</span>
                  </div>
                  <span className="text-sm">{advantage}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </Layout>
  );
};

export default PartnersPage;
