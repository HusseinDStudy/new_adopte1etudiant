import { Shield, Database, Users, Lock, Eye, FileText, Mail, AlertTriangle } from 'lucide-react';
import {
  HeroSection,
  ContentSection,
  SectionHeader,
  UnifiedCard,
  ResponsiveGrid
} from '../../components/unified/DesignSystem';

const RGPDPage = () => {
  const dataTypes = [
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Données d'identification",
      items: ["Nom et prénom", "Adresse email", "Numéro de téléphone", "Date de naissance"]
    },
    {
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      title: "Données académiques",
      items: ["Établissement d'études", "Niveau d'études", "Spécialisation", "CV et portfolio"]
    },
    {
      icon: <Database className="w-6 h-6 text-blue-600" />,
      title: "Données professionnelles",
      items: ["Expériences professionnelles", "Compétences", "Préférences de poste", "Disponibilités"]
    }
  ];

  const rights = [
    {
      icon: <Eye className="w-6 h-6 text-blue-600" />,
      title: "Droit d'accès",
      description: "Vous pouvez demander l'accès aux données personnelles que nous détenons sur vous."
    },
    {
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      title: "Droit de rectification",
      description: "Vous pouvez demander la correction de données inexactes ou incomplètes."
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-blue-600" />,
      title: "Droit à l'effacement",
      description: "Vous pouvez demander la suppression de vos données dans certaines conditions."
    },
    {
      icon: <Lock className="w-6 h-6 text-blue-600" />,
      title: "Droit à la portabilité",
      description: "Vous pouvez récupérer vos données dans un format structuré et lisible."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection
        title="Règlement Général sur la Protection des Données"
        subtitle="Notre engagement pour la protection de votre vie privée et de vos données personnelles"
        variant="primary"
      />

      {/* Introduction */}
      <ContentSection background="white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre engagement RGPD</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Adopte un Étudiant s'engage à protéger la vie privée de ses utilisateurs conformément au
            Règlement Général sur la Protection des Données (RGPD) de l'Union européenne, en vigueur depuis le 25 mai 2018.
          </p>
          <div className="mt-6 inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-700 font-medium">Dernière mise à jour : 1er janvier 2024</span>
          </div>
        </div>
      </ContentSection>

      {/* Data Collection */}
      <ContentSection background="gray">
        <SectionHeader
          title="Données collectées"
          subtitle="Nous collectons uniquement les données nécessaires au fonctionnement de nos services"
          icon={<Database className="w-6 h-6 text-blue-600" />}
        />
        
        <ResponsiveGrid cols={3}>
          {dataTypes.map((dataType, index) => (
            <UnifiedCard key={index} className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  {dataType.icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">{dataType.title}</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {dataType.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </UnifiedCard>
          ))}
        </ResponsiveGrid>
      </ContentSection>

      {/* Data Usage */}
      <ContentSection background="white">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            title="Utilisation des données"
            subtitle="Vos données sont utilisées exclusivement pour les finalités suivantes"
            centered={false}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UnifiedCard>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Finalités principales</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Création et gestion de votre compte utilisateur
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Mise en relation avec les entreprises partenaires
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Amélioration de nos algorithmes de matching
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Communication relative à nos services
                </li>
              </ul>
            </UnifiedCard>

            <UnifiedCard>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Bases légales</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Exécution du contrat de service
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Consentement explicite de l'utilisateur
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Intérêt légitime pour l'amélioration des services
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Obligations légales et réglementaires
                </li>
              </ul>
            </UnifiedCard>
          </div>
        </div>
      </ContentSection>

      {/* User Rights */}
      <ContentSection background="dark-blue">
        <div className="text-center text-white mb-12">
          <h2 className="text-3xl font-bold mb-4">Vos droits RGPD</h2>
          <p className="text-xl max-w-3xl mx-auto">
            Conformément au RGPD, vous disposez de droits étendus sur vos données personnelles
          </p>
          <div className="w-20 h-1 bg-white/50 mx-auto rounded-full mt-6"></div>
        </div>
        
        <ResponsiveGrid cols={2} gap={6}>
          {rights.map((right, index) => (
            <UnifiedCard key={index} className="text-gray-900">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {right.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{right.title}</h3>
                  <p className="text-gray-600">{right.description}</p>
                </div>
              </div>
            </UnifiedCard>
          ))}
        </ResponsiveGrid>
      </ContentSection>

      {/* Contact DPO */}
      <ContentSection background="white">
        <div className="max-w-3xl mx-auto">
          <UnifiedCard className="text-center bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Exercer vos droits</h3>
            <p className="text-gray-600 mb-6">
              Pour exercer vos droits ou pour toute question concernant le traitement de vos données personnelles,
              contactez notre Délégué à la Protection des Données (DPO).
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <a href="mailto:dpo@adopte-un-etudiant.fr" className="text-blue-600 hover:text-blue-800 font-medium">
                  dpo@adopte-un-etudiant.fr
                </a>
              </div>
              <p className="text-sm text-gray-500">
                Délai de réponse : 30 jours maximum
              </p>
            </div>
          </UnifiedCard>
        </div>
      </ContentSection>
    </div>
  );
};

export default RGPDPage;
