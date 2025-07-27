import React from 'react';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'large' | 'medium';
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  children,
  variant = 'default'
}) => {
  const getHeightClass = () => {
    switch (variant) {
      case 'large':
        return 'min-h-[80vh]';
      case 'medium':
        return 'py-24';
      default:
        return 'py-16';
    }
  };

  const getTitleSize = () => {
    switch (variant) {
      case 'large':
        return 'text-5xl md:text-7xl';
      case 'medium':
        return 'text-4xl md:text-6xl';
      default:
        return 'text-4xl md:text-5xl';
    }
  };

  return (
    <div className={`relative bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 overflow-hidden ${getHeightClass()} ${variant === 'large' ? 'flex items-center' : ''}`}>
      {/* Complex Organic Background Pattern */}
      <div className="absolute inset-0 w-full h-full">
        <svg className="w-full h-full" viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Large organic shapes */}
          <path d="M-200 200C100 100 300 300 500 200C700 100 900 400 1100 300C1300 200 1500 500 1700 400L1700 0L-200 0Z" fill="rgba(255,255,255,0.05)"/>
          <path d="M-200 400C200 250 400 450 600 350C800 250 1000 550 1200 450C1400 350 1600 650 1800 550L1800 800L-200 800Z" fill="rgba(255,255,255,0.03)"/>

          {/* Flowing curves */}
          <path d="M-100 300C200 200 400 400 600 300C800 200 1000 500 1400 400" stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none"/>
          <path d="M-100 500C300 350 500 550 700 450C900 350 1100 650 1500 550" stroke="rgba(255,255,255,0.08)" strokeWidth="2" fill="none"/>

          {/* Floating elements */}
          <circle cx="150" cy="150" r="40" fill="rgba(255,255,255,0.06)"/>
          <circle cx="1100" cy="200" r="60" fill="rgba(255,255,255,0.04)"/>
          <circle cx="300" cy="600" r="30" fill="rgba(255,255,255,0.08)"/>
          <circle cx="1000" cy="650" r="45" fill="rgba(255,255,255,0.05)"/>

          {/* Abstract organic blobs */}
          <ellipse cx="200" cy="400" rx="80" ry="120" fill="rgba(255,255,255,0.03)" transform="rotate(45 200 400)"/>
          <ellipse cx="1100" cy="500" rx="100" ry="150" fill="rgba(255,255,255,0.04)" transform="rotate(-30 1100 500)"/>

          {/* Additional decorative elements */}
          <path d="M-100 100C150 50 350 150 550 100C750 50 950 200 1400 150" stroke="rgba(255,255,255,0.06)" strokeWidth="2" fill="none"/>
          <path d="M0 700C300 650 500 750 700 700C900 650 1100 800 1500 750" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none"/>

          {/* Small floating particles */}
          <circle cx="400" cy="100" r="15" fill="rgba(255,255,255,0.07)"/>
          <circle cx="900" cy="300" r="20" fill="rgba(255,255,255,0.05)"/>
          <circle cx="600" cy="700" r="18" fill="rgba(255,255,255,0.06)"/>
          <circle cx="200" cy="250" r="12" fill="rgba(255,255,255,0.08)"/>
          <circle cx="1200" cy="400" r="16" fill="rgba(255,255,255,0.06)"/>
          
          {/* Gradient overlays */}
          <defs>
            <radialGradient id="grad1" cx="30%" cy="30%" r="40%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            <radialGradient id="grad2" cx="70%" cy="70%" r="35%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>
          <ellipse cx="360" cy="240" rx="200" ry="150" fill="url(#grad1)"/>
          <ellipse cx="1000" cy="560" rx="180" ry="120" fill="url(#grad2)"/>
          <ellipse cx="100" cy="600" rx="150" ry="100" fill="url(#grad1)"/>
          <ellipse cx="1200" cy="200" rx="160" ry="110" fill="url(#grad2)"/>
        </svg>
      </div>
      
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {subtitle && (
          <div className="text-blue-200 font-semibold text-lg mb-4 uppercase tracking-wide">
            {subtitle}
          </div>
        )}
        
        <h1 className={`${getTitleSize()} font-bold text-white mb-6 leading-tight`}>
          {title}
        </h1>
        
        {description && (
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
            {description}
          </p>
        )}
        
        {children && (
          <div className="mt-8">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSection;
