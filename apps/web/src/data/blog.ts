export interface BlogPost {
  id: number;
  title: string;
  category: string;
  date: string;
  author: string;
  readTime: string;
  excerpt: string;
  content: string;
  image: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Comment réussir son entretien de stage",
    category: "Conseils",
    date: "2024-02-20",
    author: "Marie Dubois",
    readTime: "5 min",
    excerpt: "Découvrez nos conseils pour briller lors de votre entretien et décrocher le stage de vos rêves. Des astuces pratiques et des exemples concrets pour vous préparer efficacement.",
    content: `
      <p class="mb-4">Les entretiens de stage peuvent être stressants, mais avec une bonne préparation, vous pouvez vous démarquer et décrocher le stage de vos rêves. Voici nos conseils pour réussir votre entretien :</p>

      <h2 class="text-2xl font-semibold mt-8 mb-4">1. Préparez-vous en amont</h2>
      <p class="mb-4">Recherchez des informations sur l'entreprise, sa culture, ses valeurs et ses projets actuels. Préparez des questions pertinentes à poser lors de l'entretien.</p>

      <h2 class="text-2xl font-semibold mt-8 mb-4">2. Maîtrisez votre présentation</h2>
      <p class="mb-4">Entraînez-vous à présenter votre parcours de manière claire et concise. Mettez en avant vos compétences et expériences pertinentes pour le poste.</p>

      <h2 class="text-2xl font-semibold mt-8 mb-4">3. Soyez professionnel</h2>
      <p class="mb-4">Arrivez à l'heure, habillez-vous de manière appropriée et adoptez une attitude positive et enthousiaste tout au long de l'entretien.</p>
    `,
    image: "/api/placeholder/600/400"
  },
  {
    id: 2,
    title: "Les compétences les plus recherchées en 2024",
    category: "Tendances",
    date: "2024-02-18",
    author: "Thomas Martin",
    readTime: "7 min",
    excerpt: "Le marché du travail évolue rapidement. Découvrez les compétences techniques et soft skills qui feront la différence pour votre carrière cette année.",
    content: `
      <p class="mb-4">Dans un monde professionnel en constante évolution, il est crucial de rester à jour avec les compétences les plus demandées. Voici les tendances pour 2024 :</p>

      <h2 class="text-2xl font-semibold mt-8 mb-4">1. Intelligence Artificielle et Machine Learning</h2>
      <p class="mb-4">La demande pour les professionnels maîtrisant l'IA et le ML continue de croître. Les entreprises recherchent des talents capables de développer et déployer des solutions innovantes.</p>

      <h2 class="text-2xl font-semibold mt-8 mb-4">2. Cybersécurité</h2>
      <p class="mb-4">Avec l'augmentation des cyberattaques, les experts en sécurité informatique sont plus recherchés que jamais. La protection des données devient une priorité absolue.</p>

      <h2 class="text-2xl font-semibold mt-8 mb-4">3. Soft Skills</h2>
      <p class="mb-4">L'adaptabilité, la communication et la pensée critique restent essentielles. Les employeurs valorisent de plus en plus ces compétences transversales.</p>
    `,
    image: "/api/placeholder/600/400"
  },
  {
    id: 3,
    title: "5 erreurs à éviter dans votre CV",
    category: "CV & Lettre",
    date: "2024-02-15",
    author: "Sophie Bernard",
    readTime: "4 min",
    excerpt: "Ne laissez pas ces erreurs communes ruiner vos chances d'obtenir un entretien. Apprenez à les identifier et à les corriger pour un CV parfait.",
    content: `
      <p class="mb-4">Un CV bien rédigé est votre première chance de faire bonne impression. Évitez ces erreurs courantes pour maximiser vos chances :</p>

      <h2 class="text-2xl font-semibold mt-8 mb-4">1. Fautes d'orthographe</h2>
      <p class="mb-4">Relisez plusieurs fois votre CV et faites-le relire par quelqu'un d'autre. Les fautes d'orthographe donnent une mauvaise image de votre professionnalisme.</p>

      <h2 class="text-2xl font-semibold mt-8 mb-4">2. Mise en page incohérente</h2>
      <p class="mb-4">Gardez une mise en page claire et cohérente. Utilisez des polices lisibles et évitez les designs trop chargés.</p>

      <h2 class="text-2xl font-semibold mt-8 mb-4">3. Informations obsolètes</h2>
      <p class="mb-4">Mettez à jour régulièrement votre CV avec vos dernières expériences et compétences. Retirez les informations qui ne sont plus pertinentes.</p>
    `,
    image: "/api/placeholder/600/400"
  },
  {
    id: 4,
    title: "Guide complet de la recherche de stage",
    category: "Conseils",
    date: "2024-02-12",
    author: "Julie Moreau",
    readTime: "8 min",
    excerpt: "De la définition de vos objectifs à la signature de votre contrat, découvrez toutes les étapes pour une recherche de stage réussie.",
    content: `
      <p class="mb-4">La recherche de stage peut sembler complexe, mais en suivant une méthode structurée, vous maximiserez vos chances de succès. Voici notre guide complet :</p>

      <h2 class="text-2xl font-semibold mt-8 mb-4">1. Définissez vos objectifs</h2>
      <p class="mb-4">Avant de commencer vos recherches, clarifiez vos objectifs professionnels et le type d'expérience que vous souhaitez acquérir.</p>

      <h2 class="text-2xl font-semibold mt-8 mb-4">2. Identifiez les entreprises cibles</h2>
      <p class="mb-4">Dressez une liste d'entreprises qui correspondent à vos aspirations et recherchez des informations sur leurs programmes de stage.</p>

      <h2 class="text-2xl font-semibold mt-8 mb-4">3. Préparez vos documents</h2>
      <p class="mb-4">CV, lettre de motivation et portfolio doivent être adaptés à chaque candidature pour maximiser vos chances.</p>
    `,
    image: "/api/placeholder/600/400"
  },
  {
    id: 5,
    title: "L'importance du networking pour les étudiants",
    category: "Tendances",
    date: "2024-02-10",
    author: "Pierre Durand",
    readTime: "6 min",
    excerpt: "Construire un réseau professionnel dès vos études peut transformer votre carrière. Découvrez comment développer efficacement votre réseau.",
    content: `
      <p class="mb-4">Le networking n'est pas réservé aux professionnels expérimentés. En tant qu'étudiant, développer votre réseau peut ouvrir de nombreuses opportunités :</p>

      <h2 class="text-2xl font-semibold mt-8 mb-4">1. Participez aux événements étudiants</h2>
      <p class="mb-4">Salons, conférences et forums étudiants sont d'excellentes occasions de rencontrer des professionnels de votre secteur.</p>

      <h2 class="text-2xl font-semibold mt-8 mb-4">2. Utilisez LinkedIn efficacement</h2>
      <p class="mb-4">Créez un profil professionnel et connectez-vous avec vos camarades, professeurs et professionnels rencontrés.</p>

      <h2 class="text-2xl font-semibold mt-8 mb-4">3. Maintenez le contact</h2>
      <p class="mb-4">Le networking ne s'arrête pas à la première rencontre. Entretenez vos relations professionnelles sur le long terme.</p>
    `,
    image: "/api/placeholder/600/400"
  },
  {
    id: 6,
    title: "Rédiger une lettre de motivation percutante",
    category: "CV & Lettre",
    date: "2024-02-08",
    author: "Camille Rousseau",
    readTime: "5 min",
    excerpt: "Une lettre de motivation bien rédigée peut faire la différence. Apprenez à structurer et personnaliser votre lettre pour chaque candidature.",
    content: `
      <p class="mb-4">La lettre de motivation reste un élément clé de votre candidature. Voici comment la rendre irrésistible :</p>

      <h2 class="text-2xl font-semibold mt-8 mb-4">1. Personnalisez chaque lettre</h2>
      <p class="mb-4">Adaptez votre lettre à l'entreprise et au poste visé. Montrez que vous avez fait vos recherches.</p>

      <h2 class="text-2xl font-semibold mt-8 mb-4">2. Structurez votre argumentation</h2>
      <p class="mb-4">Introduction accrocheuse, développement de vos motivations et compétences, conclusion avec appel à l'action.</p>

      <h2 class="text-2xl font-semibold mt-8 mb-4">3. Soyez concis et impactant</h2>
      <p class="mb-4">Une page maximum, des phrases courtes et percutantes, un ton professionnel mais authentique.</p>
    `,
    image: "/api/placeholder/600/400"
  }
];
