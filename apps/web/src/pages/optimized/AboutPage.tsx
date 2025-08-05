import { Building2, Users, Target, Sparkles, Heart, Award } from 'lucide-react';
import { Layout, Hero, Section, Card, Grid } from '../../components/optimized/Layout';

const AboutPage = () => {
  const values = [
    {
      icon: <Building2 className="w-8 h-8 text-blue-600" />,
      title: 'Innovation',
      description: 'Nous croyons en l\'innovation et l\'adaptation constante aux besoins du marché du travail.'
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: 'Communauté',
      description: 'Nous construisons une communauté forte entre étudiants et entreprises.'
    },
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: 'Excellence',
      description: 'Nous visons l\'excellence dans chaque aspect de notre service.'
    },
    {
      icon: <Sparkles className="w-8 h-8 text-blue-600" />,
      title: 'Créativité',
      description: 'Nous encourageons l\'innovation et la créativité dans tous nos projets.'
    }
  ];

  const milestones = [
    {
      year: '2024',
      title: 'Lancement',
      description: 'Création de la plateforme avec une vision claire : connecter talents et opportunités.'
    },
    {
      year: '2024',
      title: 'Premiers Partenaires',
      description: 'Signature des premiers partenariats avec des entreprises et écoles prestigieuses.'
    },
    {
      year: '2024',
      title: 'Croissance',
      description: 'Plus de 1000 étudiants et 200 entreprises nous font confiance.'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <Hero
        title="Notre Mission"
        subtitle="Faciliter la rencontre entre les étudiants talentueux et les entreprises innovantes pour créer les opportunités de demain."
        background="gradient"
      />

      {/* Values Section */}
      <Section background="white">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Valeurs</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>
        
        <Grid cols={4}>
          {values.map((value, index) => (
            <Card key={index} className="text-center group hover:shadow-xl transition-all duration-300">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  {value.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </Card>
          ))}
        </Grid>
      </Section>

      {/* Story Section */}
      <Section background="gray">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre Histoire</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>
          
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
            <div className="pl-8">
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Fondée en 2024, Adopte un Étudiant est née d'une vision simple : créer un pont entre le monde académique et professionnel. Notre plateforme facilite la mise en relation entre étudiants et entreprises, permettant à chacun de trouver l'opportunité qui lui correspond.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Aujourd'hui, nous continuons à innover et à développer nos services pour répondre aux besoins évolutifs du marché du travail et des nouvelles générations d'étudiants.
              </p>
            </div>
          </Card>
        </div>
      </Section>

      {/* Timeline Section */}
      <Section background="white">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre Parcours</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-20 text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto">
                    {milestone.year}
                  </div>
                </div>
                <Card className="flex-1 ml-6">
                  <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Team Preview Section */}
      <Section background="blue">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Une Équipe Passionnée</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Notre équipe est composée de professionnels expérimentés, unis par la passion de connecter les talents aux opportunités.
          </p>
          
          <Grid cols={3} className="mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Passion</h3>
              <p className="text-white/80">Nous aimons ce que nous faisons</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Expertise</h3>
              <p className="text-white/80">Des années d'expérience</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Collaboration</h3>
              <p className="text-white/80">Ensemble vers le succès</p>
            </div>
          </Grid>
        </div>
      </Section>
    </Layout>
  );
};

export default AboutPage;
