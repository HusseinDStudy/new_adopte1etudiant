import { Link } from 'react-router-dom';
import { ArrowRight, Users, Building2, Target, Star } from 'lucide-react';
import { Layout, Hero, Section, Card, Grid } from '../../components/optimized/Layout';

const HomePage = () => {
  const stats = [
    { number: '1000+', label: 'Étudiants' },
    { number: '200+', label: 'Entreprises' },
    { number: '500+', label: 'Stages' },
    { number: '95%', label: 'Satisfaction' }
  ];

  const features = [
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: 'Matching Intelligent',
      description: 'Notre algorithme connecte les bons profils avec les bonnes opportunités.'
    },
    {
      icon: <Building2 className="w-8 h-8 text-blue-600" />,
      title: 'Entreprises Vérifiées',
      description: 'Toutes nos entreprises partenaires sont vérifiées et approuvées.'
    },
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: 'Suivi Personnalisé',
      description: 'Un accompagnement sur mesure tout au long de votre parcours.'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <Hero
        title="Adoptez le talent qui vous correspond"
        subtitle="La plateforme qui connecte étudiants et entreprises pour des stages et alternances qui correspondent à vos attentes."
        background="gradient"
      >
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/students"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
          >
            Trouver un Étudiant
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
          <Link
            to="/jobs"
            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
          >
            Trouver un Stage
          </Link>
        </div>
      </Hero>

      {/* Stats Section */}
      <Section background="white">
        <Grid cols={4} className="text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </Grid>
      </Section>

      {/* Features Section */}
      <Section background="gray">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pourquoi choisir notre plateforme ?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nous facilitons la rencontre entre talents et opportunités grâce à notre approche innovante.
          </p>
        </div>
        
        <Grid cols={3}>
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </Grid>
      </Section>

      {/* Testimonials Section */}
      <Section background="blue">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-12">Ce que disent nos utilisateurs</h2>
          <Grid cols={2}>
            <Card className="text-gray-900">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="mb-4">"Une plateforme exceptionnelle qui m'a permis de trouver le stage parfait en quelques jours."</p>
              <div className="font-semibold">Marie Dubois, Étudiante</div>
            </Card>
            <Card className="text-gray-900">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="mb-4">"Nous avons recruté plusieurs stagiaires talentueux grâce à cette plateforme."</p>
              <div className="font-semibold">Jean Martin, RH TechCorp</div>
            </Card>
          </Grid>
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="gradient">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Prêt à commencer ?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'étudiants et d'entreprises qui font confiance à notre plateforme.
          </p>
          <Link
            to="/signup"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center text-lg"
          >
            S'inscrire Gratuitement
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </Section>
    </Layout>
  );
};

export default HomePage;
