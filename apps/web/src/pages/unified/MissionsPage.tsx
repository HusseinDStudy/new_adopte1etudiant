import { Target, UserCheck, Rocket, GraduationCap, TrendingUp, Users, Building2 } from 'lucide-react';
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

const MissionsPage = () => {
  const missions = [
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: 'Accompagnement Personnalisé',
      description: 'Nous guidons chaque étudiant dans son parcours professionnel avec un suivi adapté à ses besoins, aspirations et objectifs de carrière.'
    },
    {
      icon: <UserCheck className="w-8 h-8 text-blue-600" />,
      title: 'Matching Entreprises-Étudiants',
      description: 'Notre plateforme met en relation les entreprises avec les talents qui correspondent le mieux à leurs besoins et leur culture d\'entreprise.'
    },
    {
      icon: <Rocket className="w-8 h-8 text-blue-600" />,
      title: 'Innovation Pédagogique',
      description: 'Nous développons des outils innovants pour faciliter l\'apprentissage et l\'insertion professionnelle des nouvelles générations.'
    },
    {
      icon: <GraduationCap className="w-8 h-8 text-blue-600" />,
      title: 'Formation Continue',
      description: 'Nous proposons des ressources et formations pour développer les compétences professionnelles et personnelles des étudiants.'
    }
  ];

  const stats = [
    { 
      value: '5000+', 
      label: 'Étudiants accompagnés',
      icon: <Users className="w-6 h-6 text-blue-600" />
    },
    { 
      value: '1000+', 
      label: 'Entreprises partenaires',
      icon: <Building2 className="w-6 h-6 text-blue-600" />
    },
    { 
      value: '90%', 
      label: 'Taux d\'insertion',
      icon: <TrendingUp className="w-6 h-6 text-blue-600" />
    }
  ];

  const impacts = [
    {
      title: 'Réduction du chômage des jeunes',
      description: 'Nous contribuons activement à réduire le taux de chômage des jeunes diplômés en facilitant leur insertion professionnelle.',
      percentage: '25%'
    },
    {
      title: 'Amélioration du matching',
      description: 'Notre algorithme intelligent améliore significativement la qualité des correspondances entre profils et opportunités.',
      percentage: '85%'
    },
    {
      title: 'Satisfaction des entreprises',
      description: 'Les entreprises partenaires expriment une très haute satisfaction concernant la qualité des profils proposés.',
      percentage: '92%'
    }
  ];

  const values = [
    {
      title: 'Excellence',
      description: 'Nous visons l\'excellence dans chaque aspect de notre service pour garantir les meilleurs résultats.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Innovation',
      description: 'Nous innovons constamment pour répondre aux défis évolutifs du marché du travail.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Bienveillance',
      description: 'Nous accompagnons chaque utilisateur avec bienveillance et respect de ses aspirations.',
      color: 'bg-green-100 text-green-600'
    }
  ];

  return (
    <PageLayout>
      {/* Hero Section */}
      <HeroSection
        title="Nos Missions"
        subtitle="Nous nous engageons à transformer l'avenir professionnel en connectant les talents aux opportunités qui leur correspondent vraiment."
        variant="gradient"
      />

      {/* Main Missions */}
      <ContentSection background="white">
        <SectionHeader
          title="Notre Engagement Quotidien"
          subtitle="Découvrez les missions qui guident notre action et notre vision pour l'avenir professionnel des étudiants."
          icon={<Target className="w-6 h-6 text-blue-600" />}
        />
        
        <ResponsiveGrid cols={2} gap={8}>
          {missions.map((mission, index) => (
            <FeatureCard
              key={index}
              icon={mission.icon}
              title={mission.title}
              description={mission.description}
            />
          ))}
        </ResponsiveGrid>
      </ContentSection>

      {/* Stats Section */}
      <ContentSection background="blue">
        <div className="text-center text-white mb-12">
          <h2 className="text-3xl font-bold mb-4">Notre Impact en Chiffres</h2>
          <div className="w-20 h-1 bg-white/50 mx-auto rounded-full"></div>
        </div>
        
        <ResponsiveGrid cols={3}>
          {stats.map((stat, index) => (
            <UnifiedCard key={index} className="text-center border-none">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </UnifiedCard>
          ))}
        </ResponsiveGrid>
      </ContentSection>

      {/* Impact Details */}
      <ContentSection background="gray">
        <SectionHeader
          title="Impact Concret"
          subtitle="Nos actions génèrent un impact mesurable sur l'écosystème de l'emploi et l'avenir des jeunes professionnels."
        />
        
        <ResponsiveGrid cols={3}>
          {impacts.map((impact, index) => (
            <UnifiedCard key={index} className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600 text-white rounded-bl-full flex items-center justify-center font-bold text-sm">
                {impact.percentage}
              </div>
              <div className="pr-8">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{impact.title}</h3>
                <p className="text-gray-600 leading-relaxed">{impact.description}</p>
              </div>
            </UnifiedCard>
          ))}
        </ResponsiveGrid>
      </ContentSection>

      {/* Values Section */}
      <ContentSection background="white">
        <SectionHeader
          title="Nos Valeurs Fondamentales"
          subtitle="Ces valeurs guident chacune de nos décisions et actions pour servir au mieux notre mission."
        />
        
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {values.map((value, index) => (
              <UnifiedCard key={index} className="flex items-start space-x-6 hover:shadow-lg">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${value.color} flex-shrink-0`}>
                  <span className="font-bold text-lg">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              </UnifiedCard>
            ))}
          </div>
        </div>
      </ContentSection>

      {/* Vision Section */}
      <ContentSection background="gradient">
        <div className="text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Rocket className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-6">Notre Vision</h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl mb-8 leading-relaxed">
              Nous imaginons un monde où chaque étudiant trouve sa voie professionnelle idéale et où chaque entreprise 
              découvre les talents qui feront sa réussite. Notre mission est de rendre cette vision réalité grâce à 
              l'innovation technologique et l'accompagnement humain.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-4">Objectifs 2025</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div>
                  <div className="text-2xl font-bold mb-2">10,000+</div>
                  <div className="text-white/90">Étudiants accompagnés</div>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-2">2,000+</div>
                  <div className="text-white/90">Entreprises partenaires</div>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-2">95%</div>
                  <div className="text-white/90">Taux de satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContentSection>

      {/* CTA Section */}
      <CTASection
        title="Rejoignez Notre Mission"
        description="Participez à la transformation de l'avenir professionnel en rejoignant notre communauté d'étudiants et d'entreprises engagés."
        buttonText="Découvrir Nos Opportunités"
        buttonLink="/jobs"
        variant="primary"
      />
    </PageLayout>
  );
};

export default MissionsPage;
