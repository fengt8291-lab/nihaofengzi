import { PROFILE } from '@/data/profile';

interface HeroAction {
  label: string;
  href: string;
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
