/**
 * Normalizes skill names to ensure consistency across the application.
 * Handles special cases for common compound skill names.
 */
export const normalizeSkillName = (name: string): string => {
  if (!name) return '';

  // Special cases for common compound skill names
  const specialCases: Record<string, string> = {
    'typescript': 'TypeScript',
    'javascript': 'JavaScript',
    'nodejs': 'Node.js',
    'node.js': 'Node.js',
    'vuejs': 'Vue.js',
    'vue.js': 'Vue.js',
    'reactjs': 'React.js',
    'react.js': 'React.js',
    'nextjs': 'Next.js',
    'next.js': 'Next.js',
    'angularjs': 'Angular.js',
    'angular.js': 'Angular.js',
    'mongodb': 'MongoDB',
    'postgresql': 'PostgreSQL',
    'mysql': 'MySQL',
    'graphql': 'GraphQL',
    'restapi': 'REST API',
    'rest api': 'REST API',
    'api': 'API',
    'html': 'Html',
    'css': 'CSS',
    'sql': 'SQL',
    'nosql': 'NoSQL',
    'devops': 'DevOps',
    'github': 'GitHub',
    'gitlab': 'GitLab',
    'bitbucket': 'BitBucket',
    'aws': 'AWS',
    'gcp': 'GCP',
    'azure': 'Azure',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes',
    'redis': 'Redis',
    'elasticsearch': 'Elasticsearch',
    'firebase': 'Firebase',
    'android': 'Android',
    'ios': 'iOS',
    'macos': 'macOS',
    'linux': 'Linux',
    'windows': 'Windows',
    'ubuntu': 'Ubuntu',
    'centos': 'CentOS',
    'debian': 'Debian',
    'fedora': 'Fedora',
    'php': 'PHP',
    'python': 'Python',
    'java': 'Java',
    'c++': 'C++',
    'c#': 'C#',
    'go': 'Go',
    'rust': 'Rust',
    'swift': 'Swift',
    'kotlin': 'Kotlin',
    'scala': 'Scala',
    'ruby': 'Ruby',
    'perl': 'Perl',
    'r': 'R',
    'matlab': 'MATLAB',
    'sass': 'Sass',
    'scss': 'SCSS',
    'less': 'Less',
    'webpack': 'Webpack',
    'babel': 'Babel',
    'eslint': 'ESLint',
    'prettier': 'Prettier',
    'jest': 'Jest',
    'mocha': 'Mocha',
    'chai': 'Chai',
    'cypress': 'Cypress',
    'selenium': 'Selenium',
    'junit': 'JUnit',
    'asp.net': 'Asp.net',
    'ui/ux': 'Ui/ux',
    'machine-learning': 'Machine-learning',
    'testng': 'TestNG',
    'spring': 'Spring',
    'springboot': 'Spring Boot',
    'spring boot': 'Spring Boot',
    'django': 'Django',
    'flask': 'Flask',
    'fastapi': 'FastAPI',
    'express': 'Express',
    'expressjs': 'Express.js',
    'express.js': 'Express.js',
    'nestjs': 'NestJS',
    'nest.js': 'NestJS',
    'laravel': 'Laravel',
    'symfony': 'Symfony',
    'codeigniter': 'CodeIgniter',
    'rails': 'Rails',
    'rubyonrails': 'Ruby on Rails',
    'ruby on rails': 'Ruby on Rails',
    'aspnet': 'ASP.NET',
    '.net': '.NET',
    'dotnet': '.NET',
    'xamarin': 'Xamarin',
    'unity': 'Unity',
    'unreal': 'Unreal',
    'unrealengine': 'Unreal Engine',
    'unreal engine': 'Unreal Engine'
  };
  
  const cleanedName = name.trim().replace(/\s+/g, ' ');
  const lowerName = cleanedName.toLowerCase();

  // Handle empty strings after cleaning
  if (!cleanedName) return '';
  
  // Check for special cases first
  if (specialCases[lowerName]) {
    return specialCases[lowerName];
  }
  
  // Default normalization for other skills
  return cleanedName
    .toLowerCase()
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
