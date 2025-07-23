import { supabase } from './supabase.js';

// 区域中文翻译映射
const regionTranslations = {
  "North America": "北美洲",
  "South America": "南美洲",
  "Europe": "欧洲",
  "Asia": "亚洲",
  "South Asia": "南亚",
  "Africa": "非洲",
  "Oceania": "大洋洲",
  "Americas": "美洲" // 添加Americas的翻译，作为备用
};

// 初始化国家信息数据（仅包含详细信息的国家）
let countryData = {
  // United States
  "US": {
    name: "United States",
    name_zh: "美国",
    region: "North America",
    region_zh: "北美洲",
    flagUrl: "https://flagcdn.com/us.svg",
    cards: {
      "economic_environment": {
        title: "经济环境",
        content: "经济水平较高，人均GDP为65,280美元。科技产业发达，消费能力强。",
        note: "注：2023年GDP总量为26.95万亿美元，全球第一"
      },
      "payment_habits": {
        title: "付费习惯",
        content: "游戏用户平均年支出为75.3美元，付费意愿高，信用卡使用普遍。",
        note: "注：移动游戏ARPU值全球第二，仅次于日本（2023年）"
      },
      "infrastructure": {
        title: "基础设施",
        content: "网络覆盖率99%，平均网速为180Mbps，5G普及率高。",
        note: "注：互联网渗透率92.1%（2023年）；5G覆盖人口比例86.2%（2023年）"
      },
      "demographics": {
        title: "人口特征",
        content: "人口3.31亿，中位年龄38.5岁，城市化率82.7%。",
        note: "注：16-24岁人口占比12.2%，25-34岁人口占比14.1%（2023年）"
      },
      "game_market": {
        title: "游戏市场",
        content: "游戏市场规模约510亿美元，手游占比45%，主机和PC游戏发达。",
        note: "注：2023年市场同比增长3.2%，预计2025年达570亿美元"
      },
      "game_preferences": {
        title: "游戏偏好",
        content: "偏好3A大作、射击和角色扮演类游戏，竞技游戏受欢迎。",
        note: "注：主流游戏类型：射击（22%）、角色扮演（18%）、策略（15%）（2023年）"
      },
      "app_usage": {
        title: "应用使用",
        content: "平均每人安装95个应用，每日使用4.2小时，社交媒体使用率高。",
        note: "注：每月活跃应用平均数35个，社交媒体日均使用时长2.3小时（2023年）"
      },
      "mobile_payment": {
        title: "移动支付",
        content: "Apple Pay和Google Pay普及，信用卡仍为主要支付方式。",
        note: "注：移动支付渗透率为43%，年交易额约1.2万亿美元（2023年）"
      },
      "cultural_customs": {
        title: "文化习俗",
        content: "消费文化发达，喜欢个性化内容，注重用户体验和客户服务。",
        note: "注：83%的消费者愿为优质服务支付额外费用（2022年消费者调查）"
      }
    },
    // 保留原有数据以兼容旧代码
    officialName: "United States of America",
    capital: "Washington, D.C.",
    population: 331002651,
    area: 9833520,
    languages: ["English", "Spanish"],
    currency: "United States Dollar (USD)",
    description: "The United States of America is a country primarily located in North America consisting of 50 states, a federal district, five major unincorporated territories, and nine Minor Outlying Islands. It is the world's third-largest country by both land and total area.",
    landmarks: ["Statue of Liberty", "Grand Canyon", "Golden Gate Bridge", "White House"],
    timeZones: ["UTC-12:00 to UTC+12:00", "Standard Time Zones: 6"],
    drivingSide: "Right",
    callingCode: "+1",
    detailAnalysisUrl: "" // 详细分析链接
  },
  
  // United Kingdom
  "GB": {
    name: "United Kingdom",
    name_zh: "英国",
    officialName: "United Kingdom of Great Britain and Northern Ireland",
    capital: "London",
    region: "Europe",
    region_zh: "欧洲",
    population: 67886011,
    area: 242495,
    languages: ["English", "Welsh", "Scottish Gaelic"],
    currency: "Pound Sterling (GBP)",
    flagUrl: "https://flagcdn.com/gb.svg",
    description: "The United Kingdom of Great Britain and Northern Ireland, commonly known as the United Kingdom (UK) or Britain, is a sovereign country in north-western Europe, off the north-western coast of the European mainland.",
    landmarks: ["Big Ben", "Tower of London", "Stonehenge", "Buckingham Palace"],
    timeZones: ["UTC+00:00", "British Summer Time: UTC+01:00"],
    drivingSide: "Left",
    callingCode: "+44"
  },
  
  // Japan
  "JP": {
    name: "Japan",
    name_zh: "日本",
    region: "Asia",
    region_zh: "亚洲",
    flagUrl: "https://flagcdn.com/jp.svg",
    cards: {
      "economic_environment": {
        title: "经济环境",
        content: "经济发达，人均GDP为39,290美元。电子和汽车产业强大，消费市场成熟。",
        note: "注：2023年GDP总量为4.23万亿美元，全球第四"
      },
      "payment_habits": {
        title: "付费习惯",
        content: "游戏用户平均年支出为96.7美元，全球最高。手机游戏付费率高。",
        note: "注：移动游戏付费转化率12.4%，全球最高（2023年）"
      },
      "infrastructure": {
        title: "基础设施",
        content: "网络基础设施完善，平均网速为210Mbps，全球领先。5G覆盖广泛。",
        note: "注：互联网渗透率95.8%（2023年）；5G人口覆盖率94.3%（2023年）"
      },
      "demographics": {
        title: "人口特征",
        content: "人口1.26亿，老龄化严重，中位年龄48.6岁，城市化率91.8%。",
        note: "注：65岁以上人口占比28.9%，全球最高；出生率1.3，全球最低之一（2023年）"
      },
      "game_market": {
        title: "游戏市场",
        content: "游戏市场规模约220亿美元，手游占比65%，主机游戏文化深厚。",
        note: "注：2023年市场增长2.1%，预计2025年达235亿美元"
      },
      "game_preferences": {
        title: "游戏偏好",
        content: "偏好RPG、策略类和卡牌收集类游戏，手游休闲游戏流行。",
        note: "注：游戏类型偏好：RPG（26%）、策略（21%）、卡牌/收集（18%）（2023年）"
      },
      "app_usage": {
        title: "应用使用",
        content: "平均每人安装105个应用，每日使用4.5小时，LINE应用使用率极高。",
        note: "注：日均开启应用数23个，社交应用使用率98.6%（2023年）"
      },
      "mobile_payment": {
        title: "移动支付",
        content: "线上支付发达，但线下仍然偏好现金支付，移动支付正迅速增长。",
        note: "注：移动支付普及率约32%，但现金使用率仍高达55%（2023年）"
      },
      "cultural_customs": {
        title: "文化习俗",
        content: "重视品质和细节，对动漫和游戏有深厚文化基础，喜欢收集和完成度。",
        note: "注：游戏玩家平均每款游戏完成度76%，全球最高（2022年游戏分析）"
      }
    },
    // 保留原有数据以兼容旧代码
    officialName: "Japan",
    capital: "Tokyo",
    population: 126476461,
    area: 377975,
    languages: ["Japanese"],
    currency: "Japanese Yen (JPY)",
    description: "Japan is an island country in East Asia located in the northwest Pacific Ocean. It is bordered by the Sea of Japan to the west and extends from the Sea of Okhotsk in the north to the East China Sea and Taiwan in the south.",
    landmarks: ["Mount Fuji", "Tokyo Tower", "Kyoto Imperial Palace", "Hiroshima Peace Memorial"],
    timeZones: ["UTC+09:00"],
    drivingSide: "Left",
    callingCode: "+81"
  },
  
  // India
  "IN": {
    name: "India",
    name_zh: "印度",
    region: "South Asia",
    region_zh: "南亚",
    flagUrl: "https://flagcdn.com/in.svg",
    cards: {
      "economic_environment": {
        title: "经济环境",
        content: "经济水平中等，人均收入约为4,500美元。快速发展中，年轻人口红利明显。",
        note: "注：2023年GDP总量为3.73万亿美元，增长率约7.2%，全球最快"
      },
      "payment_habits": {
        title: "付费习惯",
        content: "游戏用户平均年支出为9.1美元，付费意愿需培养且习惯不成熟。",
        note: "注：移动游戏付费转化率约3.7%，低于全球平均水平（2023年）"
      },
      "infrastructure": {
        title: "基础设施",
        content: "移动网络覆盖为东南亚最低，平均移动网速约为中国的1/4，智能机已普及，安卓占有率较高。",
        note: "注：互联网渗透率69.2%（2023年）；平均网速为41Mbps，智能手机普及率85.3%，安卓机占有率85%（2025年）"
      },
      "demographics": {
        title: "人口特征",
        content: "人口13.8亿，全球第二，年轻人比例高，中位年龄28.7岁，城市化率35.4%。",
        note: "注：25岁以下人口占比约42%，每年新增1000万网民（2023年）"
      },
      "game_market": {
        title: "游戏市场",
        content: "游戏市场规模约32亿美元，手游占比91%，增长潜力巨大。",
        note: "注：2023年游戏用户4.9亿，同比增长15%，预计2025年市场规模达45亿美元"
      },
      "game_preferences": {
        title: "游戏偏好",
        content: "偏好休闲、射击和体育类游戏，板球游戏极受欢迎，本地化内容重要。",
        note: "注：游戏类型偏好：休闲（31%）、射击（24%）、体育（19%）（2023年）"
      },
      "app_usage": {
        title: "应用使用",
        content: "平均每人安装46个应用，每日使用4.8小时，视频和社交应用流行。",
        note: "注：短视频日均使用时长1.8小时，占移动互联网总使用时长的30%（2023年）"
      },
      "mobile_payment": {
        title: "移动支付",
        content: "UPI支付系统发展迅速，移动支付普及率逐年提高，仍有大量现金交易。",
        note: "注：UPI月交易量超过120亿笔，同比增长42%，移动支付普及率约57%（2023年）"
      },
      "cultural_customs": {
        title: "文化习俗",
        content: "文化多样性强，语言众多，内容本地化要求高，区域差异明显。",
        note: "注：印度有22种官方语言，游戏在5-8种主要语言中本地化可覆盖80%用户（2023年）"
      }
    },
    // 保留原有数据以兼容旧代码
    officialName: "Republic of India",
    capital: "New Delhi",
    population: 1380004385,
    area: 3287263,
    languages: ["Hindi", "English", "Tamil", "Bengali", "Marathi", "Telugu", "Gujarati"],
    currency: "Indian Rupee (INR)",
    description: "India is a country in South Asia. It is the seventh-largest country by area, the second-most populous country, and the most populous democracy in the world.",
    landmarks: ["Taj Mahal", "Red Fort", "Gateway of India", "Jama Masjid"],
    timeZones: ["UTC+05:30"],
    drivingSide: "Left",
    callingCode: "+91"
  },
  
  // Germany
  "DE": {
    name: "Germany",
    name_zh: "德国",
    officialName: "Federal Republic of Germany",
    capital: "Berlin",
    region: "Europe",
    region_zh: "欧洲",
    population: 83783942,
    area: 357114,
    languages: ["German"],
    currency: "Euro (EUR)",
    flagUrl: "https://flagcdn.com/de.svg",
    description: "Germany is a country in Central Europe. It is the second-most populous country in Europe after Russia, and the most populous member state of the European Union.",
    landmarks: ["Brandenburg Gate", "Neuschwanstein Castle", "Cologne Cathedral", "Berlin Wall"],
    timeZones: ["UTC+01:00", "Summer: UTC+02:00"],
    drivingSide: "Right",
    callingCode: "+49"
  },
  
  // France
  "FR": {
    name: "France",
    name_zh: "法国",
    officialName: "French Republic",
    capital: "Paris",
    region: "Europe",
    region_zh: "欧洲",
    population: 65273511,
    area: 551695,
    languages: ["French"],
    currency: "Euro (EUR)",
    flagUrl: "https://flagcdn.com/fr.svg",
    description: "France is a country primarily located in Western Europe, consisting of metropolitan France and several overseas regions and territories. The metropolitan area extends from the Rhine to the Atlantic Ocean and from the Mediterranean Sea to the English Channel and the North Sea.",
    landmarks: ["Eiffel Tower", "Louvre Museum", "Palace of Versailles", "Notre-Dame Cathedral"],
    timeZones: ["UTC+01:00", "Summer: UTC+02:00"],
    drivingSide: "Right",
    callingCode: "+33"
  },
  
  // Brazil
  "BR": {
    name: "Brazil",
    name_zh: "巴西",
    officialName: "Federative Republic of Brazil",
    capital: "Brasília",
    region: "South America",
    region_zh: "南美洲",
    population: 212559417,
    area: 8515767,
    languages: ["Portuguese"],
    currency: "Brazilian Real (BRL)",
    flagUrl: "https://flagcdn.com/br.svg",
    description: "Brazil is the largest country in both South America and Latin America. At 8.5 million square kilometers and with over 217 million people, Brazil is the world's fifth-largest country by area and the sixth most populous.",
    landmarks: ["Christ the Redeemer", "Sugarloaf Mountain", "Amazon Rainforest", "Iguazu Falls"],
    timeZones: ["UTC-02:00 to UTC-05:00"],
    drivingSide: "Right",
    callingCode: "+55"
  },
  
  // China
  "CN": {
    name: "China",
    name_zh: "中国",
    region: "Asia",
    region_zh: "亚洲",
    flagUrl: "https://flagcdn.com/cn.svg",
    cards: {
      "economic_environment": {
        title: "经济环境",
        content: "经济体量全球第二，人均GDP为12,720美元。制造业强大，中产阶级快速增长。",
        note: "注：2023年GDP总量为17.8万亿美元，经济增长率5.2%"
      },
      "payment_habits": {
        title: "付费习惯",
        content: "游戏用户平均年支出为65.5美元，移动支付极为普及，小额消费频繁。",
        note: "注：移动支付渗透率96%，年交易额超过400万亿元（2023年）"
      },
      "infrastructure": {
        title: "基础设施",
        content: "移动网络覆盖广泛，5G基站数量全球第一，平均网速达到165Mbps。",
        note: "注：互联网渗透率73.6%（2023年）；5G用户数超过7.5亿，全球最多（2023年）"
      },
      "demographics": {
        title: "人口特征",
        content: "人口14.4亿，老龄化加速，中位年龄38.4岁，城市化率64.7%。",
        note: "注：一线城市年轻人口占比高，Z世代（1995-2009年出生）人口约2.6亿（2023年）"
      },
      "game_market": {
        title: "游戏市场",
        content: "游戏市场规模约460亿美元，手游占比82%，电竞文化发达。",
        note: "注：2023年游戏用户总数达7.2亿，占总人口约51%"
      },
      "game_preferences": {
        title: "游戏偏好",
        content: "偏好MMORPG、MOBA和策略类游戏，社交元素重要，竞技游戏受欢迎。",
        note: "注：游戏类型偏好：MMORPG（25%）、MOBA（22%）、策略（18%）（2023年）"
      },
      "app_usage": {
        title: "应用使用",
        content: "平均每人安装56个应用，每日使用5.7小时，超级应用生态系统发达。",
        note: "注：微信日活跃用户11.7亿，抖音日活跃用户7亿（2023年）"
      },
      "mobile_payment": {
        title: "移动支付",
        content: "支付宝和微信支付主导市场，几乎完全覆盖各类支付场景。",
        note: "注：移动支付普及率约88%，现金使用率下降至12%（2023年）"
      },
      "cultural_customs": {
        title: "文化习俗",
        content: "社交分享和社群互动重要，偏好本土内容，文化认同感强。",
        note: "注：本土游戏市场份额从2016年的68%上升至2023年的80%"
      }
    },
    // 保留原有数据以兼容旧代码
    officialName: "People's Republic of China",
    capital: "Beijing",
    population: 1444216107,
    area: 9706961,
    languages: ["Standard Chinese (Mandarin)", "Cantonese", "Wu", "Minbei", "Minnan"],
    currency: "Renminbi (CNY)",
    description: "China is a country in East Asia. It is the world's most populous country, with a population of more than 1.4 billion. China spans five geographical time zones and borders 14 countries.",
    landmarks: ["Great Wall of China", "Forbidden City", "Terracotta Army", "Shanghai Tower"],
    timeZones: ["UTC+08:00"],
    drivingSide: "Right",
    callingCode: "+86"
  },
  
  // Australia
  "AU": {
    name: "Australia",
    name_zh: "澳大利亚",
    officialName: "Commonwealth of Australia",
    capital: "Canberra",
    region: "Oceania",
    region_zh: "大洋洲",
    population: 25499884,
    area: 7692024,
    languages: ["English"],
    currency: "Australian Dollar (AUD)",
    flagUrl: "https://flagcdn.com/au.svg",
    description: "Australia is a sovereign country comprising the mainland of the Australian continent, the island of Tasmania, and numerous smaller islands. It is the largest country in Oceania and the world's sixth-largest country by total area.",
    landmarks: ["Sydney Opera House", "Great Barrier Reef", "Uluru", "Melbourne Cricket Ground"],
    timeZones: ["UTC+08:00 to UTC+10:00", "Summer: UTC+08:00 to UTC+11:00"],
    drivingSide: "Left",
    callingCode: "+61"
  }
};

// Mock data for Google Play Store top charts by country
const appStoreData = {
  // United States
  "US": {
    country: "United States",
    country_zh: "美国",
    lastUpdated: "2025-07-16",
    freeApps: [
      {
        rank: 1,
        name: "TikTok",
        publisher: "TikTok Pte. Ltd.",
        category: "Social",
        rating: 4.7,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/BmUViDVOKNJe0GYJe22hsr7juFndRVbvr1fGmHGXqHfJjNAXjUj_jIcbmLMYDgAhhb8"
      },
      {
        rank: 2,
        name: "Instagram",
        publisher: "Meta Platforms, Inc.",
        category: "Social",
        rating: 4.5,
        downloads: "5B+",
        icon: "https://play-lh.googleusercontent.com/c2DcVsBUhJb3a-Q-LOdCITs_Op92J-QpQrplm1KZc0LUaKzTrwqljYh1s56qH1vQ8Gg"
      },
      {
        rank: 3,
        name: "YouTube",
        publisher: "Google LLC",
        category: "Video Players",
        rating: 4.4,
        downloads: "10B+",
        icon: "https://play-lh.googleusercontent.com/lMoItBgdPPVDJsNOVtP26EKHePkwBg-PkuY9NOrc-fumRtTFP4XhpUNk_22syN4Datc"
      },
      {
        rank: 4,
        name: "WhatsApp Messenger",
        publisher: "WhatsApp LLC",
        category: "Communication",
        rating: 4.2,
        downloads: "5B+",
        icon: "https://play-lh.googleusercontent.com/bYtqbOcTYOlgc6gqZ2rwb8lptHuwlNE75zYJu6Bn076-hTmvd96HH-6v7S0YUAAJXoJN"
      },
      {
        rank: 5,
        name: "Snapchat",
        publisher: "Snap Inc",
        category: "Social",
        rating: 4.1,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/KxeSAjPTKliCErbivNiXrd6cTwfbqUJcbSRPe_IBVK_YmwckfMRS1VIHz-5cgT09yMo"
      },
      {
        rank: 6,
        name: "Cash App",
        publisher: "Block, Inc.",
        category: "Finance",
        rating: 4.6,
        downloads: "100M+",
        icon: "https://play-lh.googleusercontent.com/2uzD0Wgq2cKhgmqldZJym3qhQ9f4-xiQXLfcYVbMXHV-c8c4FXaQCxocRYV2uplJj5GF"
      },
      {
        rank: 7,
        name: "Spotify",
        publisher: "Spotify AB",
        category: "Music & Audio",
        rating: 4.3,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/cShys-AmJ93dB0SV8kE6Fl5eSaf4-qMMZdwEDKI5pC-urg4QAn4uyI4UKT1BKRklpXZR"
      },
      {
        rank: 8,
        name: "Gmail",
        publisher: "Google LLC",
        category: "Communication",
        rating: 4.4,
        downloads: "5B+",
        icon: "https://play-lh.googleusercontent.com/KSuaRLiI_FlDP8cM4MzJ23ml3og5Hxb9AapaGTMZ2GgR103mvJ3AAnoOFz1yheeQBBI"
      },
      {
        rank: 9,
        name: "Facebook",
        publisher: "Meta Platforms, Inc.",
        category: "Social",
        rating: 4.2,
        downloads: "5B+",
        icon: "https://play-lh.googleusercontent.com/ccWDU4A7fX1R24v-vvT480ySh26AYp97g1VrIB_FIdjRcuQB2JPe5F3-V11Svo-ej1c"
      },
      {
        rank: 10,
        name: "Google Maps",
        publisher: "Google LLC",
        category: "Maps & Navigation",
        rating: 4.3,
        downloads: "5B+",
        icon: "https://play-lh.googleusercontent.com/Kf8WTct65hFJxBUDm5E-EpYsiDoLQiGGbnuyP6HRwXXqJJlxaSPFdGNbQwzJ9AUA7A"
      }
    ]
  },
  
  // United Kingdom
  "GB": {
    country: "United Kingdom",
    country_zh: "英国",
    lastUpdated: "2025-07-16",
    freeApps: [
      {
        rank: 1,
        name: "BBC iPlayer",
        publisher: "BBC Media Applications Technologies Limited",
        category: "Entertainment",
        rating: 4.5,
        downloads: "50M+",
        icon: "https://play-lh.googleusercontent.com/hYdIazwJO63-LfMF2E5DxLR9ZzHLekFQesT6Sbc-h6tQQoYSzITzKFz9ZZN6Yg_5qw"
      },
      {
        rank: 2,
        name: "TikTok",
        publisher: "TikTok Pte. Ltd.",
        category: "Social",
        rating: 4.7,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/BmUViDVOKNJe0GYJe22hsr7juFndRVbvr1fGmHGXqHfJjNAXjUj_jIcbmLMYDgAhhb8"
      },
      {
        rank: 3,
        name: "WhatsApp Messenger",
        publisher: "WhatsApp LLC",
        category: "Communication",
        rating: 4.2,
        downloads: "5B+",
        icon: "https://play-lh.googleusercontent.com/bYtqbOcTYOlgc6gqZ2rwb8lptHuwlNE75zYJu6Bn076-hTmvd96HH-6v7S0YUAAJXoJN"
      },
      {
        rank: 4,
        name: "Instagram",
        publisher: "Meta Platforms, Inc.",
        category: "Social",
        rating: 4.5,
        downloads: "5B+",
        icon: "https://play-lh.googleusercontent.com/c2DcVsBUhJb3a-Q-LOdCITs_Op92J-QpQrplm1KZc0LUaKzTrwqljYh1s56qH1vQ8Gg"
      },
      {
        rank: 5,
        name: "NHS App",
        publisher: "NHS England",
        category: "Medical",
        rating: 4.0,
        downloads: "10M+",
        icon: "https://play-lh.googleusercontent.com/0NxN9lcjM6mMwq8ELu39j7UwpSJ5yMON2BYKMKr0MhmdqJW1mDygQMGdbe2s6YPAEWo"
      },
      {
        rank: 6,
        name: "YouTube",
        publisher: "Google LLC",
        category: "Video Players",
        rating: 4.4,
        downloads: "10B+",
        icon: "https://play-lh.googleusercontent.com/lMoItBgdPPVDJsNOVtP26EKHePkwBg-PkuY9NOrc-fumRtTFP4XhpUNk_22syN4Datc"
      },
      {
        rank: 7,
        name: "Snapchat",
        publisher: "Snap Inc",
        category: "Social",
        rating: 4.1,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/KxeSAjPTKliCErbivNiXrd6cTwfbqUJcbSRPe_IBVK_YmwckfMRS1VIHz-5cgT09yMo"
      },
      {
        rank: 8,
        name: "Just Eat",
        publisher: "Just Eat Holding Limited",
        category: "Food & Drink",
        rating: 4.6,
        downloads: "10M+",
        icon: "https://play-lh.googleusercontent.com/HtOVcFYM85YC1uFqImXcR-4fDXUn9KI95chqh8Ov6gIpbOCuWDHRXYgs1sqQZBJf7FE"
      },
      {
        rank: 9,
        name: "Spotify",
        publisher: "Spotify AB",
        category: "Music & Audio",
        rating: 4.3,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/cShys-AmJ93dB0SV8kE6Fl5eSaf4-qMMZdwEDKI5pC-urg4QAn4uyI4UKT1BKRklpXZR"
      },
      {
        rank: 10,
        name: "McDonald's",
        publisher: "McDonald's",
        category: "Food & Drink",
        rating: 4.5,
        downloads: "50M+",
        icon: "https://play-lh.googleusercontent.com/yMM0k7dWnDsZvDGS4AwjZT5PFGRYs-5H_vjbj9J95ISdvCuJABPgFRveFqpI68DTYOg"
      }
    ]
  },
  
  // Japan
  "JP": {
    country: "Japan",
    country_zh: "日本",
    lastUpdated: "2025-07-16",
    freeApps: [
      {
        rank: 1,
        name: "LINE",
        publisher: "LINE Corporation",
        category: "Communication",
        rating: 4.4,
        downloads: "500M+",
        icon: "https://play-lh.googleusercontent.com/hSyebBlYwtE2aMjzSIHasUO9cQv9HgNAw9owy6ADO0szPFiQbWuhQLfslp-Sv6F_QsA"
      },
      {
        rank: 2,
        name: "PayPay",
        publisher: "PayPay Corporation",
        category: "Finance",
        rating: 4.3,
        downloads: "50M+",
        icon: "https://play-lh.googleusercontent.com/vXgWKYDEbPthCzk_Wt-GtXbHLQZdVKx6Tsz_45Y1gVtJKcbxY4qP1cAL2w-1ELnIuJI"
      },
      {
        rank: 3,
        name: "Yahoo! JAPAN",
        publisher: "Yahoo Japan Corp.",
        category: "News & Magazines",
        rating: 4.2,
        downloads: "100M+",
        icon: "https://play-lh.googleusercontent.com/qPnNcHrXEGJtJryX0qFko6ShdOTDUFiHgOb7DO6JYKzWBw3vkdKyIEy9mCgCN9K2uF8"
      },
      {
        rank: 4,
        name: "Twitter",
        publisher: "X Corp.",
        category: "News & Magazines",
        rating: 4.1,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/wIf3HtczQDjHzHuu7vezhqNs0zXAG85F7VmP7nhsTxO3OHegrVXlqIh_DWBYi86FTIGk"
      },
      {
        rank: 5,
        name: "YouTube",
        publisher: "Google LLC",
        category: "Video Players",
        rating: 4.4,
        downloads: "10B+",
        icon: "https://play-lh.googleusercontent.com/lMoItBgdPPVDJsNOVtP26EKHePkwBg-PkuY9NOrc-fumRtTFP4XhpUNk_22syN4Datc"
      },
      {
        rank: 6,
        name: "Instagram",
        publisher: "Meta Platforms, Inc.",
        category: "Social",
        rating: 4.5,
        downloads: "5B+",
        icon: "https://play-lh.googleusercontent.com/c2DcVsBUhJb3a-Q-LOdCITs_Op92J-QpQrplm1KZc0LUaKzTrwqljYh1s56qH1vQ8Gg"
      },
      {
        rank: 7,
        name: "Amazon",
        publisher: "Amazon Mobile LLC",
        category: "Shopping",
        rating: 4.4,
        downloads: "500M+",
        icon: "https://play-lh.googleusercontent.com/QPKtPRTJyhrYoPqYmjP81aCnIr9pJ1D7HYg7FaFoBz2xH98Xvj9l0u4PqRXbBzrbenw"
      },
      {
        rank: 8,
        name: "TikTok",
        publisher: "TikTok Pte. Ltd.",
        category: "Social",
        rating: 4.7,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/BmUViDVOKNJe0GYJe22hsr7juFndRVbvr1fGmHGXqHfJjNAXjUj_jIcbmLMYDgAhhb8"
      },
      {
        rank: 9,
        name: "Google Maps",
        publisher: "Google LLC",
        category: "Maps & Navigation",
        rating: 4.3,
        downloads: "5B+",
        icon: "https://play-lh.googleusercontent.com/Kf8WTct65hFJxBUDm5E-EpYsiDoLQiGGbnuyP6HRwXXqJJlxaSPFdGNbQwzJ9AUA7A"
      },
      {
        rank: 10,
        name: "Netflix",
        publisher: "Netflix, Inc.",
        category: "Entertainment",
        rating: 4.4,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/TBRwjS_qfJCSj1m7zZB93FnpJM5fSpMA_wUlFDLxWAb45T9RmwBvQd5cWR5viJJOhkI"
      }
    ]
  },

  // India
  "IN": {
    country: "India",
    country_zh: "印度",
    lastUpdated: "2025-07-16",
    freeApps: [
      {
        rank: 1,
        name: "JioCinema",
        publisher: "Viacom18 Digital",
        category: "Entertainment",
        rating: 4.1,
        downloads: "100M+",
        icon: "https://play-lh.googleusercontent.com/Y4RhxoLirASuYE0WvitQg6JJzVhLOim-GZEQiCIr3oRJI37udu4hgWCRDyR9_gPJmw"
      },
      {
        rank: 2,
        name: "PhonePe",
        publisher: "PhonePe Private Limited",
        category: "Finance",
        rating: 4.6,
        downloads: "500M+",
        icon: "https://play-lh.googleusercontent.com/6iyA2zVz5PyyMjK5SIxdUhrb7oh9cYVXgS8fYDR5V0sJfXwwU1xwUhgbqWVSwlgCobI"
      },
      {
        rank: 3,
        name: "Instagram",
        publisher: "Meta Platforms, Inc.",
        category: "Social",
        rating: 4.5,
        downloads: "5B+",
        icon: "https://play-lh.googleusercontent.com/c2DcVsBUhJb3a-Q-LOdCITs_Op92J-QpQrplm1KZc0LUaKzTrwqljYh1s56qH1vQ8Gg"
      },
      {
        rank: 4,
        name: "Meesho",
        publisher: "Meesho",
        category: "Shopping",
        rating: 4.3,
        downloads: "100M+",
        icon: "https://play-lh.googleusercontent.com/QgFU5eFSVfn1aBbUXdZi_7C5RA9SUOBcmH00cs1xid9IKaL5H-3AHNVOvhvLGGKoX3M"
      },
      {
        rank: 5,
        name: "Snapchat",
        publisher: "Snap Inc",
        category: "Social",
        rating: 4.1,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/KxeSAjPTKliCErbivNiXrd6cTwfbqUJcbSRPe_IBVK_YmwckfMRS1VIHz-5cgT09yMo"
      },
      {
        rank: 6,
        name: "WhatsApp Messenger",
        publisher: "WhatsApp LLC",
        category: "Communication",
        rating: 4.2,
        downloads: "5B+",
        icon: "https://play-lh.googleusercontent.com/bYtqbOcTYOlgc6gqZ2rwb8lptHuwlNE75zYJu6Bn076-hTmvd96HH-6v7S0YUAAJXoJN"
      },
      {
        rank: 7,
        name: "Spotify",
        publisher: "Spotify AB",
        category: "Music & Audio",
        rating: 4.3,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/cShys-AmJ93dB0SV8kE6Fl5eSaf4-qMMZdwEDKI5pC-urg4QAn4uyI4UKT1BKRklpXZR"
      },
      {
        rank: 8,
        name: "Paytm",
        publisher: "One97 Communications Limited",
        category: "Finance",
        rating: 4.4,
        downloads: "100M+",
        icon: "https://play-lh.googleusercontent.com/5i7tEzW_J_cubdR4IWjt9RvOHQj54ux2B-JjgmtJ6EyAlbPVJOjpqamTjeglGBYVEi4"
      },
      {
        rank: 9,
        name: "Flipkart",
        publisher: "Flipkart Internet Private Limited",
        category: "Shopping",
        rating: 4.3,
        downloads: "500M+",
        icon: "https://play-lh.googleusercontent.com/RPKMWXtZHhHWAHJkKTVQVm4i2IuEiK_-2SO9jlQdtzSYTj3uTNlwHcpcCFdDsuUC0t4"
      },
      {
        rank: 10,
        name: "Hotstar",
        publisher: "Disney",
        category: "Entertainment",
        rating: 4.2,
        downloads: "500M+",
        icon: "https://play-lh.googleusercontent.com/sv-MDTbfckZGk04W51-CzUEgF8t57ig0_xkwYAcUx0KUsZcVjmUgRx_nQRxluGWKPw"
      }
    ]
  },

  // Germany
  "DE": {
    country: "Germany",
    country_zh: "德国",
    lastUpdated: "2025-07-16",
    freeApps: [
      {
        rank: 1,
        name: "WhatsApp Messenger",
        publisher: "WhatsApp LLC",
        category: "Communication",
        rating: 4.2,
        downloads: "5B+",
        icon: "https://play-lh.googleusercontent.com/bYtqbOcTYOlgc6gqZ2rwb8lptHuwlNE75zYJu6Bn076-hTmvd96HH-6v7S0YUAAJXoJN"
      },
      {
        rank: 2,
        name: "Telegram",
        publisher: "Telegram FZ-LLC",
        category: "Communication",
        rating: 4.5,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/ZU9cSsyIJZo6Oy7HTHiEPwZg0m2Crep-d5ZrfajqtsH-qgUXSqKpNA2FpPDTn-7qA5Q"
      },
      {
        rank: 3,
        name: "TikTok",
        publisher: "TikTok Pte. Ltd.",
        category: "Social",
        rating: 4.7,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/BmUViDVOKNJe0GYJe22hsr7juFndRVbvr1fGmHGXqHfJjNAXjUj_jIcbmLMYDgAhhb8"
      },
      {
        rank: 4,
        name: "Instagram",
        publisher: "Meta Platforms, Inc.",
        category: "Social",
        rating: 4.5,
        downloads: "5B+",
        icon: "https://play-lh.googleusercontent.com/c2DcVsBUhJb3a-Q-LOdCITs_Op92J-QpQrplm1KZc0LUaKzTrwqljYh1s56qH1vQ8Gg"
      },
      {
        rank: 5,
        name: "DB Navigator",
        publisher: "Deutsche Bahn AG",
        category: "Travel & Local",
        rating: 4.1,
        downloads: "10M+",
        icon: "https://play-lh.googleusercontent.com/v_rK8QKcfqRr7TQL2YQM6fN-z9Rg6Q_YqfuMJhP_Wns6BSl8TQfp8lBw9dCQn9OIOA"
      },
      {
        rank: 6,
        name: "Spotify",
        publisher: "Spotify AB",
        category: "Music & Audio",
        rating: 4.3,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/cShys-AmJ93dB0SV8kE6Fl5eSaf4-qMMZdwEDKI5pC-urg4QAn4uyI4UKT1BKRklpXZR"
      },
      {
        rank: 7,
        name: "NINA",
        publisher: "Bundesamt für Bevölkerungsschutz und Katastrophenhilfe",
        category: "News & Magazines",
        rating: 4.3,
        downloads: "5M+",
        icon: "https://play-lh.googleusercontent.com/aYn4Xo_1m3YvWe9GlI1-KOAfVlB8b_QKzKyPJ2QY7LoJ9XCe3xnQK4ztlrVlBfGmK6k"
      },
      {
        rank: 8,
        name: "YouTube",
        publisher: "Google LLC",
        category: "Video Players",
        rating: 4.4,
        downloads: "10B+",
        icon: "https://play-lh.googleusercontent.com/lMoItBgdPPVDJsNOVtP26EKHePkwBg-PkuY9NOrc-fumRtTFP4XhpUNk_22syN4Datc"
      },
      {
        rank: 9,
        name: "PayPal",
        publisher: "PayPal Mobile",
        category: "Finance",
        rating: 4.4,
        downloads: "500M+",
        icon: "https://play-lh.googleusercontent.com/W2v6zkf5X2P_5z0_uy_XzJ0FkN5cYf8y8d7G9aUlI0LBb6q3G7o0L6cEw9XgZ1Og"
      },
      {
        rank: 10,
        name: "DeutschlandCard",
        publisher: "DeutschlandCard GmbH",
        category: "Shopping",
        rating: 4.2,
        downloads: "5M+",
        icon: "https://play-lh.googleusercontent.com/jvF6-z2YCk0w6x5B8M5y4YyF0D3y0K7TzBz5_0yY8NkzY_Bz0w0JzBz5x0A0_xJzBy"
      }
    ]
  },

  // France
  "FR": {
    country: "France",
    country_zh: "法国",
    lastUpdated: "2025-07-16",
    freeApps: [
      {
        rank: 1,
        name: "TikTok",
        publisher: "TikTok Pte. Ltd.",
        category: "Social",
        rating: 4.7,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/BmUViDVOKNJe0GYJe22hsr7juFndRVbvr1fGmHGXqHfJjNAXjUj_jIcbmLMYDgAhhb8"
      },
      {
        rank: 2,
        name: "Instagram",
        publisher: "Meta Platforms, Inc.",
        category: "Social",
        rating: 4.5,
        downloads: "5B+",
        icon: "https://play-lh.googleusercontent.com/c2DcVsBUhJb3a-Q-LOdCITs_Op92J-QpQrplm1KZc0LUaKzTrwqljYh1s56qH1vQ8Gg"
      },
      {
        rank: 3,
        name: "Snapchat",
        publisher: "Snap Inc",
        category: "Social",
        rating: 4.1,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/KxeSAjPTKliCErbivNiXrd6cTwfbqUJcbSRPe_IBVK_YmwckfMRS1VIHz-5cgT09yMo"
      },
      {
        rank: 4,
        name: "WhatsApp Messenger",
        publisher: "WhatsApp LLC",
        category: "Communication",
        rating: 4.2,
        downloads: "5B+",
        icon: "https://play-lh.googleusercontent.com/bYtqbOcTYOlgc6gqZ2rwb8lptHuwlNE75zYJu6Bn076-hTmvd96HH-6v7S0YUAAJXoJN"
      },
      {
        rank: 5,
        name: "Leboncoin",
        publisher: "leboncoin",
        category: "Shopping",
        rating: 4.3,
        downloads: "10M+",
        icon: "https://play-lh.googleusercontent.com/Gyz8yY0f4vG6nZ8d7s4JX1y2A4w3v8x9K7nJ4q3V8y5K7wG6y2_4vx8K1qJy4G8w"
      },
      {
        rank: 6,
        name: "Citymapper",
        publisher: "Citymapper Limited",
        category: "Maps & Navigation",
        rating: 4.5,
        downloads: "10M+",
        icon: "https://play-lh.googleusercontent.com/b7Sz6T8f9R8yJ9w4V5y7K0z1q2A3x4w2y5K7vG8z9K4V2y3A8w7z5J4K7y8w9Gf"
      },
      {
        rank: 7,
        name: "Deezer",
        publisher: "Deezer Music",
        category: "Music & Audio",
        rating: 4.4,
        downloads: "100M+",
        icon: "https://play-lh.googleusercontent.com/yD8v7f4K8y9G2w5V7J3z1A4q2x8w9K5y7z2V4J8G9y3w2A1x5z7K4V8y9G2w5J"
      },
      {
        rank: 8,
        name: "Vinted",
        publisher: "Vinted",
        category: "Shopping",
        rating: 4.6,
        downloads: "100M+",
        icon: "https://play-lh.googleusercontent.com/K7w8z4V2y9G5J3x1A7z8w2V4y5K7G9z1x3A2w8V7y4K5z9G1A3x7y2w8V4z5K9"
      },
      {
        rank: 9,
        name: "YouTube",
        publisher: "Google LLC",
        category: "Video Players",
        rating: 4.4,
        downloads: "10B+",
        icon: "https://play-lh.googleusercontent.com/lMoItBgdPPVDJsNOVtP26EKHePkwBg-PkuY9NOrc-fumRtTFP4XhpUNk_22syN4Datc"
      },
      {
        rank: 10,
        name: "Ameli",
        publisher: "Assurance Maladie",
        category: "Medical",
        rating: 4.1,
        downloads: "5M+",
        icon: "https://play-lh.googleusercontent.com/A2w7z5V8y4K9G3x1A7w2z8V5y4K7G9z3x1A2w7V8y5K4z9G1A7x3y2w8V5z4K9G"
      }
    ]
  },

  // Brazil
  "BR": {
    country: "Brazil",
    country_zh: "巴西",
    lastUpdated: "2025-07-16",
    freeApps: [
      {
        rank: 1,
        name: "WhatsApp Messenger",
        publisher: "WhatsApp LLC",
        category: "Communication",
        rating: 4.2,
        downloads: "5B+",
        icon: "https://play-lh.googleusercontent.com/bYtqbOcTYOlgc6gqZ2rwb8lptHuwlNE75zYJu6Bn076-hTmvd96HH-6v7S0YUAAJXoJN"
      },
      {
        rank: 2,
        name: "Instagram",
        publisher: "Meta Platforms, Inc.",
        category: "Social",
        rating: 4.5,
        downloads: "5B+",
        icon: "https://play-lh.googleusercontent.com/c2DcVsBUhJb3a-Q-LOdCITs_Op92J-QpQrplm1KZc0LUaKzTrwqljYh1s56qH1vQ8Gg"
      },
      {
        rank: 3,
        name: "TikTok",
        publisher: "TikTok Pte. Ltd.",
        category: "Social",
        rating: 4.7,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/BmUViDVOKNJe0GYJe22hsr7juFndRVbvr1fGmHGXqHfJjNAXjUj_jIcbmLMYDgAhhb8"
      },
      {
        rank: 4,
        name: "Nubank",
        publisher: "Nu Pagamentos S.A.",
        category: "Finance",
        rating: 4.8,
        downloads: "50M+",
        icon: "https://play-lh.googleusercontent.com/X9w2V5y8K7z4G3A1x7w9V2y5K8z7G4A3x1w2V8y7K5z9G4A7x3w1V2y8K7z5G9"
      },
      {
        rank: 5,
        name: "Kwai",
        publisher: "Kuaishou",
        category: "Social",
        rating: 4.3,
        downloads: "500M+",
        icon: "https://play-lh.googleusercontent.com/Y5z8w7V4K9G2A3x1w7z5V8y4K9G2A7x3w1V5z8y7K4G9A2x7w3V1z5y8K7G4A9"
      },
      {
        rank: 6,
        name: "iFood",
        publisher: "iFood.com Agência de Restaurantes Online S.A.",
        category: "Food & Drink",
        rating: 4.4,
        downloads: "100M+",
        icon: "https://play-lh.googleusercontent.com/Z4w9V2y7K5G8A3x1w4z9V7y2K5G8A7x3w1V4z9y2K8G5A4x7w3V1z4y9K2G8A5"
      },
      {
        rank: 7,
        name: "PicPay",
        publisher: "PicPay",
        category: "Finance",
        rating: 4.5,
        downloads: "50M+",
        icon: "https://play-lh.googleusercontent.com/A7w2z9V5y4K8G3x1A2w7z5V9y4K8G7x3A1w2V5z9y8K4G2A7x3w1V9z5y4K8G7"
      },
      {
        rank: 8,
        name: "Shopee",
        publisher: "Shopee",
        category: "Shopping",
        rating: 4.6,
        downloads: "500M+",
        icon: "https://play-lh.googleusercontent.com/B8w3z7V9y2K5G4A1x8w3z7V2y9K5G8A4x1w3V7z2y5K9G4A8x7w1V3z9y2K5G8"
      },
      {
        rank: 9,
        name: "YouTube",
        publisher: "Google LLC",
        category: "Video Players",
        rating: 4.4,
        downloads: "10B+",
        icon: "https://play-lh.googleusercontent.com/lMoItBgdPPVDJsNOVtP26EKHePkwBg-PkuY9NOrc-fumRtTFP4XhpUNk_22syN4Datc"
      },
      {
        rank: 10,
        name: "Uber",
        publisher: "Uber Technologies, Inc.",
        category: "Maps & Navigation",
        rating: 4.2,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/CfW1w9V8y2K7G5A4x1w9C2V8y7K5G9A4x7w1V2C8y5K7G4A9x3w7V1C2y8K5G9"
      }
    ]
  },

  // China
  "CN": {
    country: "China",
    country_zh: "中国",
    lastUpdated: "2025-07-16",
    freeApps: [
      {
        rank: 1,
        name: "WeChat",
        publisher: "Tencent Technology (Shenzhen) Company Ltd.",
        category: "Communication",
        rating: 4.6,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/D2w8V5y7K9G3A4x1D8w2V7y5K9G3A8x4D1w8V2y7K5G9A3x8D7w1V5y2K9G3A4"
      },
      {
        rank: 2,
        name: "Alipay",
        publisher: "Ant Group",
        category: "Finance",
        rating: 4.7,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/E9w7V3y8K2G5A4x1E7w9V8y3K2G5A9x4E1w7V3y8K5G2A4x7E9w1V8y3K5G2A9"
      },
      {
        rank: 3,
        name: "Douyin",
        publisher: "Beijing Microlive Vision Technology Co., Ltd",
        category: "Social",
        rating: 4.8,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/F2w8V7y3K9G4A5x1F8w2V3y7K9G4A2x5F1w8V7y3K4G9A8x2F7w1V3y8K9G4A5"
      },
      {
        rank: 4,
        name: "Taobao",
        publisher: "Taobao",
        category: "Shopping",
        rating: 4.5,
        downloads: "500M+",
        icon: "https://play-lh.googleusercontent.com/G8w3V2y7K5G9A4x1G3w8V7y2K5G9A3x4G1w3V2y7K9G5A8x3G7w1V2y8K5G9A4"
      },
      {
        rank: 5,
        name: "QQ",
        publisher: "Tencent Technology (Shenzhen) Company Ltd.",
        category: "Communication",
        rating: 4.4,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/H7w2V8y3K9G5A4x1H2w7V3y8K9G5A7x4H1w2V8y3K5G9A2x8H7w1V3y2K9G5A4"
      },
      {
        rank: 6,
        name: "Baidu Map",
        publisher: "Beijing Baidu Netcom Science Technology Co.,Ltd",
        category: "Maps & Navigation",
        rating: 4.3,
        downloads: "500M+",
        icon: "https://play-lh.googleusercontent.com/I3w7V2y8K5G9A4x1I7w3V8y2K5G9A7x4I1w7V2y8K9G5A3x7I2w1V8y3K5G9A4"
      },
      {
        rank: 7,
        name: "Meituan",
        publisher: "Beijing Sankuai Online Technology Co., Ltd.",
        category: "Food & Drink",
        rating: 4.6,
        downloads: "500M+",
        icon: "https://play-lh.googleusercontent.com/J8w2V7y3K9G4A5x1J2w8V3y7K9G4A2x5J1w2V7y3K4G9A8x2J7w1V3y2K9G4A5"
      },
      {
        rank: 8,
        name: "Kuaishou",
        publisher: "Beijing Kuaishou Technology Co., Ltd.",
        category: "Social",
        rating: 4.4,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/K7w3V8y2K5G9A4x1K3w7V2y8K5G9A3x4K1w3V8y2K9G5A7x3K8w1V2y7K5G9A4"
      },
      {
        rank: 9,
        name: "DingTalk",
        publisher: "Alibaba (China) Technology Co., Ltd.",
        category: "Business",
        rating: 4.2,
        downloads: "500M+",
        icon: "https://play-lh.googleusercontent.com/L2w8V3y7K9G5A4x1L8w2V7y3K9G5A8x4L1w8V3y7K5G9A2x8L3w1V7y2K9G5A4"
      },
      {
        rank: 10,
        name: "Xiaohongshu",
        publisher: "Xingin",
        category: "Social",
        rating: 4.5,
        downloads: "100M+",
        icon: "https://play-lh.googleusercontent.com/M7w2V8y3K5G9A4x1M2w7V3y8K5G9A7x4M1w2V8y3K9G5A2x8M7w1V3y8K5G9A4"
      }
    ]
  },

  // Australia
  "AU": {
    country: "Australia",
    country_zh: "澳大利亚",
    lastUpdated: "2025-07-16",
    freeApps: [
      {
        rank: 1,
        name: "TikTok",
        publisher: "TikTok Pte. Ltd.",
        category: "Social",
        rating: 4.7,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/BmUViDVOKNJe0GYJe22hsr7juFndRVbvr1fGmHGXqHfJjNAXjUj_jIcbmLMYDgAhhb8"
      },
      {
        rank: 2,
        name: "Instagram",
        publisher: "Meta Platforms, Inc.",
        category: "Social",
        rating: 4.5,
        downloads: "5B+",
        icon: "https://play-lh.googleusercontent.com/c2DcVsBUhJb3a-Q-LOdCITs_Op92J-QpQrplm1KZc0LUaKzTrwqljYh1s56qH1vQ8Gg"
      },
      {
        rank: 3,
        name: "Snapchat",
        publisher: "Snap Inc",
        category: "Social",
        rating: 4.1,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/KxeSAjPTKliCErbivNiXrd6cTwfbqUJcbSRPe_IBVK_YmwckfMRS1VIHz-5cgT09yMo"
      },
      {
        rank: 4,
        name: "WhatsApp Messenger",
        publisher: "WhatsApp LLC",
        category: "Communication",
        rating: 4.2,
        downloads: "5B+",
        icon: "https://play-lh.googleusercontent.com/bYtqbOcTYOlgc6gqZ2rwb8lptHuwlNE75zYJu6Bn076-hTmvd96HH-6v7S0YUAAJXoJN"
      },
      {
        rank: 5,
        name: "CommBank",
        publisher: "Commonwealth Bank of Australia",
        category: "Finance",
        rating: 4.7,
        downloads: "10M+",
        icon: "https://play-lh.googleusercontent.com/N8w3V7y2K9G5A4x1N3w8V2y7K9G5A3x4N1w3V7y2K5G9A8x3N7w1V2y8K9G5A4"
      },
      {
        rank: 6,
        name: "Gumtree",
        publisher: "Gumtree.com.au",
        category: "Shopping",
        rating: 4.3,
        downloads: "10M+",
        icon: "https://play-lh.googleusercontent.com/O7w2V8y3K5G9A4x1O2w7V3y8K5G9A7x4O1w2V8y3K9G5A2x8O7w1V3y2K5G9A4"
      },
      {
        rank: 7,
        name: "YouTube",
        publisher: "Google LLC",
        category: "Video Players",
        rating: 4.4,
        downloads: "10B+",
        icon: "https://play-lh.googleusercontent.com/lMoItBgdPPVDJsNOVtP26EKHePkwBg-PkuY9NOrc-fumRtTFP4XhpUNk_22syN4Datc"
      },
      {
        rank: 8,
        name: "Uber",
        publisher: "Uber Technologies, Inc.",
        category: "Maps & Navigation",
        rating: 4.2,
        downloads: "1B+",
        icon: "https://play-lh.googleusercontent.com/CfW1w9V8y2K7G5A4x1w9C2V8y7K5G9A4x7w1V2C8y5K7G4A9x3w7V1C2y8K5G9"
      },
      {
        rank: 9,
        name: "myGov",
        publisher: "Department of Human Services",
        category: "Productivity",
        rating: 4.1,
        downloads: "5M+",
        icon: "https://play-lh.googleusercontent.com/P2w8V3y7K9G5A4x1P8w2V7y3K9G5A8x4P1w8V3y7K5G9A2x8P3w1V7y2K9G5A4"
      },
      {
        rank: 10,
        name: "Kayo Sports",
        publisher: "Streamotion Pty Ltd",
        category: "Sports",
        rating: 4.0,
        downloads: "1M+",
        icon: "https://play-lh.googleusercontent.com/Q7w2V8y3K5G9A4x1Q2w7V3y8K5G9A7x4Q1w2V8y3K9G5A2x8Q7w1V3y8K5G9A4"
      }
    ]
  }
};

// 完整的世界国家列表（用于管理面板）
const allWorldCountries = [
  // 亚洲国家
  { code: "CN", name: "China", name_zh: "中国" },
  { code: "JP", name: "Japan", name_zh: "日本" },
  { code: "IN", name: "India", name_zh: "印度" },
  { code: "KR", name: "South Korea", name_zh: "韩国" },
  { code: "TH", name: "Thailand", name_zh: "泰国" },
  { code: "VN", name: "Vietnam", name_zh: "越南" },
  { code: "ID", name: "Indonesia", name_zh: "印度尼西亚" },
  { code: "PH", name: "Philippines", name_zh: "菲律宾" },
  { code: "MY", name: "Malaysia", name_zh: "马来西亚" },
  { code: "SG", name: "Singapore", name_zh: "新加坡" },
  { code: "KH", name: "Cambodia", name_zh: "柬埔寨" },
  { code: "LA", name: "Laos", name_zh: "老挝" },
  { code: "MM", name: "Myanmar", name_zh: "缅甸" },
  { code: "BN", name: "Brunei", name_zh: "文莱" },
  { code: "TL", name: "East Timor", name_zh: "东帝汶" },
  { code: "PK", name: "Pakistan", name_zh: "巴基斯坦" },
  { code: "BD", name: "Bangladesh", name_zh: "孟加拉国" },
  { code: "LK", name: "Sri Lanka", name_zh: "斯里兰卡" },
  { code: "NP", name: "Nepal", name_zh: "尼泊尔" },
  { code: "BT", name: "Bhutan", name_zh: "不丹" },
  { code: "MV", name: "Maldives", name_zh: "马尔代夫" },
  { code: "AF", name: "Afghanistan", name_zh: "阿富汗" },
  { code: "IR", name: "Iran", name_zh: "伊朗" },
  { code: "IQ", name: "Iraq", name_zh: "伊拉克" },
  { code: "SA", name: "Saudi Arabia", name_zh: "沙特阿拉伯" },
  { code: "AE", name: "United Arab Emirates", name_zh: "阿联酋" },
  { code: "KW", name: "Kuwait", name_zh: "科威特" },
  { code: "QA", name: "Qatar", name_zh: "卡塔尔" },
  { code: "BH", name: "Bahrain", name_zh: "巴林" },
  { code: "OM", name: "Oman", name_zh: "阿曼" },
  { code: "YE", name: "Yemen", name_zh: "也门" },
  { code: "JO", name: "Jordan", name_zh: "约旦" },
  { code: "LB", name: "Lebanon", name_zh: "黎巴嫩" },
  { code: "SY", name: "Syria", name_zh: "叙利亚" },
  { code: "IL", name: "Israel", name_zh: "以色列" },
  { code: "TR", name: "Turkey", name_zh: "土耳其" },
  { code: "CY", name: "Cyprus", name_zh: "塞浦路斯" },
  { code: "GE", name: "Georgia", name_zh: "格鲁吉亚" },
  { code: "AM", name: "Armenia", name_zh: "亚美尼亚" },
  { code: "AZ", name: "Azerbaijan", name_zh: "阿塞拜疆" },
  { code: "KZ", name: "Kazakhstan", name_zh: "哈萨克斯坦" },
  { code: "UZ", name: "Uzbekistan", name_zh: "乌兹别克斯坦" },
  { code: "KG", name: "Kyrgyzstan", name_zh: "吉尔吉斯斯坦" },
  { code: "TJ", name: "Tajikistan", name_zh: "塔吉克斯坦" },
  { code: "TM", name: "Turkmenistan", name_zh: "土库曼斯坦" },
  { code: "MN", name: "Mongolia", name_zh: "蒙古" },
  { code: "KP", name: "North Korea", name_zh: "朝鲜" },
  { code: "TW", name: "Taiwan", name_zh: "台湾" },
  { code: "HK", name: "Hong Kong", name_zh: "香港" },
  { code: "MO", name: "Macau", name_zh: "澳门" },

  // 欧洲国家
  { code: "GB", name: "United Kingdom", name_zh: "英国" },
  { code: "DE", name: "Germany", name_zh: "德国" },
  { code: "FR", name: "France", name_zh: "法国" },
  { code: "IT", name: "Italy", name_zh: "意大利" },
  { code: "ES", name: "Spain", name_zh: "西班牙" },
  { code: "PT", name: "Portugal", name_zh: "葡萄牙" },
  { code: "NL", name: "Netherlands", name_zh: "荷兰" },
  { code: "BE", name: "Belgium", name_zh: "比利时" },
  { code: "CH", name: "Switzerland", name_zh: "瑞士" },
  { code: "AT", name: "Austria", name_zh: "奥地利" },
  { code: "SE", name: "Sweden", name_zh: "瑞典" },
  { code: "NO", name: "Norway", name_zh: "挪威" },
  { code: "DK", name: "Denmark", name_zh: "丹麦" },
  { code: "FI", name: "Finland", name_zh: "芬兰" },
  { code: "IS", name: "Iceland", name_zh: "冰岛" },
  { code: "IE", name: "Ireland", name_zh: "爱尔兰" },
  { code: "LU", name: "Luxembourg", name_zh: "卢森堡" },
  { code: "MC", name: "Monaco", name_zh: "摩纳哥" },
  { code: "AD", name: "Andorra", name_zh: "安道尔" },
  { code: "LI", name: "Liechtenstein", name_zh: "列支敦士登" },
  { code: "SM", name: "San Marino", name_zh: "圣马力诺" },
  { code: "VA", name: "Vatican City", name_zh: "梵蒂冈" },
  { code: "MT", name: "Malta", name_zh: "马耳他" },
  { code: "GR", name: "Greece", name_zh: "希腊" },
  { code: "PL", name: "Poland", name_zh: "波兰" },
  { code: "CZ", name: "Czech Republic", name_zh: "捷克" },
  { code: "SK", name: "Slovakia", name_zh: "斯洛伐克" },
  { code: "HU", name: "Hungary", name_zh: "匈牙利" },
  { code: "SI", name: "Slovenia", name_zh: "斯洛文尼亚" },
  { code: "HR", name: "Croatia", name_zh: "克罗地亚" },
  { code: "BA", name: "Bosnia and Herzegovina", name_zh: "波黑" },
  { code: "RS", name: "Serbia", name_zh: "塞尔维亚" },
  { code: "ME", name: "Montenegro", name_zh: "黑山" },
  { code: "MK", name: "North Macedonia", name_zh: "北马其顿" },
  { code: "AL", name: "Albania", name_zh: "阿尔巴尼亚" },
  { code: "XK", name: "Kosovo", name_zh: "科索沃" },
  { code: "BG", name: "Bulgaria", name_zh: "保加利亚" },
  { code: "RO", name: "Romania", name_zh: "罗马尼亚" },
  { code: "MD", name: "Moldova", name_zh: "摩尔多瓦" },
  { code: "UA", name: "Ukraine", name_zh: "乌克兰" },
  { code: "BY", name: "Belarus", name_zh: "白俄罗斯" },
  { code: "LT", name: "Lithuania", name_zh: "立陶宛" },
  { code: "LV", name: "Latvia", name_zh: "拉脱维亚" },
  { code: "EE", name: "Estonia", name_zh: "爱沙尼亚" },
  { code: "RU", name: "Russia", name_zh: "俄罗斯" },

  // 北美洲国家
  { code: "US", name: "United States", name_zh: "美国" },
  { code: "CA", name: "Canada", name_zh: "加拿大" },
  { code: "MX", name: "Mexico", name_zh: "墨西哥" },
  { code: "GT", name: "Guatemala", name_zh: "危地马拉" },
  { code: "BZ", name: "Belize", name_zh: "伯利兹" },
  { code: "SV", name: "El Salvador", name_zh: "萨尔瓦多" },
  { code: "HN", name: "Honduras", name_zh: "洪都拉斯" },
  { code: "NI", name: "Nicaragua", name_zh: "尼加拉瓜" },
  { code: "CR", name: "Costa Rica", name_zh: "哥斯达黎加" },
  { code: "PA", name: "Panama", name_zh: "巴拿马" },
  { code: "CU", name: "Cuba", name_zh: "古巴" },
  { code: "JM", name: "Jamaica", name_zh: "牙买加" },
  { code: "HT", name: "Haiti", name_zh: "海地" },
  { code: "DO", name: "Dominican Republic", name_zh: "多米尼加" },
  { code: "TT", name: "Trinidad and Tobago", name_zh: "特立尼达和多巴哥" },
  { code: "BB", name: "Barbados", name_zh: "巴巴多斯" },
  { code: "GD", name: "Grenada", name_zh: "格林纳达" },
  { code: "LC", name: "Saint Lucia", name_zh: "圣卢西亚" },
  { code: "VC", name: "Saint Vincent and the Grenadines", name_zh: "圣文森特和格林纳丁斯" },
  { code: "AG", name: "Antigua and Barbuda", name_zh: "安提瓜和巴布达" },
  { code: "DM", name: "Dominica", name_zh: "多米尼克" },
  { code: "KN", name: "Saint Kitts and Nevis", name_zh: "圣基茨和尼维斯" },
  { code: "BS", name: "Bahamas", name_zh: "巴哈马" },

  // 南美洲国家
  { code: "BR", name: "Brazil", name_zh: "巴西" },
  { code: "AR", name: "Argentina", name_zh: "阿根廷" },
  { code: "CL", name: "Chile", name_zh: "智利" },
  { code: "PE", name: "Peru", name_zh: "秘鲁" },
  { code: "CO", name: "Colombia", name_zh: "哥伦比亚" },
  { code: "VE", name: "Venezuela", name_zh: "委内瑞拉" },
  { code: "EC", name: "Ecuador", name_zh: "厄瓜多尔" },
  { code: "BO", name: "Bolivia", name_zh: "玻利维亚" },
  { code: "PY", name: "Paraguay", name_zh: "巴拉圭" },
  { code: "UY", name: "Uruguay", name_zh: "乌拉圭" },
  { code: "GY", name: "Guyana", name_zh: "圭亚那" },
  { code: "SR", name: "Suriname", name_zh: "苏里南" },
  { code: "GF", name: "French Guiana", name_zh: "法属圭亚那" },

  // 非洲国家
  { code: "EG", name: "Egypt", name_zh: "埃及" },
  { code: "LY", name: "Libya", name_zh: "利比亚" },
  { code: "DZ", name: "Algeria", name_zh: "阿尔及利亚" },
  { code: "TN", name: "Tunisia", name_zh: "突尼斯" },
  { code: "MA", name: "Morocco", name_zh: "摩洛哥" },
  { code: "SD", name: "Sudan", name_zh: "苏丹" },
  { code: "SS", name: "South Sudan", name_zh: "南苏丹" },
  { code: "ET", name: "Ethiopia", name_zh: "埃塞俄比亚" },
  { code: "ER", name: "Eritrea", name_zh: "厄立特里亚" },
  { code: "DJ", name: "Djibouti", name_zh: "吉布提" },
  { code: "SO", name: "Somalia", name_zh: "索马里" },
  { code: "KE", name: "Kenya", name_zh: "肯尼亚" },
  { code: "UG", name: "Uganda", name_zh: "乌干达" },
  { code: "TZ", name: "Tanzania", name_zh: "坦桑尼亚" },
  { code: "RW", name: "Rwanda", name_zh: "卢旺达" },
  { code: "BI", name: "Burundi", name_zh: "布隆迪" },
  { code: "CD", name: "Democratic Republic of the Congo", name_zh: "刚果民主共和国" },
  { code: "CG", name: "Republic of the Congo", name_zh: "刚果共和国" },
  { code: "CF", name: "Central African Republic", name_zh: "中非共和国" },
  { code: "TD", name: "Chad", name_zh: "乍得" },
  { code: "CM", name: "Cameroon", name_zh: "喀麦隆" },
  { code: "GQ", name: "Equatorial Guinea", name_zh: "赤道几内亚" },
  { code: "GA", name: "Gabon", name_zh: "加蓬" },
  { code: "ST", name: "Sao Tome and Principe", name_zh: "圣多美和普林西比" },
  { code: "AO", name: "Angola", name_zh: "安哥拉" },
  { code: "ZM", name: "Zambia", name_zh: "赞比亚" },
  { code: "ZW", name: "Zimbabwe", name_zh: "津巴布韦" },
  { code: "BW", name: "Botswana", name_zh: "博茨瓦纳" },
  { code: "NA", name: "Namibia", name_zh: "纳米比亚" },
  { code: "ZA", name: "South Africa", name_zh: "南非" },
  { code: "LS", name: "Lesotho", name_zh: "莱索托" },
  { code: "SZ", name: "Eswatini", name_zh: "斯威士兰" },
  { code: "MZ", name: "Mozambique", name_zh: "莫桑比克" },
  { code: "MW", name: "Malawi", name_zh: "马拉维" },
  { code: "MG", name: "Madagascar", name_zh: "马达加斯加" },
  { code: "MU", name: "Mauritius", name_zh: "毛里求斯" },
  { code: "SC", name: "Seychelles", name_zh: "塞舌尔" },
  { code: "KM", name: "Comoros", name_zh: "科摩罗" },
  { code: "ML", name: "Mali", name_zh: "马里" },
  { code: "BF", name: "Burkina Faso", name_zh: "布基纳法索" },
  { code: "NE", name: "Niger", name_zh: "尼日尔" },
  { code: "NG", name: "Nigeria", name_zh: "尼日利亚" },
  { code: "CI", name: "Ivory Coast", name_zh: "象牙海岸" },
  { code: "GH", name: "Ghana", name_zh: "加纳" },
  { code: "TG", name: "Togo", name_zh: "多哥" },
  { code: "BJ", name: "Benin", name_zh: "贝宁" },
  { code: "SN", name: "Senegal", name_zh: "塞内加尔" },
  { code: "GM", name: "Gambia", name_zh: "冈比亚" },
  { code: "GW", name: "Guinea-Bissau", name_zh: "几内亚比绍" },
  { code: "GN", name: "Guinea", name_zh: "几内亚" },
  { code: "SL", name: "Sierra Leone", name_zh: "塞拉利昂" },
  { code: "LR", name: "Liberia", name_zh: "利比里亚" },
  { code: "CV", name: "Cape Verde", name_zh: "佛得角" },
  { code: "MR", name: "Mauritania", name_zh: "毛里塔尼亚" },

  // 大洋洲国家
  { code: "AU", name: "Australia", name_zh: "澳大利亚" },
  { code: "NZ", name: "New Zealand", name_zh: "新西兰" },
  { code: "PG", name: "Papua New Guinea", name_zh: "巴布亚新几内亚" },
  { code: "FJ", name: "Fiji", name_zh: "斐济" },
  { code: "VU", name: "Vanuatu", name_zh: "瓦努阿图" },
  { code: "SB", name: "Solomon Islands", name_zh: "所罗门群岛" },
  { code: "NC", name: "New Caledonia", name_zh: "新喀里多尼亚" },
  { code: "TO", name: "Tonga", name_zh: "汤加" },
  { code: "WS", name: "Samoa", name_zh: "萨摩亚" },
  { code: "KI", name: "Kiribati", name_zh: "基里巴斯" },
  { code: "TV", name: "Tuvalu", name_zh: "图瓦卢" },
  { code: "NR", name: "Nauru", name_zh: "瑙鲁" },
  { code: "PW", name: "Palau", name_zh: "帕劳" },
  { code: "FM", name: "Micronesia", name_zh: "密克罗尼西亚" },
  { code: "MH", name: "Marshall Islands", name_zh: "马绍尔群岛" }
];

// List of all countries available in the data (保持向后兼容性)
const availableCountries = Object.keys(appStoreData).map(code => {
  return {
    code: code,
    name: appStoreData[code].country,
    name_zh: appStoreData[code].country_zh
  };
});

// 检查国家代码是否在countryData中有记录
function hasCountryInfo(countryCode) {
  return countryCode in countryData;
}

// 根据国家代码获取地区信息
function getRegionForCountry(countryCode) {
  const regionMapping = {
    // 亚洲
    "CN": "Asia", "JP": "Asia", "IN": "Asia", "KR": "Asia", "TH": "Asia", "VN": "Asia", 
    "ID": "Asia", "PH": "Asia", "MY": "Asia", "SG": "Asia", "KH": "Asia", "LA": "Asia", 
    "MM": "Asia", "BN": "Asia", "TL": "Asia", "PK": "Asia", "BD": "Asia", "LK": "Asia", 
    "NP": "Asia", "BT": "Asia", "MV": "Asia", "AF": "Asia", "IR": "Asia", "IQ": "Asia", 
    "SA": "Asia", "AE": "Asia", "KW": "Asia", "QA": "Asia", "BH": "Asia", "OM": "Asia", 
    "YE": "Asia", "JO": "Asia", "LB": "Asia", "SY": "Asia", "IL": "Asia", "TR": "Asia", 
    "CY": "Asia", "GE": "Asia", "AM": "Asia", "AZ": "Asia", "KZ": "Asia", "UZ": "Asia", 
    "KG": "Asia", "TJ": "Asia", "TM": "Asia", "MN": "Asia", "KP": "Asia", "TW": "Asia", 
    "HK": "Asia", "MO": "Asia",
    
    // 欧洲
    "GB": "Europe", "DE": "Europe", "FR": "Europe", "IT": "Europe", "ES": "Europe", 
    "PT": "Europe", "NL": "Europe", "BE": "Europe", "CH": "Europe", "AT": "Europe", 
    "SE": "Europe", "NO": "Europe", "DK": "Europe", "FI": "Europe", "IS": "Europe", 
    "IE": "Europe", "LU": "Europe", "MC": "Europe", "AD": "Europe", "LI": "Europe", 
    "SM": "Europe", "VA": "Europe", "MT": "Europe", "GR": "Europe", "PL": "Europe", 
    "CZ": "Europe", "SK": "Europe", "HU": "Europe", "SI": "Europe", "HR": "Europe", 
    "BA": "Europe", "RS": "Europe", "ME": "Europe", "MK": "Europe", "AL": "Europe", 
    "XK": "Europe", "BG": "Europe", "RO": "Europe", "MD": "Europe", "UA": "Europe", 
    "BY": "Europe", "LT": "Europe", "LV": "Europe", "EE": "Europe", "RU": "Europe",
    
    // 北美洲
    "US": "North America", "CA": "North America", "MX": "North America", 
    "GT": "North America", "BZ": "North America", "SV": "North America", 
    "HN": "North America", "NI": "North America", "CR": "North America", 
    "PA": "North America", "CU": "North America", "JM": "North America", 
    "HT": "North America", "DO": "North America", "TT": "North America", 
    "BB": "North America", "GD": "North America", "LC": "North America", 
    "VC": "North America", "AG": "North America", "DM": "North America", 
    "KN": "North America", "BS": "North America",
    
    // 南美洲
    "BR": "South America", "AR": "South America", "CL": "South America", 
    "PE": "South America", "CO": "South America", "VE": "South America", 
    "EC": "South America", "BO": "South America", "PY": "South America", 
    "UY": "South America", "GY": "South America", "SR": "South America", 
    "GF": "South America",
    
    // 非洲
    "EG": "Africa", "LY": "Africa", "DZ": "Africa", "TN": "Africa", "MA": "Africa", 
    "SD": "Africa", "SS": "Africa", "ET": "Africa", "ER": "Africa", "DJ": "Africa", 
    "SO": "Africa", "KE": "Africa", "UG": "Africa", "TZ": "Africa", "RW": "Africa", 
    "BI": "Africa", "CD": "Africa", "CG": "Africa", "CF": "Africa", "TD": "Africa", 
    "CM": "Africa", "GQ": "Africa", "GA": "Africa", "ST": "Africa", "AO": "Africa", 
    "ZM": "Africa", "ZW": "Africa", "BW": "Africa", "NA": "Africa", "ZA": "Africa", 
    "LS": "Africa", "SZ": "Africa", "MZ": "Africa", "MW": "Africa", "MG": "Africa", 
    "MU": "Africa", "SC": "Africa", "KM": "Africa", "ML": "Africa", "BF": "Africa", 
    "NE": "Africa", "NG": "Africa", "CI": "Africa", "GH": "Africa", "TG": "Africa", 
    "BJ": "Africa", "SN": "Africa", "GM": "Africa", "GW": "Africa", "GN": "Africa", 
    "SL": "Africa", "LR": "Africa", "CV": "Africa", "MR": "Africa",
    
    // 大洋洲
    "AU": "Oceania", "NZ": "Oceania", "PG": "Oceania", "FJ": "Oceania", 
    "VU": "Oceania", "SB": "Oceania", "NC": "Oceania", "TO": "Oceania", 
    "WS": "Oceania", "KI": "Oceania", "TV": "Oceania", "NR": "Oceania", 
    "PW": "Oceania", "FM": "Oceania", "MH": "Oceania"
  };
  
  return regionMapping[countryCode] || "Asia";
}

// 获取中文地区名称
function getChineseRegionName(englishRegion) {
  return regionTranslations[englishRegion] || englishRegion;
}

// 将所有世界国家的基本信息添加到countryData中
function initializeCountryData() {
  console.log("正在初始化所有国家数据...");
  // 遍历allWorldCountries列表
  allWorldCountries.forEach(country => {
    const countryCode = country.code;
    
    // 如果countryData中已经有这个国家的记录，则跳过
    if (countryCode in countryData) {
      return;
    }
    
    // 获取该国家所属的地区（英文和中文）
    const region = getRegionForCountry(countryCode);
    const region_zh = getChineseRegionName(region);
    
    // 创建该国家的基本信息
    countryData[countryCode] = {
      name: country.name,
      name_zh: country.name_zh,
      region: region,
      region_zh: region_zh,
      officialName: country.name,
      capital: "信息待更新",
      population: 0,
      area: 0,
      languages: ["信息待更新"],
      currency: "信息待更新",
      flagUrl: `https://flagcdn.com/${countryCode.toLowerCase()}.svg`,
      description: `${country.name_zh || country.name}的详细信息正在更新中，敬请期待。`,
      landmarks: ["信息待更新"],
      timeZones: ["信息待更新"],
      drivingSide: "信息待更新",
      callingCode: "信息待更新",
      cards: {}, // 空的卡片数据
      detailAnalysisUrl: "" // 详细分析链接
    };
  });
  
  console.log("国家数据初始化完成，共有", Object.keys(countryData).length, "个国家");
}

// 执行国家数据初始化
initializeCountryData();

// Function to get country information for a specific country
function getCountryInfo(countryCode, countryName) {
  // 直接返回countryData中的记录，所有国家都应该已经在数据库中了
  if (countryCode && countryCode in countryData) {
    return countryData[countryCode];
  }
  
  // 如果找不到国家代码，则尝试通过国家名称查找
  if (countryName) {
    const country = allWorldCountries.find(c => c.name === countryName);
    if (country && country.code in countryData) {
      return countryData[country.code];
    }
  }
  
  // 如果仍然找不到，返回一个默认对象
  return {
    name: countryName || "未知国家",
    name_zh: getChineseCountryName(countryName || "未知国家"),
    region: "未知地区",
    region_zh: "未知地区",
    description: "该国家信息暂未收录。"
  };
}

// Function to get app data for a specific country (kept for backward compatibility)
function getCountryData(countryCode) {
  // Return data if available, otherwise return US data as default
  return appStoreData[countryCode] || appStoreData["US"];
}

// 获取中文国家名称的函数
function getChineseCountryName(englishName) {
  // 使用map.js中的countryMapping来获取中文名称
  const chineseNames = {
    // 从英文到中文的映射
    "United States of America": "美国",
    "United States": "美国",
    "United Kingdom": "英国",
    "Germany": "德国",
    "France": "法国",
    "Japan": "日本",
    "China": "中国",
    "India": "印度",
    "Brazil": "巴西",
    "Russia": "俄罗斯",
    "Australia": "澳大利亚",
    "Canada": "加拿大",
    "Spain": "西班牙",
    "Italy": "意大利",
    "South Korea": "韩国",
    "Mexico": "墨西哥",
    "Argentina": "阿根廷",
    "Chile": "智利",
    "Colombia": "哥伦比亚",
    "Peru": "秘鲁",
    "Venezuela": "委内瑞拉",
    "Netherlands": "荷兰",
    "Belgium": "比利时",
    "Switzerland": "瑞士",
    "Austria": "奥地利",
    "Sweden": "瑞典",
    "Norway": "挪威",
    "Denmark": "丹麦",
    "Finland": "芬兰",
    "Poland": "波兰",
    "Czech Republic": "捷克",
    "Hungary": "匈牙利",
    "Romania": "罗马尼亚",
    "Ukraine": "乌克兰",
    "Turkey": "土耳其",
    "Egypt": "埃及",
    "South Africa": "南非",
    "Nigeria": "尼日利亚",
    "Kenya": "肯尼亚",
    "Morocco": "摩洛哥",
    "Algeria": "阿尔及利亚",
    "Tunisia": "突尼斯",
    "Saudi Arabia": "沙特阿拉伯",
    "United Arab Emirates": "阿联酋",
    "Israel": "以色列",
    "Iran": "伊朗",
    "Iraq": "伊拉克",
    "Afghanistan": "阿富汗",
    "Pakistan": "巴基斯坦",
    "Bangladesh": "孟加拉国",
    "Sri Lanka": "斯里兰卡",
    "Myanmar": "缅甸",
    "Thailand": "泰国",
    "Vietnam": "越南",
    "Cambodia": "柬埔寨",
    "Laos": "老挝",
    "Malaysia": "马来西亚",
    "Singapore": "新加坡",
    "Indonesia": "印度尼西亚",
    "Philippines": "菲律宾",
    "Taiwan": "台湾",
    "Hong Kong": "香港",
    "Mongolia": "蒙古",
    "Kazakhstan": "哈萨克斯坦",
    "Uzbekistan": "乌兹别克斯坦",
    "New Zealand": "新西兰",
    "Portugal": "葡萄牙",
    "Greece": "希腊",
    "Ireland": "爱尔兰",
    "Iceland": "冰岛",
    "Luxembourg": "卢森堡",
    "Monaco": "摩纳哥",
    "Andorra": "安道尔",
    "Liechtenstein": "列支敦士登",
    "San Marino": "圣马力诺",
    "Vatican City": "梵蒂冈",
    "Malta": "马耳他",
    "Cyprus": "塞浦路斯",
    "Bulgaria": "保加利亚",
    "Croatia": "克罗地亚",
    "Serbia": "塞尔维亚",
    "Bosnia and Herzegovina": "波黑",
    "Montenegro": "黑山",
    "North Macedonia": "北马其顿",
    "Albania": "阿尔巴尼亚",
    "Kosovo": "科索沃",
    "Moldova": "摩尔多瓦",
    "Belarus": "白俄罗斯",
    "Lithuania": "立陶宛",
    "Latvia": "拉脱维亚",
    "Estonia": "爱沙尼亚",
    "Slovakia": "斯洛伐克",
    "Slovenia": "斯洛文尼亚",
    "Georgia": "格鲁吉亚",
    "Armenia": "亚美尼亚",
    "Azerbaijan": "阿塞拜疆",
    "Kyrgyzstan": "吉尔吉斯斯坦",
    "Tajikistan": "塔吉克斯坦",
    "Turkmenistan": "土库曼斯坦",
    "North Korea": "朝鲜",
    "Nepal": "尼泊尔",
    "Bhutan": "不丹",
    "Maldives": "马尔代夫",
    "Brunei": "文莱",
    "East Timor": "东帝汶",
    "Papua New Guinea": "巴布亚新几内亚",
    "Fiji": "斐济",
    "Vanuatu": "瓦努阿图",
    "Solomon Islands": "所罗门群岛",
    "Tonga": "汤加",
    "Samoa": "萨摩亚",
    "Kiribati": "基里巴斯",
    "Tuvalu": "图瓦卢",
    "Nauru": "瑙鲁",
    "Palau": "帕劳",
    "Micronesia": "密克罗尼西亚",
    "Marshall Islands": "马绍尔群岛",
    "Libya": "利比亚",
    "Sudan": "苏丹",
    "South Sudan": "南苏丹",
    "Ethiopia": "埃塞俄比亚",
    "Eritrea": "厄立特里亚",
    "Djibouti": "吉布提",
    "Somalia": "索马里",
    "Uganda": "乌干达",
    "Tanzania": "坦桑尼亚",
    "Rwanda": "卢旺达",
    "Burundi": "布隆迪",
    "Democratic Republic of the Congo": "刚果民主共和国",
    "Republic of the Congo": "刚果共和国",
    "Central African Republic": "中非共和国",
    "Chad": "乍得",
    "Cameroon": "喀麦隆",
    "Equatorial Guinea": "赤道几内亚",
    "Gabon": "加蓬",
    "Sao Tome and Principe": "圣多美和普林西比",
    "Angola": "安哥拉",
    "Zambia": "赞比亚",
    "Zimbabwe": "津巴布韦",
    "Botswana": "博茨瓦纳",
    "Namibia": "纳米比亚",
    "Lesotho": "莱索托",
    "Eswatini": "斯威士兰",
    "Madagascar": "马达加斯加",
    "Mauritius": "毛里求斯",
    "Seychelles": "塞舌尔",
    "Comoros": "科摩罗",
    "Mali": "马里",
    "Burkina Faso": "布基纳法索",
    "Niger": "尼日尔",
    "Ivory Coast": "象牙海岸",
    "Côte d'Ivoire": "科特迪瓦",
    "Ghana": "加纳",
    "Togo": "多哥",
    "Benin": "贝宁",
    "Senegal": "塞内加尔",
    "Gambia": "冈比亚",
    "Guinea-Bissau": "几内亚比绍",
    "Guinea": "几内亚",
    "Sierra Leone": "塞拉利昂",
    "Liberia": "利比里亚",
    "Cape Verde": "佛得角",
    "Mauritania": "毛里塔尼亚",
    "Western Sahara": "西撒哈拉",
    "Jordan": "约旦",
    "Lebanon": "黎巴嫩",
    "Syria": "叙利亚",
    "Yemen": "也门",
    "Oman": "阿曼",
    "Qatar": "卡塔尔",
    "Bahrain": "巴林",
    "Kuwait": "科威特"
  };
  
  return chineseNames[englishName] || englishName;
}

// Function to update country detail panel with country information cards
function updateCountryDetail(countryName, countryCode) {
  // Get country information with actual country name
  const data = getCountryInfo(countryCode, countryName);
  
  // 获取中文国家名称和区域名称
  const chineseCountryName = getChineseCountryName(countryName);
  const chineseRegionName = regionTranslations[data.region] || data.region;
  
  // Update country name and region in panel with Chinese names
  document.getElementById("country-name").textContent = chineseCountryName;
  document.getElementById("country-region").textContent = chineseRegionName;
  
  // Get the cards container
  const cardsContainer = document.getElementById("country-cards");
  cardsContainer.innerHTML = "";
  
  // 兼容数组和对象
  let cardsArr = [];
  if (Array.isArray(data.cards)) {
    cardsArr = data.cards;
  } else if (data.cards && typeof data.cards === 'object') {
    cardsArr = Object.values(data.cards);
  }
  if (cardsArr.length > 0) {
    cardsArr.forEach(cardData => {
      const cardElement = createCardElement(cardData.id || '', cardData);
      cardsContainer.appendChild(cardElement);
    });
  } else {
    const noDataCard = document.createElement("div");
    noDataCard.className = "country-card";
    noDataCard.innerHTML = `<h3>数据待更新</h3><p>该国家的详细卡片信息正在整理中，敬请期待。</p>`;
    cardsContainer.appendChild(noDataCard);
  }
  
  // Add "查看详细分析" button if URL is available
  addDetailAnalysisButton(cardsContainer, data, countryCode);
  
  // Show country detail panel
  document.getElementById("country-detail").classList.remove("hidden");
}

// Helper function to create a country info card element
function createCardElement(cardId, cardData) {
  const cardElement = document.createElement("div");
  cardElement.className = "country-card";
  cardElement.dataset.cardId = cardId;
  
  // Create card content
  cardElement.innerHTML = `
    <h3>${cardData.title}</h3>
    <p>${cardData.content}</p>
    ${cardData.note ? `<div class="card-note">${cardData.note}</div>` : ''}
  `;
  
  return cardElement;
}

// Helper function to add detail analysis button
function addDetailAnalysisButton(container, countryData, countryCode) {
  // Create button container
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "detail-analysis-container";
  buttonContainer.style.marginTop = "20px";
  buttonContainer.style.textAlign = "center";
  
  // Create the button
  const analysisButton = document.createElement("button");
  analysisButton.className = "detail-analysis-btn";
  analysisButton.textContent = "查看详细分析";
  analysisButton.style.padding = "10px 20px";
  analysisButton.style.backgroundColor = "#4CAF50";
  analysisButton.style.color = "white";
  analysisButton.style.border = "none";
  analysisButton.style.borderRadius = "5px";
  analysisButton.style.cursor = "pointer";
  analysisButton.style.fontSize = "14px";
  analysisButton.style.fontWeight = "bold";
  
  // Add hover effect
  analysisButton.addEventListener("mouseenter", function() {
    this.style.backgroundColor = "#45a049";
  });
  
  analysisButton.addEventListener("mouseleave", function() {
    this.style.backgroundColor = "#4CAF50";
  });
  
  // Add click event
  analysisButton.addEventListener("click", function() {
    const url = countryData.detailAnalysisUrl;
    if (url && url.trim() !== "") {
      // Open the URL in a new tab
      window.open(url, "_blank");
    } else {
      // Show message if no URL is set
      alert("该国家暂未设置详细分析链接，请在管理面板中进行配置。");
    }
  });
  
  // Check if URL is available and style accordingly
  if (!countryData.detailAnalysisUrl || countryData.detailAnalysisUrl.trim() === "") {
    analysisButton.style.backgroundColor = "#cccccc";
    analysisButton.style.cursor = "not-allowed";
    analysisButton.title = "请在管理面板中设置分析链接";
  }
  
  buttonContainer.appendChild(analysisButton);
  container.appendChild(buttonContainer);
}

// Helper function to add detail analysis URL editor in admin panel
function addDetailAnalysisEditor(container, countryCode, countryData) {
  // Create URL editor container
  const urlEditorContainer = document.createElement("div");
  urlEditorContainer.className = "url-editor-container";
  urlEditorContainer.style.marginBottom = "20px";
  urlEditorContainer.style.padding = "15px";
  urlEditorContainer.style.border = "1px solid #ddd";
  urlEditorContainer.style.borderRadius = "5px";
  urlEditorContainer.style.backgroundColor = "#f9f9f9";
  
  // Create title
  const title = document.createElement("h4");
  title.textContent = "详细分析链接设置";
  title.style.marginTop = "0";
  title.style.marginBottom = "10px";
  title.style.color = "#333";
  
  // Create URL input
  const urlInput = document.createElement("input");
  urlInput.type = "url";
  urlInput.id = `detail-url-${countryCode}`;
  urlInput.placeholder = "请输入详细分析页面的完整URL（如：https://example.com/analysis）";
  urlInput.value = countryData.detailAnalysisUrl || "";
  urlInput.style.width = "100%";
  urlInput.style.padding = "8px";
  urlInput.style.border = "1px solid #ccc";
  urlInput.style.borderRadius = "3px";
  urlInput.style.fontSize = "14px";
  
  // Create description
  const description = document.createElement("p");
  description.textContent = "设置后，用户点击国家详情页的\"查看详细分析\"按钮将跳转到此链接";
  description.style.fontSize = "12px";
  description.style.color = "#666";
  description.style.margin = "5px 0 0 0";
  
  // Assemble the editor
  urlEditorContainer.appendChild(title);
  urlEditorContainer.appendChild(urlInput);
  urlEditorContainer.appendChild(description);
  
  // Add to container
  container.appendChild(urlEditorContainer);
}

// Initialize admin panel
function initAdminPanel() {
  // Get admin country select element
  const adminCountrySelect = document.getElementById("admin-country-select");
  
  // Populate country select options with Chinese names - 使用完整的世界国家列表
  allWorldCountries.forEach(country => {
    const option = document.createElement("option");
    option.value = country.code;
    option.textContent = country.name_zh || country.name;
    adminCountrySelect.appendChild(option);
  });
  
  // Add event listener to country select
  adminCountrySelect.addEventListener("change", function() {
    if (this.value) {
      populateCardEditor(this.value);
    } else {
      // Clear card editor
      document.getElementById("card-editor-list").innerHTML = "";
    }
  });
  
  // Add event listeners for admin panel toggle
  document.getElementById("admin-toggle").addEventListener("click", function() {
    document.getElementById("admin-panel").classList.remove("hidden");
  });
  
  document.getElementById("close-admin").addEventListener("click", function() {
    document.getElementById("admin-panel").classList.add("hidden");
  });
  
  // Add event listener for country detail close button
  document.getElementById("close-detail").addEventListener("click", function() {
    document.getElementById("country-detail").classList.add("hidden");
    
    // Reset selected country
    if (selectedCountry) {
      d3.select(selectedCountry).classed("selected", false);
      selectedCountry = null;
    }
    
    // 清空卡片容器，防止数据残留
    document.getElementById("country-cards").innerHTML = "";
  });
  
  // Add event listener for add card button
  document.getElementById("add-card").addEventListener("click", function() {
    const countryCode = document.getElementById("admin-country-select").value;
    if (!countryCode) {
      alert("请先选择一个国家");
      return;
    }
    addNewCard(countryCode);
  });
  
  // Add event listener for save data button
  document.getElementById("save-data").addEventListener("click", saveCardData);
  document.getElementById("create-template").addEventListener("click", function() {
    createTemplateCards();
  });
}

// Populate card editor with data for a specific country
function populateCardEditor(countryCode) {
  // 确保countryData中有这个国家的记录，如果没有则创建
  if (!countryData[countryCode]) {
    // 从世界国家列表中找到这个国家的信息
    const countryInfo = allWorldCountries.find(country => country.code === countryCode);
    if (countryInfo) {
      // 创建新的国家数据记录
      countryData[countryCode] = {
        name: countryInfo.name,
        name_zh: countryInfo.name_zh,
        region: getRegionForCountry(countryCode),
        region_zh: getChineseRegionName(getRegionForCountry(countryCode)),
        flagUrl: `https://flagcdn.com/${countryCode.toLowerCase()}.svg`,
        cards: [], // 空的卡片数据，等待用户编辑
        detailAnalysisUrl: ""
      };
    }
  }
  // Get country data
  const data = getCountryInfo(countryCode);
  // Get card editor list element
  const cardEditorList = document.getElementById("card-editor-list");
  // Clear previous content
  cardEditorList.innerHTML = "";
  // Add detail analysis URL editor
  addDetailAnalysisEditor(cardEditorList, countryCode, data);
  // 只用数组顺序渲染卡片
  if (Array.isArray(data.cards) && data.cards.length > 0) {
    data.cards.forEach(card => {
      addCardEditorItem(cardEditorList, card.id, card);
    });
  } else {
    const noCardsMessage = document.createElement("p");
    noCardsMessage.textContent = "该国家暂无卡片数据，请点击\"添加卡片\"按钮创建";
    noCardsMessage.style.marginTop = "20px";
    cardEditorList.appendChild(noCardsMessage);
  }
}

// Add a new card editor item to the editor list
function addCardEditorItem(container, cardId, cardData = null) {
  const isNewCard = !cardData;
  // Create default card data if not provided
  cardData = cardData || {
    title: "",
    content: "",
    note: ""
  };
  
  // Create a unique ID if this is a new card
  if (isNewCard) {
    cardId = `card_${Date.now()}`;
  }
  
  // Create card editor item
  const cardEditForm = document.createElement("div");
  cardEditForm.className = "card-editor-item";
  cardEditForm.dataset.cardId = cardId;
  
  // Create card editor form
  cardEditForm.innerHTML = `
    <div class="card-field">
      <label for="${cardId}_title">卡片标题：</label>
      <input type="text" id="${cardId}_title" name="title" value="${cardData.title}" placeholder="例如：经济环境">
    </div>
    <div class="card-field">
      <label for="${cardId}_content">卡片内容：</label>
      <textarea id="${cardId}_content" name="content" placeholder="卡片主要内容">${cardData.content}</textarea>
    </div>
    <div class="card-field">
      <label for="${cardId}_note">注释信息：</label>
      <input type="text" id="${cardId}_note" name="note" value="${cardData.note}" placeholder="例如：注：2023年统计数据">
    </div>
    <div class="card-actions">
      <button class="move-up-btn" data-card-id="${cardId}">上移</button>
      <button class="move-down-btn" data-card-id="${cardId}">下移</button>
      <button class="delete-btn" data-card-id="${cardId}">删除</button>
    </div>
  `;
  
  // Add to container
  container.appendChild(cardEditForm);
  
  // Add event listeners for card actions
  cardEditForm.querySelector(".delete-btn").addEventListener("click", function() {
    if (confirm("确定要删除这张卡片吗？")) {
      cardEditForm.remove();
    }
  });
  
  cardEditForm.querySelector(".move-up-btn").addEventListener("click", function() {
    const prev = cardEditForm.previousElementSibling;
    if (prev) {
      container.insertBefore(cardEditForm, prev);
    }
  });
  
  cardEditForm.querySelector(".move-down-btn").addEventListener("click", function() {
    const next = cardEditForm.nextElementSibling;
    if (next) {
      container.insertBefore(next, cardEditForm);
    }
  });
  
  return cardEditForm;
}

// Add a new card
function addNewCard(countryCode) {
  const cardEditorList = document.getElementById("card-editor-list");
  
  // Clear "no cards" message if it exists
  if (cardEditorList.querySelector("p")) {
    cardEditorList.innerHTML = "";
  }
  
  // Add new card editor item
  addCardEditorItem(cardEditorList);
}

// Save card data
async function saveCardData() {
  // Get selected country
  const countryCode = document.getElementById("admin-country-select").value;
  if (!countryCode) {
    alert("请先选择一个国家");
    return;
  }
  // 确保countryData中有这个国家的记录
  if (!countryData[countryCode]) {
    const countryInfo = allWorldCountries.find(country => country.code === countryCode);
    if (countryInfo) {
      countryData[countryCode] = {
        name: countryInfo.name,
        name_zh: countryInfo.name_zh,
        region: getRegionForCountry(countryCode),
        region_zh: getChineseRegionName(getRegionForCountry(countryCode)),
        flagUrl: `https://flagcdn.com/${countryCode.toLowerCase()}.svg`,
        cards: [],
        detailAnalysisUrl: ""
      };
    }
  }
  // Save detail analysis URL
  const urlInput = document.getElementById(`detail-url-${countryCode}`);
  if (urlInput) {
    countryData[countryCode].detailAnalysisUrl = urlInput.value.trim();
  }
  // Get card editor forms
  const cardForms = document.querySelectorAll(".card-editor-item");
  // 保存为数组，顺序与DOM一致
  countryData[countryCode].cards = [];
  cardForms.forEach((form) => {
    const cardId = form.dataset.cardId;
    const title = form.querySelector("[name='title']").value.trim();
    const content = form.querySelector("[name='content']").value.trim();
    const note = form.querySelector("[name='note']").value.trim();
    if (title || content) {
      countryData[countryCode].cards.push({
        id: cardId,
        title,
        content,
        note
      });
    }
  });
  // Update UI if the country detail panel is showing this country
  const countryDetailName = document.getElementById("country-name").textContent;
  const chineseCountryName = getChineseCountryName(countryData[countryCode].name);
  if (countryDetailName === chineseCountryName) {
    updateCountryDetail(countryData[countryCode].name, countryCode);
  }
  alert("卡片数据保存成功");
  await saveCountryDataToSupabase(countryCode);
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initAdminPanel);

// 拉取所有国家卡片数据（supabase）
async function loadCountryDataFromSupabase() {
  const { data, error } = await supabase
    .from('country_cards')
    .select('*');
  if (error) {
    console.error('拉取国家数据失败', error);
    return;
  }
  data.forEach(row => {
    if (!countryData[row.country_code]) countryData[row.country_code] = {};
    countryData[row.country_code].cards = row.cards || [];
    countryData[row.country_code].detailAnalysisUrl = row.detailAnalysisUrl;
  });
}

// 保存单个国家卡片数据到supabase
async function saveCountryDataToSupabase(country_code) {
  const cards = countryData[country_code].cards;
  const detailAnalysisUrl = countryData[country_code].detailAnalysisUrl || '';
  const payload = {
    country_code,
    cards,
    detailAnalysisUrl
  };
  const { error } = await supabase
    .from('country_cards')
    .upsert([payload], { onConflict: 'country_code' });
  if (error) {
    alert('上传到数据库失败: ' + error.message);
  }
}

// 挂载到 window，确保 map.js 能访问
window.updateCountryDetail = updateCountryDetail;

// 页面加载时自动从 supabase 拉取云端数据
// 保证云端数据覆盖本地 countryData

document.addEventListener("DOMContentLoaded", async () => {
  await loadCountryDataFromSupabase();
});

// 模板卡片顺序和标题
const CARD_TEMPLATE_ORDER = [
  { key: 'economic_environment', title: '经济环境' },
  { key: 'payment_habits', title: '付费习惯' },
  { key: 'infrastructure', title: '基础设施' },
  { key: 'demographics', title: '人口特征' },
  { key: 'game_market', title: '游戏市场' },
  { key: 'game_preferences', title: '游戏偏好' },
  { key: 'app_usage', title: '应用使用' },
  { key: 'mobile_payment', title: '移动支付' },
  { key: 'cultural_customs', title: '文化习俗' }
];

// 一键创建模板卡片
function createTemplateCards() {
  const cardEditorList = document.getElementById('card-editor-list');
  // 清空现有卡片
  cardEditorList.innerHTML = '';
  CARD_TEMPLATE_ORDER.forEach(item => {
    addCardEditorItem(cardEditorList, item.key + '_' + Date.now(), {
      title: item.title,
      content: '',
      note: ''
    });
  });
}