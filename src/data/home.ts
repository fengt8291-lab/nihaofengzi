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

interface ExplorationItem {
  title: string;
  description: string;
}

interface ResearchDirection {
  title: string;
  description: string;
}

interface AboutSnapshotContent {
  title: string;
  description: string;
  note: string;
}

interface ContactContent {
  title: string;
  description: string;
  placeholder: string;
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

export const CURRENT_EXPLORING = {
  updatedAt: '2026-07-16',
  items: [
    {
      title: 'AI Agent 如何进入个人工作流',
      description: '观察 AI 工具如何参与思考、组织信息与执行任务，并形成更自然的日常协作方式。',
    },
    {
      title: '人与 AI 如何形成协作关系',
      description: '持续理解人在判断、创造和行动中应该保留什么，以及 AI 可以承担什么。',
    },
    {
      title: '一个人如何借助 AI 完成产品探索',
      description: '通过真实项目检验从问题发现、产品构思到独立实践的可能路径。',
    },
  ] satisfies ExplorationItem[],
};

export const RESEARCH_DIRECTIONS: ResearchDirection[] = [
  {
    title: 'AI 员工与一人公司',
    description: '关注生成式 AI 与 AI Agent 进入个人工作流程后，个人组织方式与管理逻辑如何变化。',
  },
  {
    title: '人机协作',
    description: '探索 AI 如何成为思考与创造的协作者，以及人与工具之间更自然的协作关系。',
  },
  {
    title: '数智化管理研究',
    description: '从工商管理与数智化管理视角，持续理解数字化转型、组织行为与人工智能管理问题。',
  },
];

export const ABOUT_SNAPSHOT: AboutSnapshotContent = {
  title: '在商业、AI 与产品实践之间，建立自己的连接。',
  description:
    '我以工商管理与数智化管理为学习背景，关注人工智能、人机协作与产品设计，也通过独立项目检验自己的思考。',
  note: '这里记录的不是一个完成后的答案，而是学习、研究、创造与实践持续发生的过程。',
};

export const CONTACT_CONTENT: ContactContent = {
  title: '欢迎交流正在发生的想法。',
  description: '如果你也关注 AI 产品、人机协作或个人创造方式，期待未来在这里与你建立连接。',
  placeholder: '联系方式整理中',
};
