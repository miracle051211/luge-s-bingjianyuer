"use strict";
const SOURCES={
  "partner": {
    "name": "NHS · 孕期伴侣支持",
    "url": "https://www.nhs.uk/best-start-in-life/pregnancy/advice-for-partners/",
    "note": "孕期陪伴、共同准备与出生后的喂养支持。"
  },
  "birth": {
    "name": "NHS · 分娩陪伴建议",
    "url": "https://www.nhs.uk/best-start-in-life/pregnancy/preparing-for-labour-and-birth/tips-for-your-birthing-partner-or-partners/",
    "note": "交通、物品准备与尊重分娩支持偏好。"
  },
  "sleep": {
    "name": "NHS · 婴儿安全睡眠",
    "url": "https://www.nhs.uk/baby/caring-for-a-newborn/sudden-infant-death-syndrome-sids/",
    "note": "仰卧、独立睡眠空间与睡眠环境。"
  },
  "feeding": {
    "name": "WHO · 6–23 月龄辅食指南（2023）",
    "url": "https://www.who.int/publications/i/item/9789240081864",
    "note": "辅食约 6 个月开始，关注回应式喂养。"
  },
  "development": {
    "name": "国家卫健委 · 婴幼儿早期发展服务指南（2025）",
    "url": "https://www.nhc.gov.cn/fys/c100078/202502/19c9c6dee0274d23822f313a99ae1779.shtml",
    "note": "回应性照护、早期互动与照护原则协调。"
  },
  "play": {
    "name": "UNICEF · 婴幼儿亲子活动",
    "url": "https://www.unicef.org/parenting/child-care/21-learning-activities-babies-and-toddlers",
    "note": "适合日常互动的游戏与陪伴灵感。"
  },
  "parenting": {
    "name": "UNICEF · 0–5 岁积极养育",
    "url": "https://www.unicef.org/asia-pacific/place-for-parents/positive-parenting-ages-0-5",
    "note": "回应情绪、理解行为与温和设定边界。"
  },
  "gender": {
    "name": "UNICEF · 共同承担照护责任",
    "url": "https://www.unicef.org/eca/media/16446/file/Tips_on_Gender_Responsive_Parenting.pdf",
    "note": "父亲参与日常照护，分担家务与规划责任。"
  }
};
const STAGES=[
  {
    "id": "preg-early",
    "mode": "pregnancy",
    "min": 1,
    "max": 12,
    "short": "孕早期",
    "title": "孕早期：1–12 周",
    "description": "产检、家务和休息，先从眼前的几件事安排起。",
    "focusTitle": "先了解她现在需要什么",
    "tasks": [
      {
        "title": "准备陪诊资料和交通",
        "description": "预约、资料与出行由你跟进，陪诊前先确认她的意愿。",
        "tag": "计划与执行",
        "id": "appointments",
        "legacyIndex": 0
      },
      {
        "title": "固定做几项家务",
        "description": "固定负责几项家务，从补货到收尾都自己记着。",
        "tag": "日常分担",
        "id": "housework",
        "legacyIndex": 1
      },
      {
        "title": "听听她这几天的感受",
        "description": "留一段不被手机打断的时间，听她说身体变化和担忧。",
        "tag": "沟通与支持",
        "id": "listen",
        "legacyIndex": 2
      }
    ],
    "focus": [
      "身体不适、用药或检查方面的问题，向产检医护人员咨询。"
    ],
    "sources": [
      "partner",
      "gender"
    ]
  },
  {
    "id": "preg-middle",
    "mode": "pregnancy",
    "min": 13,
    "max": 27,
    "short": "孕中期",
    "title": "孕中期：13–27 周",
    "description": "还有一段准备时间，可以陆续了解照护、核对预算和休假。",
    "focusTitle": "把还没安排的事情记下来",
    "tasks": [
      {
        "title": "一起上课或查阅官方资料",
        "description": "从正规课程或官方资料了解分娩和照护，带着疑问共同学习。",
        "tag": "共同学习",
        "id": "learning",
        "legacyIndex": 0
      },
      {
        "title": "核对开销和休假",
        "description": "把近期支出、单位休假和需要有人在家的时段一起核对。",
        "tag": "计划与执行",
        "id": "leave-budget",
        "legacyIndex": 1
      },
      {
        "title": "忙起来也维持家务分工",
        "description": "按约定持续做，忙不过来时提前安排替代办法。",
        "tag": "日常分担",
        "id": "housework",
        "legacyIndex": 2
      }
    ],
    "focus": [
      "陪诊、触摸腹部和分享照片前，先确认她的意愿。"
    ],
    "sources": [
      "partner",
      "gender"
    ]
  },
  {
    "id": "preg-late",
    "mode": "pregnancy",
    "min": 28,
    "max": 42,
    "short": "孕晚期",
    "title": "孕晚期：28 周起",
    "description": "临近出生，把待产用品、出行和回家后的生活安排核对一遍。",
    "focusTitle": "先试一遍，再看看缺什么",
    "tasks": [
      {
        "title": "整理待产包和出行安排",
        "description": "按医院要求备齐证件、用品和备用出行方案。",
        "tag": "计划与执行",
        "id": "birth-bag",
        "legacyIndex": 0
      },
      {
        "title": "问清她的分娩陪伴偏好",
        "description": "尊重她想要的陪伴方式，经同意后再向家人转达。",
        "tag": "沟通与支持",
        "id": "birth-preferences",
        "legacyIndex": 1
      },
      {
        "title": "约好回家后的分工",
        "description": "写清餐食、家务与夜间轮换；宝宝出生后再按实际情况调整。",
        "tag": "共同分工",
        "id": "home-roles",
        "legacyIndex": 2
      }
    ],
    "focus": [
      "分娩计划可能变化；就诊与待产安排遵循所在机构指导。"
    ],
    "sources": [
      "birth",
      "partner"
    ]
  },
  {
    "id": "baby-newborn",
    "mode": "baby",
    "min": 0,
    "max": 1,
    "short": "0–1 月",
    "title": "出生初期：0–1 月",
    "description": "先熟悉换尿布、清洁和安抚，再安排喂养支持与家中事务。",
    "focusTitle": "睡眠环境和休息安排都要顾到",
    "tasks": [
      {
        "title": "练习换尿布、清洁和安抚",
        "description": "照护前准备齐用品，练习基本操作，也做好清洁和补货。",
        "tag": "日常照护",
        "id": "daily-care",
        "legacyIndex": 0
      },
      {
        "title": "安排一段能休息的时间",
        "description": "说清谁接哪一班，让休息时间少被临时事务打断。",
        "tag": "共同分工",
        "id": "rest-shift",
        "legacyIndex": 1
      },
      {
        "title": "分担喂养前后的事情",
        "description": "按实际喂养方式分担准备、清洗或喂养，遇到困难一起求助。",
        "tag": "喂养支持",
        "id": "feeding-support",
        "legacyIndex": 2
      }
    ],
    "focus": [
      "每次睡眠让宝宝仰卧，使用坚实平坦的独立婴儿床；至少前 6 个月同室不同床。",
      "床内避免枕头、软玩具与松散被褥；避免抱宝宝在沙发或扶手椅上睡着。"
    ],
    "sources": [
      "sleep",
      "partner"
    ]
  },
  {
    "id": "baby-young",
    "mode": "baby",
    "min": 2,
    "max": 5,
    "short": "2–5 月",
    "title": "早期互动：2–5 月",
    "description": "在每天的照护里，慢慢熟悉宝宝的声音、表情和作息。",
    "focusTitle": "看宝宝的反应，也看看彼此累不累",
    "tasks": [
      {
        "title": "和清醒的宝宝说说话",
        "description": "跟着宝宝的声音和表情回应，给他接话或休息的时间。",
        "tag": "回应与陪伴",
        "id": "responsive-interaction",
        "legacyIndex": 0
      },
      {
        "title": "约好你照护的时段",
        "description": "固定接下一个时段，连同用品和家务一起安排；累了就调整。",
        "tag": "日常照护",
        "id": "care-shift",
        "legacyIndex": 1
      },
      {
        "title": "准备儿童保健的预约和资料",
        "description": "按当地安排准备预约、交通和资料，带上想问的问题。",
        "tag": "计划与执行",
        "id": "child-checkup",
        "legacyIndex": 2
      }
    ],
    "focus": [
      "留意眼神、动作和声音，回应宝宝的需要；互动不用凑次数。",
      "继续检查安全睡眠环境。两个人都累时，重新商量照护时段。"
    ],
    "sources": [
      "development",
      "sleep"
    ]
  },
  {
    "id": "baby-food",
    "mode": "baby",
    "min": 6,
    "max": 11,
    "short": "6–11 月",
    "title": "探索与辅食：6–11 月",
    "description": "宝宝开始接触辅食和更多物品，喂养、看护和收拾都有事情可做。",
    "focusTitle": "吃饭看信号，探索看环境",
    "tasks": [
      {
        "title": "准备并陪好一餐辅食",
        "description": "从准备到陪餐、清理完整负责一餐，留意宝宝吃饭的信号。",
        "tag": "喂养与清洁",
        "id": "meal",
        "legacyIndex": 0
      },
      {
        "title": "检查宝宝够得到的地方",
        "description": "活动范围变了就重查环境，把有风险的物品收好。",
        "tag": "日常照护",
        "id": "home-safety",
        "legacyIndex": 1
      },
      {
        "title": "一起玩藏找或取放游戏",
        "description": "用简单物品陪宝宝藏找、取放，按兴趣和疲惫调整。",
        "tag": "回应与陪伴",
        "id": "play",
        "legacyIndex": 2
      }
    ],
    "focus": [
      "辅食一般约 6 个月开始；特殊喂养需要遵循专业人员的个体指导。",
      "观察饥饿和吃饱的信号，避免强迫进食；继续维护安全睡眠环境。"
    ],
    "sources": [
      "feeding",
      "development",
      "sleep"
    ]
  },
  {
    "id": "baby-toddler",
    "mode": "baby",
    "min": 12,
    "max": 24,
    "short": "12–24 月",
    "title": "表达与探索：12–24 月",
    "description": "吃饭、穿衣、看书都是交流的机会，不必专门安排一套训练。",
    "focusTitle": "给孩子说话和尝试的时间",
    "tasks": [
      {
        "title": "照护时说说正在做什么",
        "description": "把吃饭、穿衣和洗澡变成交流机会，留时间让孩子回应和尝试。",
        "tag": "回应与陪伴",
        "id": "daily-conversation",
        "legacyIndex": 0
      },
      {
        "title": "固定留出看书和玩耍的时间",
        "description": "准备绘本或积木，让孩子选活动，陪伴后也做好收尾。",
        "tag": "共同学习",
        "id": "reading-play",
        "legacyIndex": 1
      },
      {
        "title": "和家人说清照护做法",
        "description": "常见问题先和伴侣商量，再向其他照护者说明。",
        "tag": "计划与执行",
        "id": "care-agreement",
        "legacyIndex": 2
      }
    ],
    "focus": [
      "孩子有自己的发展节奏；具体发育或身体问题向专业人员咨询。"
    ],
    "sources": [
      "development",
      "play"
    ]
  },
  {
    "id": "baby-preschool",
    "mode": "baby",
    "min": 25,
    "max": 36,
    "short": "25–36 月",
    "title": "尝试与自主：25–36 月",
    "description": "孩子想自己做的事情多了，留些时间陪他试，也安排好日常照护。",
    "focusTitle": "能尝试的放手，必要的边界说清楚",
    "tasks": [
      {
        "title": "陪孩子试着收玩具、选衣服",
        "description": "让孩子做能力范围内的小事；大人仍负责安排和最终收尾。",
        "tag": "支持自主",
        "id": "independence",
        "legacyIndex": 0
      },
      {
        "title": "准备一次阅读、游戏或外出",
        "description": "让孩子按兴趣选择阅读、游戏或外出，不因性别限制选择。",
        "tag": "回应与陪伴",
        "id": "activities",
        "legacyIndex": 1
      },
      {
        "title": "有情绪时先缓一缓",
        "description": "先回应情绪，再简短说明边界；与伴侣保持做法一致。",
        "tag": "沟通与支持",
        "id": "emotions",
        "legacyIndex": 2
      }
    ],
    "focus": [
      "不以打骂或羞辱管教，帮助孩子逐步学习表达与规则。"
    ],
    "sources": [
      "parenting",
      "development"
    ]
  }
];
window.PARENTING_DATA={sources:SOURCES,stages:STAGES};
