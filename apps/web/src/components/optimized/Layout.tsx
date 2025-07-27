import { ReactNode } from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export const Layout = ({ children, className = '' }: LayoutProps) => {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

interface SectionProps {
  children: ReactNode;
  className?: string;
  background?: 'white' | 'gray' | 'blue' | 'gradient';
}

export const Section = ({ children, className = '', background = 'white' }: SectionProps) => {
  const bgClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    blue: 'bg-blue-50',
    gradient: 'bg-gradient-to-br from-blue-50 to-purple-50'
  };

  return (
    <section className={`py-16 ${bgClasses[background]} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
};

interface HeroProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  background?: 'blue' | 'gradient' | 'dark';
}

export const Hero = ({ title, subtitle, children, background = 'blue' }: HeroProps) => {
  const bgClasses = {
    blue: 'bg-blue-600',
    gradient: 'bg-gradient-to-r from-blue-600 to-purple-600',
    dark: 'bg-gray-900'
  };

  return (
    <section className={`${bgClasses[background]} text-white py-20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
};

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card = ({ children, className = '', hover = true }: CardProps) => {
  return (
    <div className={`
      bg-white rounded-lg shadow-md p-6
      ${hover ? 'hover:shadow-lg transition-shadow duration-300' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

interface GridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 4 | 6 | 8;
  className?: string;
}

export const Grid = ({ children, cols = 3, gap = 8, className = '' }: GridProps) => {
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
