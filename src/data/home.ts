interface HeroAction {
  label: string;
  href: string;
}

interface HeroContent {
  brand: {
    english: string;
    chinese: string;
  };
  title: string;
  description: string;
  primaryAction: HeroAction;
  secondaryAction: HeroAction;
  currentExploration: HeroAction;
}

export const HERO_CONTENT: HeroContent = {
  brand: {
    english: 'NIHAO FENGZI',
    chinese: '你好丰子',
  },
  title: '探索 AI 时代的个人创造力。',
  description: '我在学习、研究与创造中，探索人与 AI 如何协作，并把想法变成真实的产品与体验。',
  primaryAction: {
    label: '查看项目',
    href: '#selected-projects',
  },
  secondaryAction: {
    label: '了解我',
    href: '#about-snapshot',
  },
  currentExploration: {
    label: 'Currently Exploring',
    href: '#currently-exploring',
  },
};
