import { PROFILE } from '@/data/profile';

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

interface HomeHeroContent {
  eyebrow: {
    chinese: string;
    english: string;
  };
  title: string;
  supportingTitle: string;
  introduction: string;
  actions: readonly HeroAction[];
}

interface HomeNowItem {
  label: string;
  description: string;
}

export const HOME_HERO: HomeHeroContent = {
  eyebrow: {
    chinese: PROFILE.brand.chinese,
    english: PROFILE.brand.english,
  },
  title: `你好，我是${PROFILE.name.chinese}。`,
  supportingTitle: '我在管理、技术与真实生活之间持续学习和实践。',
  introduction: `我是${PROFILE.education.school}${PROFILE.education.major}本科生。这里记录我的校园经历、研究与作品，以及生活中仍在形成的想法。`,
  actions: [
    { label: '了解我', href: '/about/' },
    { label: '查看作品', href: '/work/' },
  ],
};

export const HOME_ABOUT = {
  title: '关于我',
  paragraphs: [
    '我不是单纯以某个职业标签定义自己的人。大学阶段，我在专业方向、组织角色、研究主题和个人项目之间不断尝试，也逐渐学会通过具体行动，而不是只靠想象，判断自己真正适合什么。',
    '我学习工商管理与数智管理，也在学生组织、班级事务、研究整理、门店兼职、产品实践和内容创作中积累经验。我希望把管理知识、数字工具和对真实生活的观察连接起来，做出能够被看见、被使用，也经得起复盘的东西。',
  ],
  action: { label: '了解更多', href: '/about/' },
};

export const HOME_NOW = {
  updatedAt: '2026-07-01',
  items: [
    {
      label: '正在学习',
      description:
        '工商管理与数智化管理相关课程，以及 AI 协作工作流、产品设计、网站开发和内容表达。',
    },
    {
      label: '正在制作',
      description: '个人主页“你好丰子”、DailyTasks、今夜补救，以及已有项目和作品的系统整理。',
    },
    {
      label: '正在思考',
      description:
        '如何建立更清晰的能力结构与职业方向；如何在升学、就业和独立创造之间作出长期选择；如何在追求线上产出的同时维持现实生活、健康和稳定节奏。',
    },
    {
      label: '正在生活',
      description: '在游泳、健身、旅行、拍摄和日常阅读中寻找稳定节奏。',
    },
  ] satisfies readonly HomeNowItem[],
};

export const HOME_EXPERIENCE_IDS = ['student-union', 'muji', 'esg-report'] as const;

export const HOME_SECTIONS = {
  now: {
    eyebrow: 'Now / 此刻',
    title: '此刻',
    description: '记录我在当前阶段学习、制作、思考与生活的重心。',
  },
  experience: {
    eyebrow: 'Experience / 经历',
    title: '在具体角色中学习承担责任。',
    description: '我的能力不只来自个人项目，也来自校园组织、公共事务、研究整理和真实工作流程。',
  },
  work: {
    eyebrow: 'Selected Work / 精选作品',
    title: '把判断变成可以复盘的作品。',
    description:
      '以下是我在产品、用户研究与数字实践中的一些尝试。它们仍在形成，但每个项目都留下了具体的判断、过程和可验证成果。',
  },
  contact: {
    eyebrow: 'Contact / 联系',
    title: '保持联系',
    description: '如果你对我的经历、项目、研究或内容感兴趣，欢迎通过邮箱或 GitHub 与我联系。',
  },
} as const;

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
