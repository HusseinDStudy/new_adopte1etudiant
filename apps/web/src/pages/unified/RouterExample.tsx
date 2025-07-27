// Exemple d'intégration des pages uniformisées dans React Router
import { Routes, Route } from 'react-router-dom';
import {
  HomePage,
  TeamPage,
  MissionsPage,
  AboutPage,
  ContactPage,
  MentionsLegalesPage,
  RGPDPage
} from './index';

const AppRouter = () => {
  return (
    <Routes>
      {/* Pages principales */}
      <Route path="/" element={<HomePage />} />
      <Route path="/team" element={<TeamPage />} />
      <Route path="/missions" element={<MissionsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      
      {/* Pages légales */}
      <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
      <Route path="/rgpd" element={<RGPDPage />} />
      <Route path="/privacy" element={<RGPDPage />} /> {/* Alias pour RGPD */}
      
      {/* Redirections pour compatibilité */}
      <Route path="/legal/mentions" element={<MentionsLegalesPage />} />
      <Route path="/legal/privacy" element={<RGPDPage />} />
    </Routes>
  );
};

export default AppRouter;

/*
UTILISATION DANS LE FOOTER :

import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer>
      <div className="legal-links">
        <Link to="/mentions-legales">Mentions légales</Link>
        <Link to="/rgpd">RGPD</Link>
      </div>
    </footer>
  );
};

UTILISATION DANS LA NAVBAR :

const Navbar = () => {
  return (
    <nav>
      <div className="dropdown-menu">
        <Link to="/about">À propos</Link>
        <Link to="/team">Équipe</Link>
        <Link to="/missions">Missions</Link>
        <Link to="/contact">Contact</Link>
        <hr />
        <Link to="/mentions-legales">Mentions légales</Link>
        <Link to="/rgpd">RGPD</Link>
      </div>
    </nav>
  );
};
*/
