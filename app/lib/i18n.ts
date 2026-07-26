/**
 * UI dictionary for the public site — English + Simplified Chinese.
 * Values are plain strings (serializable to client components); use
 * {placeholders} with fmt() for interpolation. Minecraft terms follow
 * the official zh-CN glossary (苦力怕 / 区块 / 重生 / 快捷栏 / 经验).
 */

export type Locale = "en" | "zh";

export function fmt(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

const en = {
  nav: { home: "Home", posts: "Posts", categories: "Categories", about: "About" },
  header: {
    search: "Search",
    setDay: "Set time day",
    setNight: "Set time night",
    langSwitch: "切换到中文",
  },
  hero: {
    badge: "You made it through the wall",
    hi: "Hi, I'm",
    hiEnd: ".",
    record: "This blog is a place to record:",
    readBlog: "Read the blog",
    aboutMe: "About me →",
  },
  stats: {
    title: "Player status",
    level: "Lv.",
    nextLevel: "next level: {next}",
  },
  sections: {
    hotbar: "Daily hotbar",
    hotbarHint: "— hover the slots",
    popular: "★ Popular posts",
    latest: "Latest posts",
    viewAll: "View all {n} →",
    categories: "Categories",
    loot: "Hanging loot",
    lootHint: "— wave your cursor through them",
    articles: "{n} article",
    articlesPlural: "{n} articles",
  },
  post: {
    minRead: "{n} min read",
    views: "{n} views",
    read: "Read",
  },
  postsPage: {
    title: "All posts",
    showing: "{shown} of {total} articles",
    inCategory: " in {name}",
    withTag: " tagged #{tag}",
    all: "All",
    empty: "No posts here yet — this chunk is still generating.",
  },
  article: {
    allPosts: "← All posts",
    draft: "Draft preview — only admins can see this page.",
    archived: "Archived — only admins can see this page.",
    contents: "Contents",
    onThisPage: "On this page",
    backToTop: "↑ Back to top",
    share: "Share",
    older: "← Older",
    newer: "Newer →",
  },
  categoriesPage: {
    title: "Categories",
    subtitle: "{posts} articles across {cats} regions of the map.",
    allCategories: "← All categories",
    emptyRegion: "No posts in this region yet.",
    tagCount: "{n} articles with this tag.",
  },
  about: {
    badge: "Player profile",
    class: "Class",
    skills: "Skills",
    recording: "Recording",
    contact: "Contact",
    questLog: "Quest log",
    questAccepted: "quest accepted",
    cards: "Character cards",
    cardsHint: "— my interests",
    drawHint: "♠ Click any card to draw it forward",
    deck: "Parrotools' deck",
    characterCard: "Character card",
    showcase: "Build showcase",
    inFurnace: "Projects are still in the furnace.",
    contactTitle: "Send a message in a bottle",
    contactBody:
      "Questions about a post, ICPC, or something we could build together — my inbox is an open chest.",
    emailMe: "Email me",
    github: "GitHub →",
  },
  footer: {
    explore: "Explore",
    findMe: "Find me",
    allPosts: "All posts",
    categories: "Categories",
    aboutMe: "About me",
    rss: "RSS feed",
    admin: "Admin",
    builtWith: "© 2026 {name} — built with Next.js, Three.js and one block of TNT",
  },
  search: {
    placeholder: "Search posts… (attention, ICPC, nginx)",
    typeMore: "Type at least 2 characters to search the world.",
    noLoot: "No loot found for “{q}”. Try different keywords.",
    mining: "Mining…",
  },
  intro: {
    loadingWorld: "Loading world",
    skip: "Skip intro →",
  },
  jump: { loading: "Loading" },
  errors: {
    respawn: "Respawn at home",
    tryAgain: "Try again",
    e404: {
      quip: "These chunks were never generated",
      title: "Chunk not found",
      desc: "You wandered past the edge of the map. The page you're looking for doesn't exist — or it fell into the void a long time ago.",
    },
    e403: {
      quip: "This chest is locked",
      title: "You don't have the key",
      desc: "This area is protected and your permissions don't open it. If you think you should have access, ask the server admin to /op you.",
    },
    e500: {
      quip: "Ssssomething went wrong…",
      title: "A creeper got into the server room",
      desc: "The server made a hissing sound and now everything is in pieces. We're already placing the blocks back — try again in a moment.",
    },
    e400: {
      quip: "Unknown or incomplete command",
      title: "That request didn't parse",
      desc: "The server read your request the way a command block reads a typo — red particles everywhere, nothing executed. Check the syntax and try again.",
    },
  },
};

const zh: typeof en = {
  nav: { home: "首页", posts: "文章", categories: "分类", about: "关于" },
  header: {
    search: "搜索",
    setDay: "设为白天",
    setNight: "设为黑夜",
    langSwitch: "Switch to English",
  },
  hero: {
    badge: "你穿墙而过，欢迎来到我的世界",
    hi: "你好，我是",
    hiEnd: "。",
    record: "这个博客用来记录：",
    readBlog: "阅读博客",
    aboutMe: "关于我 →",
  },
  stats: {
    title: "玩家状态",
    level: "等级",
    nextLevel: "下一级：{next}",
  },
  sections: {
    hotbar: "每日快捷栏",
    hotbarHint: "— 悬停查看物品",
    popular: "★ 热门文章",
    latest: "最新文章",
    viewAll: "查看全部 {n} 篇 →",
    categories: "分类",
    loot: "悬挂的战利品",
    lootHint: "— 用光标扫过它们",
    articles: "{n} 篇文章",
    articlesPlural: "{n} 篇文章",
  },
  post: {
    minRead: "{n} 分钟阅读",
    views: "{n} 次浏览",
    read: "阅读",
  },
  postsPage: {
    title: "全部文章",
    showing: "共 {total} 篇，显示 {shown} 篇",
    inCategory: "（分类：{name}）",
    withTag: "（标签：#{tag}）",
    all: "全部",
    empty: "这里还没有文章 —— 这个区块仍在生成中。",
  },
  article: {
    allPosts: "← 全部文章",
    draft: "草稿预览 —— 只有管理员能看到此页。",
    archived: "已归档 —— 只有管理员能看到此页。",
    contents: "目录",
    onThisPage: "本页目录",
    backToTop: "↑ 回到顶部",
    share: "分享",
    older: "← 更早",
    newer: "更新 →",
  },
  categoriesPage: {
    title: "分类",
    subtitle: "共 {posts} 篇文章，分布在地图的 {cats} 个区域。",
    allCategories: "← 全部分类",
    emptyRegion: "这个区域还没有文章。",
    tagCount: "共 {n} 篇文章使用此标签。",
  },
  about: {
    badge: "玩家档案",
    class: "职业",
    skills: "技能",
    recording: "记录内容",
    contact: "联系方式",
    questLog: "任务日志",
    questAccepted: "任务已接受",
    cards: "角色卡牌",
    cardsHint: "— 我的兴趣",
    drawHint: "♠ 点击任意卡牌将它抽到最前",
    deck: "Parrotools 的卡组",
    characterCard: "角色卡牌",
    showcase: "作品展示",
    inFurnace: "项目还在熔炉里锻造中。",
    contactTitle: "寄出一个漂流瓶",
    contactBody:
      "无论是文章相关的问题、ICPC，还是想一起做点什么 —— 我的收件箱是一个敞开的箱子。",
    emailMe: "给我发邮件",
    github: "GitHub →",
  },
  footer: {
    explore: "探索",
    findMe: "找到我",
    allPosts: "全部文章",
    categories: "分类",
    aboutMe: "关于我",
    rss: "RSS 订阅",
    admin: "管理后台",
    builtWith: "© 2026 {name} —— 由 Next.js、Three.js 和一块 TNT 搭建",
  },
  search: {
    placeholder: "搜索文章…（attention、ICPC、nginx）",
    typeMore: "至少输入 2 个字符来搜索这个世界。",
    noLoot: "没有找到“{q}”的战利品，换个关键词试试。",
    mining: "挖掘中…",
  },
  intro: {
    loadingWorld: "加载世界中",
    skip: "跳过动画 →",
  },
  jump: { loading: "加载中" },
  errors: {
    respawn: "回到主城重生",
    tryAgain: "再试一次",
    e404: {
      quip: "这些区块从未被生成",
      title: "未找到区块",
      desc: "你走出了地图的边界。你要找的页面不存在 —— 或者它很久以前就掉进虚空了。",
    },
    e403: {
      quip: "这个箱子上了锁",
      title: "你没有这把钥匙",
      desc: "这片区域受到保护，你的权限打不开它。如果你认为自己应该有权限，请联系服务器管理员给你 /op。",
    },
    e500: {
      quip: "嘶嘶……出了点问题",
      title: "一只苦力怕溜进了机房",
      desc: "服务器发出了嘶嘶声，然后一切都碎成了方块。我们已经在把方块放回去了 —— 稍后再试一次。",
    },
    e400: {
      quip: "未知或不完整的指令",
      title: "这个请求没能解析",
      desc: "服务器读你的请求，就像命令方块读一条打错的指令 —— 红石粒子四溅，什么都没执行。检查一下语法再试试。",
    },
  },
};

export const dicts: Record<Locale, typeof en> = { en, zh };
export type Dict = typeof en;
