import { File, Building2, User, Server, Copyright, Shield } from 'lucide-react';
import {
  HeroSection,
  ContentSection,
  SectionHeader,
  UnifiedCard
} from '../../components/unified/DesignSystem';

const MentionsLegalesPage = () => {
  const sections = [
    {
      icon: <Building2 className="w-6 h-6 text-blue-600" />,
      title: "1. Éditeur du site",
      content: (
        <div className="space-y-2 text-gray-600">
          <p><strong>Adopte un Étudiant</strong></p>
          <p>Société par Actions Simplifiée (SAS)</p>
          <p>Capital social : 10 000€</p>
          <p>RCS Paris B 123 456 789</p>
          <p>SIRET : 12345678901234</p>
          <p>TVA Intracommunautaire : FR12345678901</p>
          <p>Siège social : 123 Avenue des Champs-Élysées, 75008 Paris, France</p>
          <p>Email : <a href="mailto:contact@adopte-un-etudiant.fr" className="text-blue-600 hover:text-blue-800">contact@adopte-un-etudiant.fr</a></p>
          <p>Téléphone : <a href="tel:+33123456789" className="text-blue-600 hover:text-blue-800">+33 1 23 45 67 89</a></p>
        </div>
      )
    },
    {
      icon: <User className="w-6 h-6 text-blue-600" />,
      title: "2. Directeur de la publication",
      content: (
        <div className="text-gray-600">
          <p><strong>Sarah Johnson</strong>, Présidente</p>
          <p>Responsable éditorial : Marc Dubois, CTO</p>
          <p>Email : <a href="mailto:direction@adopte-un-etudiant.fr" className="text-blue-600 hover:text-blue-800">direction@adopte-un-etudiant.fr</a></p>
        </div>
      )
    },
    {
      icon: <Server className="w-6 h-6 text-blue-600" />,
      title: "3. Hébergement",
      content: (
        <div className="space-y-4 text-gray-600">
          <div>
            <p><strong>Hébergeur principal :</strong></p>
            <p>OVH SAS</p>
            <p>2 rue Kellermann</p>
            <p>59100 Roubaix, France</p>
            <p>Téléphone : +33 9 72 10 10 07</p>
          </div>
          <div>
            <p><strong>CDN et services cloud :</strong></p>
            <p>Cloudflare, Inc.</p>
            <p>101 Townsend St, San Francisco, CA 94107, USA</p>
          </div>
        </div>
      )
    },
    {
      icon: <Copyright className="w-6 h-6 text-blue-600" />,
      title: "4. Propriété intellectuelle",
      content: (
        <div className="space-y-4 text-gray-600">
          <p>
            L'ensemble du contenu de ce site web (textes, images, vidéos, logos, graphismes, icônes, sons, logiciels, etc.)
            est protégé par le droit d'auteur, le droit des marques et/ou tout autre droit de propriété intellectuelle.
          </p>
          <p>
            Ces éléments sont la propriété exclusive d'Adopte un Étudiant ou font l'objet d'une autorisation d'utilisation.
            Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site,
            quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable.
          </p>
          <p>
            Toute exploitation non autorisée du site ou de l'un quelconque des éléments qu'il contient sera considérée
            comme constitutive d'une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et
            suivants du Code de Propriété Intellectuelle.
          </p>
        </div>
      )
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      title: "5. Protection des données personnelles",
      content: (
        <div className="space-y-4 text-gray-600">
          <p>
            Conformément à la loi "Informatique et Libertés" du 6 janvier 1978 modifiée et au Règlement Général 
            sur la Protection des Données (RGPD) du 27 avril 2016, vous disposez d'un droit d'accès, de rectification, 
            de suppression, d'opposition, de limitation du traitement et de portabilité des données vous concernant.
          </p>
          <p>
            Pour exercer ces droits ou pour toute question sur le traitement de vos données, vous pouvez nous contacter :
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Par email : <a href="mailto:dpo@adopte-un-etudiant.fr" className="text-blue-600 hover:text-blue-800">dpo@adopte-un-etudiant.fr</a></li>
            <li>Par courrier : Adopte un Étudiant - DPO, 123 Avenue des Champs-Élysées, 75008 Paris</li>
          </ul>
          <p>
            Vous pouvez également introduire une réclamation auprès de la Commission Nationale de l'Informatique
            et des Libertés (CNIL) : <a href="https://www.cnil.fr" className="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection
        title="Mentions Légales"
        subtitle="Informations légales et réglementaires concernant le site Adopte un Étudiant"
        variant="primary"
      />

      {/* Legal Content */}
      <ContentSection background="white" maxWidth="lg">
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <File className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <UnifiedCard key={index} className="hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {section.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{section.title}</h2>
                  {section.content}
                </div>
              </div>
            </UnifiedCard>
          ))}
        </div>

        {/* Additional Information */}
        <UnifiedCard className="mt-8 bg-blue-50 border-blue-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Informations complémentaires</h3>
            <p className="text-blue-700 text-sm">
              Ces mentions légales ont été mises à jour le 1er janvier 2024.
              Elles peuvent être modifiées à tout moment pour se conformer aux évolutions légales et réglementaires.
            </p>
          </div>
        </UnifiedCard>
      </ContentSection>
    </div>
  );
};

export default MentionsLegalesPage;
