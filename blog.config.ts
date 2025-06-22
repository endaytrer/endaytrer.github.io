interface BlogConfig {
  realName: string,
  siteName: string,
  bio: string[],
  sites: {
    name: string,
    url: string,
    introduction: string,
  }[],
  social: {
    type: "facebook" | "instagram" | "twitter" | "whatsapp" | "telegram" | "github" | "rednote" | "leetcode" | "linkedin" | "mail",
    name: string,
    url: string
  }[],
  links: {
    name: string,
    url: string,
  }[],
  copyright: string[],
}
const config: BlogConfig = {
  realName: "Daniel Gu",
  siteName: "danielgu.org",
  bio: [
    "Master student (CS) '24 @ <b>Xi'an Jiaotong University</b>",
    "VISP (CS) '22 @ <b>University of Wisconsin-Madison</b>",
    "<span class=\"text-xl\">🖥️ 🏝️ 🎾 📷</span>"
  ],
  sites: [
    {
        name: "WebGL GPU Path Tracing",
        url: "/sites/path-tracing-webgl",
        introduction: `This interactive WebGL path tracing demo demonstrate path tracing.
        Path tracing technique uses the Monte Carlo method to accurately model global
        illumination, simulate different surface characteristics, and capture a wide range
        of effects observable in a camera system.`
    },
    {
        name: "Chess Bot",
        url: "/sites/chess",
        introduction: `Play with a chess bot, or with a human in the demo.
        This chess bot uses WebAssembly to calculate its moves. The algorithm of the chess bot
        is iterative deepening search with alpha-beta pruning. The bot is ranked at ~1700 elo,
        and may make mistakes.`
    }
  ],
  social: [
    {
      type: "mail",
      name: "Email",
      url: "mailto:zrgu@stu.xjtu.edu.cn"
    },
    {
      type: "github",
      name: "GitHub",
      url: "https://github.com/endaytrer"
    },
    {
      type: "instagram",
      name: "Instagram",
      url: "https://www.instagram.com/endaytrer/"
    },
    {
      type: "rednote",
      name: "rednote",
      url: "https://www.xiaohongshu.com/user/profile/65eac285000000000500e5f4"
    }
  ],
  links: [
    {
      name: "Zhizhen Chen's blog",
      url: "https://blog.zhizhen-chen.top/"
    },
    {
      name: "Augists's blog",
      url: "https://augists.top/"
    },
    {
      name: "Our group's website",
      url: "https://XJTU-NetVerify.github.io/"
    },
  ],
  copyright: [
    "<span class=\"text-sm\">&copy; 2023-2025 danielgu.org</span>",
    "<br />",
    "All the source code are open sourced at <a href=\"https://github.com/endaytrer/main-page\" class=\"underline\">https://github.com/endaytrer/main-page</a>. The license is specified in the git repository. Anyone who uses, modifies, and redistributes shall follow the license specified in the git repository."
  ]
}
export default config