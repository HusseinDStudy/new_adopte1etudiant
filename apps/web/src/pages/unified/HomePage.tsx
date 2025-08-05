import { Link } from 'react-router-dom';
import { ArrowRight, Users, Building2, Target, Star, Sparkles, TrendingUp } from 'lucide-react';
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

const HomePage = () => {
  const stats = [
    { number: '1000+', label: 'Étudiants', icon: <Users className="w-6 h-6 text-blue-600" /> },
    { number: '200+', label: 'Entreprises', icon: <Building2 className="w-6 h-6 text-blue-600" /> },
    { number: '500+', label: 'Stages', icon: <Target className="w-6 h-6 text-blue-600" /> },
    { number: '95%', label: 'Satisfaction', icon: <Star className="w-6 h-6 text-blue-600" /> }
  ];

  const features = [
    {
      icon: <Sparkles className="w-8 h-8 text-blue-600" />,
      title: 'Matching Intelligent',
      description: 'Notre algorithme connecte les bons profils avec les bonnes opportunités grâce à une analyse approfondie des compétences et besoins.'
    },
    {
      icon: <Building2 className="w-8 h-8 text-blue-600" />,
      title: 'Entreprises Vérifiées',
      description: 'Toutes nos entreprises partenaires sont vérifiées et approuvées pour garantir des opportunités de qualité.'
    },
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: 'Suivi Personnalisé',
      description: 'Un accompagnement sur mesure tout au long de votre parcours professionnel avec nos experts.'
    }
  ];

  const testimonials = [
    {
      name: 'Marie Dubois',
      role: 'Étudiante en Marketing',
      content: 'Une plateforme exceptionnelle qui m\'a permis de trouver le stage parfait en quelques jours. L\'accompagnement est remarquable.',
      rating: 5
    },
    {
      name: 'Jean Martin',
      role: 'RH chez TechCorp',
      content: 'Nous avons recruté plusieurs stagiaires talentueux grâce à cette plateforme. Le matching est vraiment efficace.',
      rating: 5
    }
  ];

  return (
    <PageLayout>
      {/* Hero Section */}
      <HeroSection
        title="Adoptez le talent qui vous correspond"
        subtitle="La plateforme qui connecte étudiants et entreprises pour des stages et alternances qui correspondent à vos attentes."
        variant="gradient"
      >
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/students"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 inline-flex items-center text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Trouver un Étudiant
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Link
            to="/jobs"
            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 text-lg"
          >
            Trouver un Stage
          </Link>
        </div>
      </HeroSection>

      {/* Stats Section */}
      <ContentSection background="white">
        <ResponsiveGrid cols={4} className="text-center">
          {stats.map((stat, index) => (
            <UnifiedCard key={index} className="text-center border-none shadow-sm hover:shadow-xl transition-all duration-300 group hover:transform hover:-translate-y-2">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  {stat.icon}
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2 group-hover:text-blue-700 transition-colors duration-300">{stat.number}</div>
              <div className="text-gray-600 font-medium group-hover:text-gray-700 transition-colors duration-300">{stat.label}</div>
            </UnifiedCard>
          ))}
        </ResponsiveGrid>
      </ContentSection>

      {/* Features Section */}
      <ContentSection background="gray">
        <SectionHeader
          title="Pourquoi choisir notre plateforme ?"
          subtitle="Nous facilitons la rencontre entre talents et opportunités grâce à notre approche innovante et nos outils de pointe."
          icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
        />
        
        <ResponsiveGrid cols={3}>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </ResponsiveGrid>
      </ContentSection>

      {/* Testimonials Section */}
      <ContentSection background="blue">
        <div className="text-center text-white mb-12">
          <h2 className="text-3xl font-bold mb-4">Ce que disent nos utilisateurs</h2>
          <div className="w-20 h-1 bg-white/50 mx-auto rounded-full"></div>
        </div>
        
        <ResponsiveGrid cols={2}>
          {testimonials.map((testimonial, index) => (
            <UnifiedCard key={index} className="text-gray-900">
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="mb-6 text-gray-700 leading-relaxed italic">
                "{testimonial.content}"
              </p>
              <div className="border-t pt-4">
                <div className="font-semibold text-gray-900">{testimonial.name}</div>
                <div className="text-blue-600 text-sm">{testimonial.role}</div>
              </div>
            </UnifiedCard>
          ))}
        </ResponsiveGrid>
      </ContentSection>

      {/* How it Works Section */}
      <ContentSection background="white">
        <SectionHeader
          title="Comment ça marche ?"
          subtitle="Un processus simple et efficace en 3 étapes pour connecter talents et opportunités."
        />
        
        <ResponsiveGrid cols={3}>
          {[
            {
              step: '1',
              title: 'Inscription',
              description: 'Créez votre profil en quelques minutes et définissez vos préférences.'
            },
            {
              step: '2',
              title: 'Matching',
              description: 'Notre algorithme trouve les meilleures correspondances pour vous.'
            },
            {
              step: '3',
              title: 'Connexion',
              description: 'Entrez en contact et démarrez votre collaboration professionnelle.'
            }
          ].map((step, index) => (
            <UnifiedCard key={index} className="text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {step.step}
                </div>
              </div>
              <div className="pt-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </UnifiedCard>
          ))}
        </ResponsiveGrid>
      </ContentSection>

      {/* CTA Section */}
      <CTASection
        title="Prêt à commencer ?"
        description="Rejoignez des milliers d'étudiants et d'entreprises qui font confiance à notre plateforme pour construire l'avenir professionnel."
        buttonText="S'inscrire Gratuitement"
        buttonLink="/signup"
        variant="gradient"
      />
    </PageLayout>
  );
};

export default HomePage;
