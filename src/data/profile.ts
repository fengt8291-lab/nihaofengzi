export type ExperienceCategory = 'campus' | 'work' | 'research';

export interface ProfileExperience {
  id: string;
  category: ExperienceCategory;
  title: string;
  organization?: string;
  role: string;
  period: string;
  summary: string;
  responsibilities: readonly string[];
  featured: boolean;
  resume: boolean;
  boundary?: string;
}

export interface ProfileCapability {
  title: string;
  description: string;
  evidence: readonly string[];
}

export const PROFILE = {
  name: {
    chinese: '田丰',
    english: 'Tian Feng',
    username: 'Typhooooon',
  },
  brand: {
    chinese: '你好丰子',
    english: 'Nihao Fengzi',
  },
  location: '北京',
  education: {
    school: '首都经济贸易大学',
    college: '工商管理学院',
    major: '工商管理（数智管理实验班）',
    stage: '本科在读',
    period: '2024.09—预计 2028',
  },
  summary:
    '我学习工商管理与数智管理，也在校园组织、研究整理、门店兼职、产品实践和内容创作中积累经验。',
  contact: {
    email: 'nihaofengzi@yeah.net',
    github: {
      username: 'fengt8291-lab',
      url: 'https://github.com/fengt8291-lab',
    },
  },
  about: {
    introduction: [
      '我在北京出生和成长，目前就读于首都经济贸易大学工商管理学院。我的大学经历并不是一条完全固定的路线：专业、班级、宿舍和个人方向都经历过变化。我也在这些变化中重新判断自己适合什么、真正想做什么。',
      '与其把大学生活理解为沿着一条预设路线前进，我更愿意把它看作一个持续认识自己、修正方向并建立能力结构的过程。',
    ],
    focus: [
      '我学习工商管理和数智管理，但不希望管理知识只停留在概念、考试和报告中。我更希望看到它如何进入真实的组织、产品和个人工作流程。',
      '我长期使用 ChatGPT、Codex、OpenClaw 等 AI 工具。使用得越多，我越意识到，真正困难的不是让 AI 生成内容，而是定义问题、组织上下文、判断结果、承担责任和持续迭代。',
      '我持续关注的也不只是 AI，而是人在变化的技术和环境中，如何保持判断、行动能力和对现实生活的连接。',
    ],
    turningPoints: [
      {
        title: '大学阶段多次调整方向',
        period: '大一至大二上学期',
        description:
          '专业、班级、宿舍和发展方向都经历过变化。我也反复比较过保研、考研、出国、就业和独立创造等路径。这个过程让我更重视可验证的能力、可持续的生活节奏和自主选择，也逐渐不再希望只依赖一个身份标签获得安全感。',
      },
      {
        title: '开始独立推进数字产品和网站',
        period: '2026 年 1 月至今',
        description:
          '我开始更系统地使用 AI 工具，从想法出发推进 DailyTasks、今夜补救、OrgGamify 和你好丰子等网页或产品原型。在这个过程中，我逐渐意识到，“会不会手写所有代码”并不是唯一关键能力；问题定义、内容结构、验收标准、调试、取舍和复盘同样重要。做出网页原型也不等于完成产品，真实用户反馈和持续运营仍然是下一步。',
      },
      {
        title: '进入真实组织、工作和研究流程',
        description:
          '学生会、班级事务、青马班、无印良品兼职和 ESG 报告项目，让我看到很多能力无法被个人项目代替：按流程协作、面对他人需求、处理重复细节、保证准确，以及在具体角色中承担责任。',
      },
    ],
    current: [
      '我现在最重要的身份仍然是一名本科生。我正在建立更清晰的能力结构和职业方向，也在整理个人经历、项目、研究成果和作品。',
      '“你好丰子”会成为一个长期维护的个人数字空间。它既服务于阶段性的求职和展示，也会继续记录我的观点、生活和变化，而不被某一种职业身份永久限制。',
    ],
  },
  experiences: [
    {
      id: 'student-union',
      category: 'campus',
      title: '首都经济贸易大学校学生会',
      role: '办公室部长',
      period: '2025.09—2026.06',
      summary: '参与校级活动、学生公共事务、对外交流以及公众号内容工作。',
      responsibilities: [
        '参与校级大型活动的前期筹备、现场执行和宣传记录。',
        '参与学生代表大会、研究生代表大会、相关会议和校园歌手大赛等活动支持。',
        '参与北京多所高校交流、参访和研讨活动。',
        '参与学生会公众号内容排版与文稿工作。',
      ],
      featured: true,
      resume: true,
    },
    {
      id: 'class-monitor',
      category: 'campus',
      title: '班级公共事务',
      role: '班长',
      period: '2024.09—至今',
      summary: '长期处理班级信息沟通、师生协调和部分日常公共事务。',
      responsibilities: [
        '传达和整理班级通知。',
        '协调同学与老师之间的信息。',
        '处理部分班级日常事务。',
      ],
      featured: false,
      resume: true,
    },
    {
      id: 'qingma',
      category: 'campus',
      title: '第五期“青马工程”大学生骨干培训班',
      role: '组长',
      period: '2025.11—至今',
      summary: '参与培训活动组织、现场教学、内容整理与新闻稿写作。',
      responsibilities: [
        '参与走进北京市政务服务中心和“北京 12345”红色教育现场教学。',
        '旁听热线、观看《您的声音》片段并与优秀接线员交流。',
        '参与活动内容整理和新闻稿写作。',
      ],
      featured: false,
      resume: true,
    },
    {
      id: 'muji',
      category: 'work',
      title: '无印良品学生兼职',
      organization: '无印良品 MUJI',
      role: '学生兼职',
      period: '2025.08—2025.10',
      summary: '在门店现场参与顾客服务、商品与陈列维护以及日常运营支持。',
      responsibilities: [
        '顾客接待与基础咨询。',
        '商品整理、补货和上架。',
        '陈列维护与卖场秩序整理。',
        '开闭店和临时门店工作支持。',
      ],
      featured: true,
      resume: true,
    },
    {
      id: 'esg-report',
      category: 'research',
      title: '中国 ESG 研究院报告项目',
      organization: '首都经济贸易大学中国 ESG 研究院',
      role: '数据整理与文字校对',
      period: '2024',
      summary:
        '参与《中国上市公司 ESG 评价报告（2024）》项目，依据企业年报、ESG 报告或可持续发展报告等公开材料，完成信息检索、摘录、整理、规范录入与指定章节文字校对。',
      responsibilities: [
        '根据企业年报、ESG 报告或可持续发展报告等公开材料检索披露内容。',
        '摘录、整理企业数据并录入指定统计网站。',
        '对报告第 10.2.2—19.4.3 节进行文字校对。',
        '使用 Excel、PDF 阅读检索工具和在线录入平台完成资料整理。',
      ],
      featured: true,
      resume: true,
      boundary: '本人没有独立撰写报告章节，也不将完整报告成果归为个人成果。',
    },
  ] satisfies readonly ProfileExperience[],
  capabilities: [
    {
      title: '产品问题定义与用户洞察',
      description: '从具体生活场景中定义问题、确定最小闭环，并判断哪些功能不应该加入。',
      evidence: ['DailyTasks', '今夜补救', '回岸'],
    },
    {
      title: '研究与信息整理',
      description: '检索、筛选、摘录和组织学术文献、年报、ESG 报告和长篇材料。',
      evidence: ['ESG 报告项目', '工作场所设计文献综述'],
    },
    {
      title: '写作、演示与视觉信息整理',
      description: '完成新闻稿、课程论文、项目文档、汇报稿、演示文稿和结构化长文。',
      evidence: ['青马班新闻稿', '课程报告与演示', '学生会公众号排版'],
    },
    {
      title: '组织与团队协作',
      description: '在既有流程和多人分工中完成工作，并处理信息协调、活动支持和临时任务。',
      evidence: ['校学生会办公室', '班级公共事务', '无印良品兼职'],
    },
    {
      title: 'AI 协作与数字原型',
      description:
        '使用 ChatGPT、Codex、OpenClaw、GitHub 及前端工具组织上下文、推进网页原型，并进行验收和复盘。',
      evidence: ['DailyTasks', '今夜补救', 'OrgGamify', '你好丰子'],
    },
  ] satisfies readonly ProfileCapability[],
} as const;

export const getProfileExperiences = (ids: readonly string[]) =>
  ids.map((id) => {
    const experience = PROFILE.experiences.find((entry) => entry.id === id);

    if (!experience) throw new Error(`Unknown profile experience: ${id}`);
    return experience;
  });
