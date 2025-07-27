import { Building2, Users, Target, Sparkles, Heart, Award, Calendar, MapPin } from 'lucide-react';
import {
  PageLayout,
  HeroSection,
  ContentSection,
  SectionHeader,
  FeatureCard,
  ResponsiveGrid,
  UnifiedCard,
  CTASection
} from '../../components/unified/DesignSystem';

const AboutPage = () => {
  const values = [
    {
      icon: <Building2 className="w-8 h-8 text-blue-600" />,
      title: 'Innovation',
      description: 'Nous croyons en l\'innovation et l\'adaptation constante aux besoins évolutifs du marché du travail moderne.'
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: 'Communauté',
      description: 'Nous construisons une communauté forte et bienveillante entre étudiants, entreprises et partenaires.'
    },
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: 'Excellence',
      description: 'Nous visons l\'excellence dans chaque aspect de notre service pour garantir la satisfaction de tous.'
    },
    {
      icon: <Sparkles className="w-8 h-8 text-blue-600" />,
      title: 'Créativité',
      description: 'Nous encourageons l\'innovation et la créativité dans tous nos projets et initiatives.'
    }
  ];

  const milestones = [
    {
      year: '2024',
      quarter: 'Q1',
      title: 'Lancement de la Plateforme',
      description: 'Création de la plateforme avec une vision claire : connecter talents et opportunités de manière innovante.',
      icon: <Sparkles className="w-5 h-5 text-blue-600" />
    },
    {
      year: '2024',
      quarter: 'Q2',
      title: 'Premiers Partenariats',
      description: 'Signature des premiers partenariats stratégiques avec des entreprises et écoles prestigieuses.',
      icon: <Building2 className="w-5 h-5 text-blue-600" />
    },
    {
      year: '2024',
      quarter: 'Q3',
      title: 'Croissance Accélérée',
      description: 'Plus de 1000 étudiants et 200 entreprises nous font confiance pour leurs projets professionnels.',
      icon: <Users className="w-5 h-5 text-blue-600" />
    },
    {
      year: '2024',
      quarter: 'Q4',
      title: 'Expansion Nationale',
      description: 'Extension de nos services à l\'échelle nationale avec de nouveaux partenaires régionaux.',
      icon: <MapPin className="w-5 h-5 text-blue-600" />
    }
  ];

  const teamHighlights = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Passion',
      description: 'Nous aimons ce que nous faisons et cela se ressent dans chaque interaction.'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Expertise',
      description: 'Des années d\'expérience combinées dans l\'éducation et la technologie.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Collaboration',
      description: 'Ensemble, nous construisons l\'avenir professionnel des étudiants.'
    }
  ];

  return (
    <PageLayout>
      {/* Hero Section */}
      <HeroSection
        title="À Propos de Nous"
        subtitle="Découvrez l'histoire, les valeurs et la vision qui nous animent dans notre mission de transformer l'avenir professionnel des étudiants."
        variant="gradient"
      />

      {/* Mission Statement */}
      <ContentSection background="white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre Mission</h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Faciliter la rencontre entre les étudiants talentueux et les entreprises innovantes 
            pour créer les opportunités de demain et construire un avenir professionnel épanouissant.
          </p>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>
      </ContentSection>

      {/* Values Section */}
      <ContentSection background="gray">
        <SectionHeader
          title="Nos Valeurs Fondamentales"
          subtitle="Ces valeurs guident chacune de nos actions et décisions pour servir au mieux notre communauté."
        />
        
        <ResponsiveGrid cols={4}>
          {values.map((value, index) => (
            <FeatureCard
              key={index}
              icon={value.icon}
              title={value.title}
              description={value.description}
            />
          ))}
        </ResponsiveGrid>
      </ContentSection>

      {/* Story Section */}
      <ContentSection background="white">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            title="Notre Histoire"
            subtitle="De l'idée initiale à la réalisation, découvrez le parcours qui nous a menés jusqu'ici."
          />
          
          <UnifiedCard className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-600 to-purple-600"></div>
            <div className="pl-8">
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Fondée en 2024, <strong>Adopte un Étudiant</strong> est née d'une vision simple mais ambitieuse : 
                créer un pont solide et durable entre le monde académique et professionnel. Notre plateforme 
                révolutionne la mise en relation entre étudiants et entreprises, permettant à chacun de 
                trouver l'opportunité qui lui correspond vraiment.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Aujourd'hui, nous continuons à innover et à développer nos services pour répondre aux besoins 
                évolutifs du marché du travail et accompagner les nouvelles générations d'étudiants vers 
                un avenir professionnel épanouissant.
              </p>
            </div>
          </UnifiedCard>
        </div>
      </ContentSection>

      {/* Timeline Section */}
      <ContentSection background="blue">
        <div className="text-center text-white mb-12">
          <h2 className="text-3xl font-bold mb-4">Notre Parcours</h2>
          <div className="w-20 h-1 bg-white/50 mx-auto rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-24 text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex flex-col items-center justify-center font-bold text-sm mx-auto mb-2">
                    <span className="text-xs">{milestone.quarter}</span>
                    <span>{milestone.year}</span>
                  </div>
                </div>
                <UnifiedCard className="flex-1 ml-6">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      {milestone.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 text-gray-900">{milestone.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
                    </div>
                  </div>
                </UnifiedCard>
              </div>
            ))}
          </div>
        </div>
      </ContentSection>

      {/* Team Preview Section */}
      <ContentSection background="white">
        <SectionHeader
          title="Une Équipe Passionnée"
          subtitle="Notre équipe est composée de professionnels expérimentés, unis par la passion de connecter les talents aux opportunités."
        />
        
        <ResponsiveGrid cols={3} className="mb-12">
          {teamHighlights.map((highlight, index) => (
            <UnifiedCard key={index} className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  {highlight.icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">{highlight.title}</h3>
              <p className="text-gray-600">{highlight.description}</p>
            </UnifiedCard>
          ))}
        </ResponsiveGrid>

        <div className="text-center">
          <UnifiedCard className="inline-block">
            <div className="flex items-center space-x-4">
              <Calendar className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">Créée en 2024</div>
                <div className="text-gray-600 text-sm">Une startup en pleine croissance</div>
              </div>
            </div>
          </UnifiedCard>
        </div>
      </ContentSection>

      {/* CTA Section */}
      <CTASection
        title="Rejoignez Notre Aventure"
        description="Découvrez comment nous pouvons vous aider à atteindre vos objectifs professionnels et faire partie de notre communauté grandissante."
        buttonText="En Savoir Plus"
        buttonLink="/team"
        variant="gradient"
      />
    </PageLayout>
  );
};

export default AboutPage;
