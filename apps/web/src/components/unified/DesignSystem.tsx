import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export const PageLayout = ({ children, className = '' }: PageLayoutProps) => {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// ============================================================================
// HERO SECTION
// ============================================================================

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  variant?: 'gradient' | 'primary' | 'dark';
  pattern?: boolean;
}

export const HeroSection = ({ 
  title, 
  subtitle, 
  children, 
  variant = 'gradient',
  pattern = true 
}: HeroSectionProps) => {
  const variants = {
    gradient: 'bg-gradient-to-r from-blue-600 to-purple-600',
    primary: 'bg-blue-600',
    dark: 'bg-gray-900'
  };

  return (
    <section className={`relative py-20 overflow-hidden ${variants[variant]}`}>
      {/* Background Pattern */}
      {pattern && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white/20 blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white/30 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full bg-white/20 blur-3xl"></div>
        </div>
      )}
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
        <div className="w-20 h-1 bg-white/50 mx-auto rounded-full mb-8"></div>
        {children}
      </div>
    </section>
  );
};

// ============================================================================
// CONTENT SECTION
// ============================================================================

interface ContentSectionProps {
  children: ReactNode;
  background?: 'white' | 'gray' | 'blue' | 'dark-blue' | 'gradient';
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const ContentSection = ({ 
  children, 
  background = 'white', 
  className = '',
  maxWidth = 'xl'
}: ContentSectionProps) => {
  const backgrounds = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    blue: 'bg-blue-50',
    'dark-blue': 'bg-blue-600',
    gradient: 'bg-gradient-to-br from-blue-50 to-purple-50'
  };

  const maxWidths = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <section className={`py-16 ${backgrounds[background]} ${className}`}>
      <div className={`${maxWidths[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8`}>
        {children}
      </div>
    </section>
  );
};

// ============================================================================
// SECTION HEADER
// ============================================================================

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  centered?: boolean;
}

export const SectionHeader = ({ title, subtitle, icon, centered = true }: SectionHeaderProps) => {
  return (
    <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
      {icon && (
        <div className={`flex ${centered ? 'justify-center' : ''} mb-4`}>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            {icon}
          </div>
        </div>
      )}
      <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
      {subtitle && (
        <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
      <div className={`w-20 h-1 bg-blue-600 rounded-full mt-6 ${centered ? 'mx-auto' : ''}`}></div>
    </div>
  );
};

// ============================================================================
// CARD COMPONENT
// ============================================================================

interface UnifiedCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  variant?: 'default' | 'bordered' | 'elevated';
}

export const UnifiedCard = ({ 
  children, 
  className = '', 
  hover = true,
  variant = 'default'
}: UnifiedCardProps) => {
  const variants = {
    default: 'bg-white shadow-md',
    bordered: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg'
  };

  return (
    <div className={`
      ${variants[variant]} rounded-lg p-6
      ${hover ? 'hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

// ============================================================================
// GRID SYSTEM
// ============================================================================

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 4 | 6 | 8;
  className?: string;
}

export const ResponsiveGrid = ({ 
  children, 
  cols = 3, 
  gap = 8, 
  className = '' 
}: ResponsiveGridProps) => {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const gapClasses = {
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8'
  };

  return (
    <div className={`grid ${colClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

// ============================================================================
// FEATURE CARD
// ============================================================================

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export const FeatureCard = ({ icon, title, description, className = '' }: FeatureCardProps) => {
  return (
    <UnifiedCard className={`text-center group hover:transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl ${className}`}>
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg transition-all duration-300">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-blue-700 transition-colors duration-300">{title}</h3>
      <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{description}</p>
    </UnifiedCard>
  );
};

// ============================================================================
// CTA SECTION
// ============================================================================

interface CTASectionProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  variant?: 'primary' | 'gradient';
}

export const CTASection = ({ 
  title, 
  description, 
  buttonText, 
  buttonLink,
  variant = 'primary'
}: CTASectionProps) => {
  const variants = {
    primary: 'bg-blue-600',
    gradient: 'bg-gradient-to-r from-blue-600 to-purple-600'
  };

  return (
    <ContentSection background="white" className="py-0">
      <div className={`${variants[variant]} rounded-xl text-white p-12 text-center relative overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/20 blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-6">{title}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
          <Link
            to={buttonLink}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center text-lg"
          >
            {buttonText}
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </ContentSection>
  );
};
