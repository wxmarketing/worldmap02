import { supabase, supabaseUrl, supabaseAnonKey } from './supabase.js';

// DeepSeek 代理（Supabase Edge Function）配置
const EDGE_URL = 'https://jpptkbrygzcfjboicowo.supabase.co/functions/v1/deepseek';
const DEEPSEEK_CONFIG = {
  model: 'deepseek-chat',
  maxTokens: 2000,
  temperature: 0.7
};

// DeepSeek API调用函数（通过后端代理）
async function callDeepSeekAPI(prompt) {
  try {
    const response = await fetch(EDGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Supabase Functions 可能要求 Authorization 头（anon key）
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        prompt,
        model: DEEPSEEK_CONFIG.model,
        max_tokens: DEEPSEEK_CONFIG.maxTokens,
        temperature: DEEPSEEK_CONFIG.temperature
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`DeepSeek API调用失败: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
    }

    const data = await response.json();

    const content = data?.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('DeepSeek API返回数据为空');
    }

    return content;
  } catch (error) {
    console.error('DeepSeek API调用错误:', error);
    throw error;
  }
}

// 生成国家卡片内容的主函数
async function generateCountryCards(countryName, countryNameZh) {
  const prompt = `你是一个专业的国家市场分析师。请为${countryNameZh || countryName}生成以下4个方面的分析内容。

要求：
1. 每个内容部分控制在80-150字
2. 注释部分包含具体数据和年份（2023-2024年）
3. 数据要真实可信，符合该国实际情况
4. 语言风格要专业简洁

参考格式示例（美国）：
游戏市场：游戏市场规模约510亿美元，手游占比45%，主机和PC游戏发达。
注：2023年市场同比增长3.2%，预计2025年达570亿美元

请为${countryNameZh || countryName}生成以下内容，返回严格的JSON格式：

{
  "game_market": {
    "content": "游戏市场相关内容",
    "note": "注：具体数据和年份"
  },
  "infrastructure": {
    "content": "基础设施相关内容", 
    "note": "注：具体数据和年份"
  },
  "mobile_device": {
    "content": "互联网使用相关内容",
    "note": "注：具体数据和年份"
  },
  "culture": {
    "content": "文化习俗相关内容",
    "note": "注：具体数据和年份"
  }
}

只返回JSON，不要包含其他文字说明。`;

  try {
    const response = await callDeepSeekAPI(prompt);
    
    // 尝试解析JSON响应
    let parsedData;
    try {
      // 清理响应文本，移除可能的markdown代码块标记
      const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedData = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('JSON解析失败:', parseError);
      console.error('原始响应:', response);
      throw new Error('AI返回的数据格式不正确，请重试');
    }

    // 验证数据结构
    const requiredKeys = ['game_market', 'infrastructure', 'mobile_device', 'culture'];
    for (const key of requiredKeys) {
      if (!parsedData[key] || !parsedData[key].content || !parsedData[key].note) {
        throw new Error(`生成的数据缺少必要字段: ${key}`);
      }
    }

    return parsedData;
  } catch (error) {
    console.error('生成国家卡片内容失败:', error);
    throw error;
  }
}

// 导出AI相关函数供外部使用
window.generateCountryCards = generateCountryCards;

// 区域中文翻译映射
export const regionTranslations = {
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
export let countryData = {
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
export const allWorldCountries = [
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
      name_zh: country.name_zh, // 确保name_zh被正确复制
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
}

// 执行国家数据初始化
// 确保在任何需要访问 countryData 的代码之前执行

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
export async function updateCountryDetail(countryName, countryCode) {
  // Get country information with actual country name
  const data = getCountryInfo(countryCode, countryName);
  
  // 获取中文国家名称和区域名称
  const chineseCountryName = getChineseCountryName(countryName);
  const chineseRegionName = regionTranslations[data.region] || data.region;
  
  // Update country name and region in panel with Chinese names
  document.getElementById("country-name").textContent = chineseCountryName;
  document.getElementById("country-region").textContent = chineseRegionName;

  // 在标题下方渲染"阅读报告"按钮（若存在PDF）
  renderReportBar(countryCode, chineseCountryName, data);
  
  // Get the cards container
  const cardsContainer = document.getElementById("country-cards");
  cardsContainer.innerHTML = "";

  // 在报告列表之后、其它信息卡之前：插入英语水平卡片
  let englishCard = null;
  try { englishCard = createEnglishProficiencyCard(countryCode); } catch(_) {}
  // 优先处理：使用语言卡片或其生成入口（确保无数据国家也能看到）
  let langExistingA = null;
  try {
    let raw = countryData[countryCode]?.cards;
    let arr = [];
    if (Array.isArray(raw)) arr = raw;
    else if (raw && typeof raw === 'object') arr = Object.values(raw);
    langExistingA = Array.isArray(arr) ? arr.find(c => (c && (c.id === 'language_usage' || c.title === '使用语言'))) : null;
  } catch(_) { langExistingA = null; }
  let languageInserted = false;
  if (!langExistingA) {
    // 尝试兜底从数据库读取一次
    await fetchLanguageUsageFromDB(countryCode);
    // 重新获取
    try {
      let raw = countryData[countryCode]?.cards; let arr = [];
      if (Array.isArray(raw)) arr = raw; else if (raw && typeof raw === 'object') arr = Object.values(raw);
      langExistingA = Array.isArray(arr) ? arr.find(c => (c && (c.id === 'language_usage' || c.title === '使用语言'))) : null;
    } catch(_) {}
  }
  if (langExistingA && (langExistingA.content && langExistingA.content.trim().length > 0)) {
    const el = createCardElement('language_usage', { title: '使用语言', content: langExistingA.content, note: '' });
    cardsContainer.appendChild(el);
    languageInserted = true;
  }
  
  // 兼容数组和对象
  let cardsArr = [];
  if (Array.isArray(data.cards)) {
    cardsArr = data.cards;
  } else if (data.cards && typeof data.cards === 'object') {
    cardsArr = Object.values(data.cards);
  }
  // 过滤掉语言卡片，判断是否还有其他信息卡片
  const nonLangCards = cardsArr.filter(c => !(c && (c.id === 'language_usage' || c.title === '使用语言')));
  if (nonLangCards.length > 0) {
    // 若已有语言卡，已在上面插入；否则先提供生成入口（保持在最前）
    if (!languageInserted) {
      renderLanguageUsageGenerator(cardsContainer, countryCode, chineseCountryName);
    }
    // 若存在英语卡片，再插入
    if (englishCard) cardsContainer.appendChild(englishCard);
    nonLangCards.forEach(cardData => {
      const cardElement = createCardElement(cardData.id || '', cardData);
      cardsContainer.appendChild(cardElement);
    });
  } else {
    // 无其它卡片时：若已有语言卡已插入，否则显示生成入口；随后插入英语卡
    if (!languageInserted) renderLanguageUsageGenerator(cardsContainer, countryCode, chineseCountryName);
    if (englishCard) cardsContainer.appendChild(englishCard);
    const noDataCard = document.createElement("div");
    noDataCard.className = "country-card";
    noDataCard.innerHTML = `<h3>数据待更新</h3><p>该国家/地区的详细卡片信息正在整理中，您可以点击下方按钮使用AI自动生成相关内容。</p>`;
    cardsContainer.appendChild(noDataCard);

    // AI 生成按钮区域
    const aiContainer = document.createElement('div');
    aiContainer.style.margin = '16px 0 4px 0';
    aiContainer.style.textAlign = 'center';

    const aiBtn = document.createElement('button');
    aiBtn.textContent = '生成国家信息';
    aiBtn.style.padding = '10px 16px';
    aiBtn.style.border = 'none';
    aiBtn.style.borderRadius = '20px';
    aiBtn.style.backgroundColor = '#4CAF50';
    aiBtn.style.color = '#fff';
    aiBtn.style.cursor = 'pointer';
    aiBtn.style.fontWeight = '600';

    const aiHint = document.createElement('div');
    aiHint.style.fontSize = '12px';
    aiHint.style.color = '#888';
    aiHint.style.marginTop = '6px';
    aiHint.textContent = '说明：由Deepseek-V3.1模型支持生成，生成内容刷新后不保留。';

    aiContainer.appendChild(aiBtn);
    aiContainer.appendChild(aiHint);
    cardsContainer.appendChild(aiContainer);

    // 生成中状态元素
    const loadingEl = document.createElement('div');
    loadingEl.style.marginTop = '10px';
    loadingEl.style.textAlign = 'center';
    loadingEl.style.color = '#4CAF50';
    loadingEl.style.display = 'none';
    loadingEl.textContent = 'AI 正在分析并生成内容，请稍候…';
    cardsContainer.appendChild(loadingEl);

    // 绑定点击事件
    aiBtn.addEventListener('click', async () => {
      aiBtn.disabled = true;
      aiBtn.style.opacity = '0.7';
      loadingEl.style.display = 'block';
      try {
        const result = await generateCountryCards(data.name, chineseCountryName);
        // 渲染AI结果（临时，不写入数据库）
        renderAIGeneratedCards(cardsContainer, result);
        // 添加重新生成按钮
        addAIMoreActions(cardsContainer, () => {
          // 重新生成：清理并再次触发
          document.getElementById('country-cards').innerHTML = '';
          // 重新渲染当前国家
          try {
            const nameForRender = (countryData[countryCode] && (countryData[countryCode].name_zh || countryData[countryCode].name)) || '';
            if (typeof updateCountryDetail === 'function') updateCountryDetail(nameForRender || countryCode, countryCode);
            else if (typeof window !== 'undefined' && typeof window.updateCountryDetail === 'function') window.updateCountryDetail(nameForRender || countryCode, countryCode);
          } catch(_) {}
        });
      } catch (err) {
        alert('生成失败：' + (err?.message || '网络异常'));
      } finally {
        loadingEl.style.display = 'none';
        aiBtn.disabled = false;
        aiBtn.style.opacity = '1';
      }
    });
  }
  
  // Add "查看详细分析"按钮 if URL is available
  addDetailAnalysisButton(cardsContainer, data, countryCode);
  
  // Show country detail panel
  document.getElementById("country-detail").classList.remove("hidden");
}

function renderReportBar(countryCode, chineseCountryName, data) {
  const header = document.querySelector('.country-header');
  if (!header) return;
  // 清除旧的
  let old = document.getElementById('report-bar');
  if (old) old.remove();
  if (!Array.isArray(data.pdfs) || data.pdfs.length === 0) return;
  
  // 检查用户是否登录
  const isAuthenticated = window.getCurrentUser && window.getCurrentUser();
  if (!isAuthenticated) {
    // 未登录用户不显示报告列表
    return;
  }
  const wrap = document.createElement('div');
  wrap.id = 'report-bar';

  // 使用与信息卡片一致的外观
  const card = document.createElement('div');
  card.className = 'country-card';
  const titleEl = document.createElement('h3');
  titleEl.textContent = '报告列表';
  card.appendChild(titleEl);

  const list = document.createElement('div');
  list.className = 'report-list';

  data.pdfs.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'report-item';
    const openHandler = async () => {
      // 记录当前报告元信息，供"帮我读"展示摘要
      try {
        const extractPath = (possibleUrl) => {
          if (!possibleUrl) return '';
          try {
            const u = new URL(possibleUrl);
            const m = u.pathname.match(/\/object\/(?:sign|public)\/country-pdfs\/(.*)$/);
            if (m && m[1]) return decodeURIComponent(m[1]);
            const i = u.pathname.indexOf('/country-pdfs/');
            if (i >= 0) return decodeURIComponent(u.pathname.slice(i + '/country-pdfs/'.length));
          } catch(_) {}
          return '';
        };
        const path = item.path || extractPath(item.url);
        if (!path) throw new Error('无有效路径');
        const { data: signed, error } = await supabase.storage.from('country-pdfs').createSignedUrl(path, 60 * 60);
        if (error) throw error;
        const url = signed?.signedUrl || '';
        window.currentReportMeta = { countryCode, ...item, path, url };
        if (window.openPdfViewer) {
          window.openPdfViewer(url, item.title || (chineseCountryName + ' - 报告'));
        } else {
          window.open(url, '_blank');
        }
      } catch (e) {
        alert('生成阅读链接失败');
      }
    };
    // 仅在标题行绑定点击，避免编辑区域误触
    const headerRow = document.createElement('div');
    headerRow.className = 'report-row';
    headerRow.addEventListener('click', openHandler);

    const tt = document.createElement('div');
    tt.className = 'report-title';
    tt.textContent = item.title || `${chineseCountryName} 报告 ${idx+1}`;

    const action = document.createElement('span');
    action.className = 'report-action';
    action.textContent = '阅读';

    headerRow.appendChild(tt);
    headerRow.appendChild(action);
    row.appendChild(headerRow);

    // 卡片中摘要展示（单独一行，避免被横向 flex 压缩）
    if (item.summaryCard) {
      const sum = document.createElement('div');
      sum.className = 'report-summary';
      sum.textContent = item.summaryCard;
      // 摘要也支持点击打开
      sum.addEventListener('click', openHandler);
      row.appendChild(sum);
    }
    list.appendChild(row);
  });

  card.appendChild(list);
  wrap.appendChild(card);
  // 插入到可滚动区域（与信息卡片同容器）
  const info = document.querySelector('.country-info');
  const cardsContainer = document.getElementById('country-cards');
  if (info && cardsContainer) {
    info.insertBefore(wrap, cardsContainer);
  } else {
    header.after(wrap);
  }
}

// Helper function to create a country info card element
function createCardElement(cardId, cardData) {
  const cardElement = document.createElement("div");
  cardElement.className = "country-card";
  cardElement.dataset.cardId = cardId;
  
  // Create card content
  const imageHtml = cardData.imageUrl ? 
    `<div class="image-explanation">下图中游戏不分先后排名，依据以下逻辑综合选出："谷歌苹果双商店在榜＞收入榜&下载榜均在榜＞单商店下载榜在榜（发达国家苹果、发展中国家谷歌）＞单商店收入榜在榜"</div>
    <img src="${cardData.imageUrl}" alt="${cardData.title} 图片" class="card-image">` : '';
  
  const rankingButton = cardData.title === '游戏市场' ? 
    `<div class="ranking-button-container">
      <button class="ranking-button" onclick="window.open('https://databrain.woa.com/v2/intelligence/storeRanks/MobileGlobalRegion?filters_key=bded81aca6e4dc5829ad586fb0fa5371&', '_blank')">查看实时排名</button>
    </div>` : '';
  
  cardElement.innerHTML = `
    <h3>${cardData.title}</h3>
    <div>${cardData.content || ''}</div>
    ${cardData.note ? `<div class="card-note">${cardData.note}</div>` : ''}
    ${imageHtml}
    ${rankingButton}
  `;
  
  // 为图片添加点击事件监听器
  if (cardData.imageUrl) {
    const imageElement = cardElement.querySelector('.card-image');
    if (imageElement) {
      imageElement.addEventListener('click', function(e) {
        e.stopPropagation(); // 防止事件冒泡
        showImageModal(cardData.imageUrl, cardData.title);
      });
    }
  }
  
  return cardElement;
}

// 等级到文案映射（英语水平）
const ENGLISH_LEVEL_MAP = {
  '最高级': {
    title: '最高级程度',
    desc: '可以无障碍地使用英语进行阅读、交流，能够轻松理解一切听到和读到的内容，有能力消费文本内容较多、具有一定文学性和故事性的游戏，甚至可以判断出游戏本地化质量的优劣。'
  },
  '高级': {
    title: '高级程度',
    desc: '能够流畅阅读绝大多数英语游戏中的文本与剧情对话，能理解稍微复杂的故事背景和角色关系。但在理解生僻词汇、文化梗和晦涩表达上较为困难，在体验《极乐迪斯科》这类文本质量较高的游戏上会有障碍。'
  },
  '中级': {
    title: '中级程度',
    desc: '能够读懂一般游戏主线任务的剧情描述和大部分界面说明，但对于长篇的文学性文本、复杂的技能说明或带有大量俚语的对话有理解难度。'
  },
  '初级': {
    title: '初级程度',
    desc: '能借助游戏内的图标和简单提示，理解基本的任务目标和剧情大意，但在阅读大段的角色对话、物品背景描述或复杂的系统说明时，会感到明显吃力，无法畅玩剧情类游戏。'
  },
  '初学': {
    title: '初学程度',
    desc: '仅能识别游戏界面中的基础单词（如Start, Save, Exit）和非常简单的短句指引，几乎无法理解剧情文本和任务描述，游戏过程主要依靠图标、地图和视觉反馈来推进。'
  }
};

// 创建“英语水平”卡片
function createEnglishProficiencyCard(countryCode) {
  const info = countryData[countryCode];
  if (!info || !info.englishProficiency) return null;
  const { score, worldRank, level } = info.englishProficiency;
  if (!score && !worldRank && !level) return null;

  const map = ENGLISH_LEVEL_MAP[level] || null;
  const levelTitle = map ? map.title : (level ? `${level}程度` : '掌握程度');
  const desc = map ? map.desc : '数据待更新';

  const card = document.createElement('div');
  card.className = 'country-card english-card';
  card.innerHTML = `
    <h3>英语水平</h3>
    <div class="english-meta">
      <div class="ef-score">2024 EF英语熟练度分数：<span class="num">${score ?? '—'}</span></div>
      <div class="ef-rank">世界排名：<span class="num">${worldRank != null ? `${worldRank}/116` : '—'}</span></div>
    </div>
    <hr class="english-divider" />
    <div class="english-desc-line"><span class="level-badge">${levelTitle}：</span><span class="desc">${desc}</span></div>
  `;
  return card;
}

// —— 使用语言（表格）生成与保存 ——
function renderLanguageTableHTML(rows) {
  try {
    if (!Array.isArray(rows) || rows.length === 0) return '<div>数据待更新</div>';
    const header = `
      <div class="lang-table-wrap">
      <table class="lang-table">
        <colgroup>
          <col />
          <col />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th>语言</th>
            <th>使用人口</th>
            <th>分布地区</th>
          </tr>
        </thead>
        <tbody>
    `;
    const body = rows.map(r => {
      const lang = (r.language || r.语言 || '').toString();
      const ratio = (r.ratio || r.占比 || r.population_ratio || '').toString();
      const region = (r.region || r.地区 || r.distribution || '').toString();
      return `<tr><td>${lang}</td><td>${ratio}</td><td>${region}</td></tr>`;
    }).join('');
    const footer = `</tbody></table></div>`;
    return header + body + footer;
  } catch(_) {
    return '<div>数据待更新</div>';
  }
}

async function generateLanguageUsage(countryCode, chineseCountryName) {
  const prompt = `请基于公开可得的信息，列出${chineseCountryName}常用语言情况，严格输出JSON数组，不要任何解释。每项包含字段：language（语言中文名），ratio（使用人口占比，保留百分号或区间文本），region（主要流行地区，中文）。数组元素数量3-6个，按使用规模排序。`;
  const content = await callDeepSeekAPI(prompt);
  let rows = [];
  try { rows = JSON.parse(content); } catch(_) {}
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('AI未返回有效数据');
  const html = renderLanguageTableHTML(rows);
  // 保存到 country_card_details 表（持久化）
  const payload = {
    country_code: countryCode,
    card_id: 'language_usage',
    title: '使用语言',
    content: html,
    note: '',
    imageUrl: null,
    order_index: 0
  };
  // 由于表上可能没有 (country_code, card_id) 复合唯一约束，这里手动实现 upsert
  const { data: existedRows, error: selectErr } = await supabase
    .from('country_card_details')
    .select('card_id')
    .eq('country_code', countryCode)
    .eq('card_id', 'language_usage');
  if (selectErr) throw selectErr;
  if (Array.isArray(existedRows) && existedRows.length > 0) {
    const { error: updErr } = await supabase
      .from('country_card_details')
      .update({ title: payload.title, content: payload.content, note: payload.note, imageUrl: payload.imageUrl, order_index: payload.order_index })
      .eq('country_code', countryCode)
      .eq('card_id', 'language_usage');
    if (updErr) throw updErr;
  } else {
    const { error: insErr } = await supabase
      .from('country_card_details')
      .insert([payload]);
    if (insErr) throw insErr;
  }
  // 同步到内存结构
  if (!countryData[countryCode]) countryData[countryCode] = { cards: [] };
  const cards = Array.isArray(countryData[countryCode].cards) ? countryData[countryCode].cards : [];
  const idx = cards.findIndex(c => (c.id === 'language_usage' || c.title === '使用语言'));
  const cardObj = { id: 'language_usage', title: '使用语言', content: html, note: '' };
  if (idx >= 0) cards[idx] = cardObj; else cards.unshift(cardObj);
  countryData[countryCode].cards = cards;
  return html;
}

function renderLanguageUsageGenerator(container, countryCode, chineseCountryName) {
  const card = document.createElement('div');
  card.className = 'country-card';
  card.innerHTML = `
    <h3>使用语言</h3>
    <div class="lang-gen-hint">库内暂无数据，可点击下方按钮由AI生成相关内容，生成后的内容将上传至数据库中永久保留。</div>
    <div class="lang-gen-actions"><button class="lang-gen-btn">生成使用语言</button></div>
  `;
  const btn = card.querySelector('.lang-gen-btn');
  btn.addEventListener('click', async () => {
    btn.disabled = true; btn.textContent = '生成中...';
    try {
      await generateLanguageUsage(countryCode, chineseCountryName);
      // 生成后，刷新面板
      try {
        const nameForRender = (countryData[countryCode] && (countryData[countryCode].name_zh || countryData[countryCode].name)) || '';
        if (typeof updateCountryDetail === 'function') {
          updateCountryDetail(nameForRender || countryCode, countryCode);
        } else if (typeof window !== 'undefined' && typeof window.updateCountryDetail === 'function') {
          window.updateCountryDetail(nameForRender || countryCode, countryCode);
        }
      } catch(_) {}
    } catch(e) {
      alert('生成失败：' + (e?.message || '网络错误'));
    } finally { btn.disabled = false; btn.textContent = '生成使用语言'; }
  });
  container.appendChild(card);
}

// 按需从 Supabase 拉取单个国家的“使用语言”卡片（兜底）
async function fetchLanguageUsageFromDB(countryCode) {
  try {
    const { data, error } = await supabase
      .from('country_card_details')
      .select('card_id, title, content, note')
      .eq('country_code', countryCode)
      .eq('card_id', 'language_usage')
      .maybeSingle();
    if (error) return null;
    if (!data || !data.content) return null;
    // 更新内存
    if (!countryData[countryCode]) countryData[countryCode] = { cards: [] };
    const arr = Array.isArray(countryData[countryCode].cards) ? countryData[countryCode].cards : [];
    const idx = arr.findIndex(c => (c.id === 'language_usage' || c.title === '使用语言'));
    const obj = { id: 'language_usage', title: data.title || '使用语言', content: data.content, note: data.note || '' };
    if (idx >= 0) arr[idx] = obj; else arr.unshift(obj);
    countryData[countryCode].cards = arr;
    return obj;
  } catch(_) { return null; }
}

// 渲染AI生成的四个固定卡片（临时）
function renderAIGeneratedCards(container, aiData) {
  const titleMap = {
    game_market: '游戏市场',
    infrastructure: '基础设施',
    mobile_device: '互联网使用',
    culture: '文化习俗'
  };
  // 清空占位
  container.innerHTML = '';
  ['game_market','infrastructure','mobile_device','culture'].forEach(key => {
    const payload = {
      title: titleMap[key],
      content: aiData[key]?.content || '信息待更新',
      note: aiData[key]?.note || ''
    };
    const el = createCardElement(key, payload);
    container.appendChild(el);
  });
}

// 添加"重新生成"操作区域（不保存到数据库）
function addAIMoreActions(container, onRegenerate) {
  const bar = document.createElement('div');
  bar.style.textAlign = 'center';
  bar.style.marginTop = '12px';

  const regenBtn = document.createElement('button');
  // 使用图标+文字的清晰按钮样式
  regenBtn.innerHTML = `
    <span style="display:inline-flex;align-items:center;gap:6px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 12a8 8 0 1 1-2.34-5.66" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M20 4v6h-6" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>重新生成</span>
    </span>`;
  regenBtn.style.padding = '8px 16px';
  regenBtn.style.border = '1px solid var(--border-color)';
  regenBtn.style.borderRadius = '18px';
  regenBtn.style.background = '#fff';
  regenBtn.style.cursor = 'pointer';
  regenBtn.style.fontSize = '14px';
  regenBtn.style.color = 'var(--text-color)';
  regenBtn.style.boxShadow = '0 1px 2px rgba(0,0,0,0.06)';

  regenBtn.addEventListener('mouseenter', function(){
    this.style.background = '#f7f7f7';
  });
  regenBtn.addEventListener('mouseleave', function(){
    this.style.background = '#fff';
  });

  regenBtn.addEventListener('click', () => {
    if (typeof onRegenerate === 'function') onRegenerate();
  });

  bar.appendChild(regenBtn);
  container.appendChild(bar);
}

// Helper function to add detail analysis button
function addDetailAnalysisButton(container, countryData, countryCode) {
  // 若未配置链接，直接不渲染按钮
  if (!countryData.detailAnalysisUrl || countryData.detailAnalysisUrl.trim() === "") {
    return;
  }
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
    let url = countryData.detailAnalysisUrl;
    if (url && url.trim() !== "") {
      // 自动补全 http/https
      if (!/^https?:\/\//i.test(url)) {
        url = "https://" + url;
      }
      window.open(url, "_blank");
    }
  });
  
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

  // 额外增加"全局（仅报告列表）"，用于上传仅出现在报告列表的报告
  const globalOpt = document.createElement('option');
  globalOpt.value = 'GLOBAL';
  globalOpt.textContent = '全局（仅报告列表）';
  adminCountrySelect.appendChild(globalOpt);
  
  // Add event listener to country select
  adminCountrySelect.addEventListener("change", function() {
    if (this.value) {
      populateCardEditor(this.value);
    } else {
      // Clear card editor
      document.getElementById("card-editor-list").innerHTML = "";
    }
  });
  
  // Add event listeners for admin panel toggle - 需要认证
  document.getElementById("admin-toggle").addEventListener("click", function() {
    // 检查认证状态
    if (!window.getCurrentUser || !window.getCurrentUser()) {
      if (window.showAuthModal) {
        window.showAuthModal('login');
        if (window.showAuthMessage) {
          window.showAuthMessage('请先登录以访问管理面板', 'error');
        }
      }
      return;
    }
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

  // PDF 报告管理（M1）
  addPdfManager(cardEditorList, countryCode, data);
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

// ===== PDF 报告管理（管理面板） =====
function addPdfManager(container, countryCode, countryObj) {
  const section = document.createElement('div');
  section.style.border = '1px solid #ddd';
  section.style.borderRadius = '6px';
  section.style.padding = '12px';
  section.style.margin = '10px 0 16px';

  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  const h4 = document.createElement('h4');
  h4.textContent = 'PDF 报告';
  h4.style.margin = '0 0 8px 0';
  header.appendChild(h4);
  section.appendChild(header);

  const form = document.createElement('div');
  form.style.display = 'grid';
  form.style.gridTemplateColumns = '1fr auto';
  form.style.gap = '8px';

  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.placeholder = '报告标题（必填）';
  titleInput.style.padding = '8px';
  titleInput.style.border = '1px solid #ccc';
  titleInput.style.borderRadius = '4px';

  const row2 = document.createElement('div');
  row2.style.display = 'flex';
  row2.style.gap = '8px';
  row2.style.alignItems = 'center';

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'application/pdf';

  const uploadBtn = document.createElement('button');
  uploadBtn.textContent = '上传并关联';
  uploadBtn.style.padding = '8px 12px';
  uploadBtn.style.border = '1px solid #ddd';
  uploadBtn.style.borderRadius = '6px';
  uploadBtn.style.cursor = 'pointer';

  form.appendChild(titleInput);
  const filler = document.createElement('div');
  form.appendChild(filler);
  row2.appendChild(fileInput);
  row2.appendChild(uploadBtn);
  section.appendChild(form);
  section.appendChild(row2);

  const listWrap = document.createElement('div');
  listWrap.style.marginTop = '10px';
  section.appendChild(listWrap);

  container.appendChild(section);

  let pdfs = Array.isArray(countryObj.pdfs) ? [...countryObj.pdfs] : [];
  renderPdfList(listWrap, pdfs, countryCode);

  uploadBtn.addEventListener('click', async () => {
    const file = fileInput.files && fileInput.files[0];
    const title = titleInput.value.trim();
    if (!title) { alert('请填写报告标题'); return; }
    if (!file) { alert('请选择PDF文件'); return; }
    if (file.type !== 'application/pdf') { alert('仅支持PDF文件'); return; }

    uploadBtn.disabled = true; uploadBtn.textContent = '上传中…';
    try {
      const saved = await uploadPdfAndSave(countryCode, file, title, pdfs);
      pdfs = saved;
      renderPdfList(listWrap, pdfs, countryCode);
      titleInput.value = '';
      fileInput.value = '';
      alert('已上传并关联');
    } catch (e) {
      console.error(e);
      alert('上传失败：' + (e?.message || '未知错误'));
    } finally {
      uploadBtn.disabled = false; uploadBtn.textContent = '上传并关联';
    }
  });
}

async function uploadPdfAndSave(countryCode, file, title, currentPdfs) {
  const safeName = `${Date.now()}_${file.name.replace(/[^A-Za-z0-9_.-]/g,'_')}`;
  const path = `${countryCode}/${safeName}`;
  const { data: up, error: upErr } = await supabase.storage
    .from('country-pdfs')
    .upload(path, file, { contentType: file.type || 'application/pdf', upsert: false });
  if (upErr) throw upErr;
  const { data: pub } = supabase.storage.from('country-pdfs').getPublicUrl(path);
  const newItem = { title, url: '', path, updatedAt: new Date().toISOString(), summaryCard: '', summaryReader: '', isRecent: false };
  // 若为全局报告，确保存在 GLOBAL 行，并读取现有 pdfs 再更新
  let basePdfs = currentPdfs;
  if (countryCode === 'GLOBAL') {
    const { data: exist, error: selErr } = await supabase
      .from('country_cards')
      .select('pdfs')
      .eq('country_code', 'GLOBAL')
      .single();
    if (selErr && selErr.code === 'PGRST116') {
      // 行不存在则创建
      const { error: insErr } = await supabase.from('country_cards').insert([{ country_code: 'GLOBAL', pdfs: [] }]);
      if (insErr) throw insErr;
      basePdfs = [];
    } else if (!selErr) {
      basePdfs = Array.isArray(exist?.pdfs) ? exist.pdfs : [];
    }
  }
  const next = [...(basePdfs || currentPdfs || []), newItem];
  const { error: dbErr } = await supabase.from('country_cards').update({ pdfs: next }).eq('country_code', countryCode);
  if (dbErr) throw dbErr;
  // 同步到内存数据，以便详情页立即显示
  if (!countryData[countryCode]) countryData[countryCode] = {};
  countryData[countryCode].pdfs = next;
  return next;
}

function renderPdfList(wrap, pdfs, countryCode) {
  wrap.innerHTML = '';
  if (!pdfs || pdfs.length === 0) {
    const tip = document.createElement('div');
    tip.textContent = '尚未关联任何报告';
    tip.style.color = '#666';
    tip.style.fontSize = '12px';
    wrap.appendChild(tip);
    return;
  }
  pdfs.forEach((item, idx) => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.alignItems = 'center';
    row.style.padding = '6px 0';
    const left = document.createElement('div');
    left.textContent = item.title || `报告${idx+1}`;
    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '8px';
    const aView = document.createElement('button'); aView.textContent = '预览'; aView.style.cursor = 'pointer';
    aView.addEventListener('click', async ()=>{
      try {
        const { data, error } = await supabase.storage.from('country-pdfs').createSignedUrl(item.path || '', 60 * 60);
        if (error) throw error; const url = data?.signedUrl || '';
        if (url) window.open(url, '_blank'); else alert('无法生成预览链接');
      } catch(e){ alert('预览失败'); }
    });
    const aOpen = document.createElement('button'); aOpen.textContent = '在阅读器打开'; aOpen.style.cursor='pointer';
    aOpen.addEventListener('click', async ()=> {
      try {
        const { data, error } = await supabase.storage.from('country-pdfs').createSignedUrl(item.path || '', 60 * 60);
        if (error) throw error; const url = data?.signedUrl || '';
        if (window.openPdfViewer) window.openPdfViewer(url, item.title);
      } catch(e){ alert('打开失败'); }
    });
    // 最近更新切换
    const toggleRecent = document.createElement('button');
    toggleRecent.textContent = item.isRecent ? '取消置顶' : '置于最近更新';
    toggleRecent.style.cursor = 'pointer';
    toggleRecent.addEventListener('click', async () => {
      const next = pdfs.map(p => p === item ? { ...p, isRecent: !item.isRecent } : p);
      const { error: dbErr } = await supabase.from('country_cards').update({ pdfs: next }).eq('country_code', countryCode);
      if (dbErr) { alert('保存失败：' + (dbErr.message || '数据库错误')); return; }
      pdfs.splice(0, pdfs.length, ...next);
      if (!countryData[countryCode]) countryData[countryCode] = {};
      countryData[countryCode].pdfs = next;
      renderPdfList(wrap, next, countryCode);
    });
    const edit = document.createElement('button'); edit.textContent = '编辑摘要'; edit.style.cursor='pointer';
    const del = document.createElement('button'); del.textContent = '删除'; del.style.cursor='pointer';
    del.addEventListener('click', async ()=>{
      if (!confirm('确认删除该报告关联？此操作会从数据库移除，并尝试从存储删除文件。')) return;
      const next = pdfs.filter(p => p !== item);
      const { error: dbErr } = await supabase.from('country_cards').update({ pdfs: next }).eq('country_code', countryCode);
      if (dbErr) { alert('数据库更新失败'); return; }
      // 试图删除存储文件（忽略失败）
      if (item.path) await supabase.storage.from('country-pdfs').remove([item.path]).catch(()=>{});
      pdfs.splice(0, pdfs.length, ...next);
      if (!countryData[countryCode]) countryData[countryCode] = {};
      countryData[countryCode].pdfs = next;
      renderPdfList(wrap, next, countryCode);
    });
    actions.appendChild(aView); actions.appendChild(aOpen); actions.appendChild(toggleRecent); actions.appendChild(edit); actions.appendChild(del);
    row.appendChild(left); row.appendChild(actions);
    wrap.appendChild(row);

    // 摘要编辑区
    const editor = document.createElement('div');
    editor.style.margin = '6px 0 12px 0';
    editor.style.display = 'none';
    const taCard = document.createElement('textarea');
    taCard.style.width = '100%';
    taCard.style.minHeight = '70px';
    taCard.style.border = '1px solid #ddd';
    taCard.style.borderRadius = '6px';
    taCard.style.padding = '8px';
    taCard.placeholder = '卡片中显示的摘要（summaryCard）';
    taCard.value = item.summaryCard || '';
    // 创建富文本编辑器容器
    const editorContainer = document.createElement('div');
    editorContainer.style.marginTop = '6px';
    
    // 创建工具栏
    const toolbar = document.createElement('div');
    toolbar.style.display = 'flex';
    toolbar.style.gap = '4px';
    toolbar.style.marginBottom = '6px';
    toolbar.style.padding = '6px';
    toolbar.style.backgroundColor = '#f5f5f5';
    toolbar.style.borderRadius = '6px';
    toolbar.style.border = '1px solid #ddd';
    
    // 创建工具栏按钮
    const createToolbarButton = (text, command, value = '') => {
      const btn = document.createElement('button');
      btn.innerHTML = text;
      btn.type = 'button';
      btn.style.padding = '4px 8px';
      btn.style.border = '1px solid #ccc';
      btn.style.borderRadius = '4px';
      btn.style.backgroundColor = '#fff';
      btn.style.cursor = 'pointer';
      btn.style.fontSize = '12px';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.execCommand(command, false, value);
        editorContainer.querySelector('.rich-editor').focus();
      });
      return btn;
    };
    
    // 添加工具栏按钮
    toolbar.appendChild(createToolbarButton('<b>B</b>', 'bold'));
    toolbar.appendChild(createToolbarButton('<i>I</i>', 'italic'));
    toolbar.appendChild(createToolbarButton('<u>U</u>', 'underline'));
    toolbar.appendChild(createToolbarButton('<s>S</s>', 'strikeThrough'));
    
    // 字体大小下拉框
    const fontSizeSelect = document.createElement('select');
    fontSizeSelect.style.padding = '4px 6px';
    fontSizeSelect.style.border = '1px solid #ccc';
    fontSizeSelect.style.borderRadius = '4px';
    fontSizeSelect.style.fontSize = '12px';
    const sizes = ['12px', '14px', '16px', '18px', '20px', '24px'];
    sizes.forEach(size => {
      const option = document.createElement('option');
      option.value = size;
      option.textContent = size;
      fontSizeSelect.appendChild(option);
    });
    fontSizeSelect.addEventListener('change', (e) => {
      document.execCommand('fontSize', false, e.target.value);
      editorContainer.querySelector('.rich-editor').focus();
    });
    toolbar.appendChild(fontSizeSelect);
    
    // 列表按钮
    toolbar.appendChild(createToolbarButton('• 列表', 'insertUnorderedList'));
    toolbar.appendChild(createToolbarButton('1. 编号', 'insertOrderedList'));
    
    // 创建富文本编辑器
    const richEditor = document.createElement('div');
    richEditor.className = 'rich-editor';
    richEditor.contentEditable = true;
    richEditor.style.minHeight = '70px';
    richEditor.style.border = '1px solid #ddd';
    richEditor.style.borderRadius = '6px';
    richEditor.style.padding = '8px';
    richEditor.style.backgroundColor = '#fff';
    richEditor.style.outline = 'none';
    richEditor.innerHTML = item.summaryReader || '';
    
    // 添加占位符效果
    const updatePlaceholder = () => {
      if (richEditor.innerHTML.trim() === '' || richEditor.innerHTML === '<br>') {
        richEditor.innerHTML = '<span style="color: #999; font-style: italic;">帮我读中显示的摘要（summaryReader）</span>';
      }
    };
    
    const removePlaceholder = () => {
      if (richEditor.innerHTML.includes('帮我读中显示的摘要')) {
        richEditor.innerHTML = '';
      }
    };
    
    richEditor.addEventListener('focus', removePlaceholder);
    richEditor.addEventListener('blur', updatePlaceholder);
    richEditor.addEventListener('input', () => {
      if (richEditor.innerHTML.includes('帮我读中显示的摘要')) {
        richEditor.innerHTML = '';
      }
    });
    
    // 初始显示占位符
    if (!item.summaryReader || item.summaryReader.trim() === '') {
      updatePlaceholder();
    }
    
    editorContainer.appendChild(toolbar);
    editorContainer.appendChild(richEditor);
    const save = document.createElement('button');
    save.textContent = '保存摘要';
    save.style.marginTop = '6px';
    save.style.padding = '6px 10px';
    save.style.border = '1px solid #ddd';
    save.style.borderRadius = '6px';
    save.style.cursor = 'pointer';
    editor.appendChild(taCard);
    editor.appendChild(editorContainer);
    editor.appendChild(save);
    wrap.appendChild(editor);

    edit.addEventListener('click', ()=>{
      editor.style.display = editor.style.display === 'none' ? 'block' : 'none';
      ta.focus();
    });
    save.addEventListener('click', async ()=>{
      // 获取富文本编辑器内容，清理占位符文本
      let readerContent = richEditor.innerHTML;
      if (readerContent.includes('帮我读中显示的摘要')) {
        readerContent = '';
      }
      
      const next = pdfs.map(p => p === item ? { ...p, summaryCard: taCard.value.trim(), summaryReader: readerContent.trim() } : p);
      const { error: dbErr } = await supabase.from('country_cards').update({ pdfs: next }).eq('country_code', countryCode);
      if (dbErr) { alert('保存失败：' + (dbErr.message || '数据库错误')); return; }
      // 同步内存
      if (!countryData[countryCode]) countryData[countryCode] = {};
      countryData[countryCode].pdfs = next;
      // 更新本地数组以便后续继续编辑
      pdfs.splice(0, pdfs.length, ...next);
      alert('已保存');
    });
  });
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
    <div class="card-field image-upload-field">
      <label for="${cardId}_imageUrl">图片上传：</label>
      <input type="file" id="${cardId}_file_upload" class="image-file-upload" accept="image/*">
      <input type="text" id="${cardId}_imageUrl" name="imageUrl" value="${cardData.imageUrl || ''}" placeholder="或直接输入图片URL" class="image-url-input">
      ${cardData.imageUrl ? `<img src="${cardData.imageUrl}" alt="图片预览" class="image-preview" style="max-width: 100px; max-height: 100px; margin-top: 10px; display: block;">` : `<img src="" alt="图片预览" class="image-preview" style="max-width: 100px; max-height: 100px; margin-top: 10px; display: none;">`}
    </div>
    <div class="card-field">
      <label>卡片内容：</label>
      <div class="card-content-toolbar">
        <button type="button" class="bold-btn">加粗</button>
        <input type="color" class="color-btn" title="更改文字颜色">
      </div>
      <div id="${cardId}_content" name="content" class="card-content-editor" contenteditable="true" style="min-height:60px;border:1px solid #ccc;padding:6px;border-radius:3px;">${cardData.content || ""}</div>
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
  
  // 富文本按钮事件
  const contentDiv = cardEditForm.querySelector('.card-content-editor');
  cardEditForm.querySelector('.bold-btn').addEventListener('click', function() {
    document.execCommand('bold');
    contentDiv.focus();
  });
  cardEditForm.querySelector('.color-btn').addEventListener('input', function(e) {
    document.execCommand('foreColor', false, e.target.value);
    contentDiv.focus();
  });
  // 粘贴时只保留纯文本（终极方案）
  contentDiv.addEventListener('paste', function(e) {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    // 直接用innerText覆盖，彻底无格式
    document.execCommand('insertText', false, text); // 尝试插入
    setTimeout(() => {
      contentDiv.innerText = contentDiv.innerText + '';
    }, 0);
  });
  
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
  
  // Add new event listeners for image upload and URL input (moved inside function)
  const fileInput = cardEditForm.querySelector('.image-file-upload');
  const urlInput = cardEditForm.querySelector('.image-url-input');
  const imagePreview = cardEditForm.querySelector('.image-preview');
  
  fileInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
        urlInput.value = ''; // 清空URL输入框，因为用户选择了文件
      };
      reader.readAsDataURL(file);
    } else {
      imagePreview.src = '';
      imagePreview.style.display = 'none';
    }
  });
  
  urlInput.addEventListener('input', function() {
    const url = this.value.trim();
    if (url) {
      imagePreview.src = url;
      imagePreview.style.display = 'block';
      fileInput.value = ''; // 清空文件选择，因为用户输入了URL
    } else {
      imagePreview.src = '';
      imagePreview.style.display = 'none';
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

  for (const form of cardForms) {
    const cardId = form.dataset.cardId;
    const title = form.querySelector("[name='title']").value.trim();
    const content = form.querySelector(".card-content-editor").innerHTML.trim();
    const note = form.querySelector("[name='note']").value.trim();

    let imageUrl = form.querySelector("[name='imageUrl']").value.trim(); // 获取用户输入的URL
    const fileInput = form.querySelector('.image-file-upload');
    const file = fileInput.files[0];

    if (file) {
      // 如果有文件，上传到 Supabase Storage
      const fileExtension = file.name.split('.').pop(); // 获取文件扩展名
      const safeFileName = `${cardId}-${Date.now()}.${fileExtension}`; // 构建一个安全的文件名
      const filePath = `${countryCode}/${safeFileName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('card-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        alert('图片上传失败: ' + uploadError.message);
        console.error('图片上传失败:', uploadError);
        continue; 
      }
      // 手动构建公共URL，因为getPublicUrl可能返回不正确的格式
      imageUrl = `${supabaseUrl}/storage/v1/object/public/card-images/${filePath}`;
    }

    if (title || content || imageUrl) {
      countryData[countryCode].cards.push({
        id: cardId,
        title,
        content,
        note,
        imageUrl // 保存图片URL
      });
    }
  }

  // Update UI if the country detail panel is showing this country
  const countryDetailName = document.getElementById("country-name").textContent;
  const chineseCountryName = getChineseCountryName(countryData[countryCode].name);
  if (countryDetailName === chineseCountryName) {
    updateCountryDetail(countryData[countryCode].name, countryCode);
  }
  alert("卡片数据保存成功");
  await saveCountryDataToSupabase(countryCode);
}

// 显示图片大图模态框
function showImageModal(imageUrl, imageTitle) {
  const modal = document.getElementById('image-modal');
  const modalImage = document.getElementById('modal-image');
  
  if (!modal || !modalImage) {
    return;
  }
  
  modalImage.src = imageUrl;
  modalImage.alt = imageTitle + ' - 大图查看';
  modal.style.display = 'block';
  
  // 防止页面滚动
  document.body.style.overflow = 'hidden';
}

// 隐藏图片大图模态框
function hideImageModal() {
  const modal = document.getElementById('image-modal');
  modal.style.display = 'none';
  
  // 恢复页面滚动
  document.body.style.overflow = 'auto';
}

// 初始化图片模态框事件监听器
function initImageModal() {
  const modal = document.getElementById('image-modal');
  const closeBtn = document.querySelector('.image-modal-close');
  
  // 点击关闭按钮关闭模态框
  if (closeBtn) {
    closeBtn.addEventListener('click', hideImageModal);
  }
  
  // 点击模态框背景关闭模态框
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        hideImageModal();
      }
    });
  }
  
  // 按ESC键关闭模态框
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      hideImageModal();
    }
  });
}

// 批量上传功能
let batchFiles = [];

// 动态构建中文文件名匹配映射 - 支持所有国家
function buildChineseCountryMapping() {
  const mapping = {};
  
  // 遍历所有世界国家，构建中文名到国家代码的映射
  allWorldCountries.forEach(country => {
    if (country.name_zh && country.code) {
      mapping[country.name_zh] = country.code;
    }
  });
  
  return mapping;
}

// 获取中文国家映射（延迟初始化，确保 allWorldCountries 已加载）
function getChineseCountryMapping() {
  if (!window.chineseCountryMappingCache) {
    window.chineseCountryMappingCache = buildChineseCountryMapping();
  }
  return window.chineseCountryMappingCache;
}

const chineseCardMapping = {
  '游戏市场': 'game_market',
  '基础设施': 'infrastructure', 
  '互联网使用': 'mobile_device',
  '文化习俗': 'culture',
  '经济环境': 'economic_environment',
  '付费习惯': 'payment_habits',
  '人口特征': 'demographics',
  '游戏偏好': 'game_preferences',
  '应用使用': 'app_usage',
  '移动支付': 'mobile_payment'
};

// 智能解析中文文件名
function parseChineseFilename(filename) {
  // 移除文件扩展名
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  
  // 获取动态构建的国家映射
  const chineseCountryMapping = getChineseCountryMapping();
  
  // 特殊匹配规则：xxx国社媒→互联网使用，xx国手机→基础设施
  const specialPatterns = [
    { pattern: /(.+)社媒$/, cardType: '互联网使用', cardId: 'mobile_device' },
    { pattern: /(.+)手机$/, cardType: '基础设施', cardId: 'infrastructure' }
  ];
  
  // 检查特殊模式
  for (const { pattern, cardType, cardId } of specialPatterns) {
    const match = nameWithoutExt.match(pattern);
    if (match) {
      const countryNamePart = match[1]; // 提取国家名部分
      const countryCode = chineseCountryMapping[countryNamePart];
      
      if (countryCode) {
        return {
          countryName: countryNamePart,
          countryCode,
          cardType,
          cardId,
          isValid: true
        };
      }
    }
  }
  
  // 支持的分隔符：- _ 空格
  const separators = ['-', '_', ' '];
  let countryName = '';
  let cardType = '';
  
  for (const separator of separators) {
    if (nameWithoutExt.includes(separator)) {
      const parts = nameWithoutExt.split(separator);
      if (parts.length >= 2) {
        countryName = parts[0].trim();
        cardType = parts[1].trim();
        break;
      }
    }
  }
  
  // 如果没有分隔符，尝试智能匹配
  if (!countryName && !cardType) {
    // 尝试找到国家名（按长度排序，优先匹配更长的国家名）
    const sortedCountries = Object.keys(chineseCountryMapping).sort((a, b) => b.length - a.length);
    
    for (const chinese of sortedCountries) {
      if (nameWithoutExt.includes(chinese)) {
        countryName = chinese;
        cardType = nameWithoutExt.replace(chinese, '').trim();
        break;
      }
    }
  }
  
  const countryCode = chineseCountryMapping[countryName];
  const cardId = chineseCardMapping[cardType];
  
  return {
    countryName,
    countryCode,
    cardType,
    cardId,
    isValid: !!(countryCode && cardId)
  };
}

// 初始化批量上传功能
function initBatchUpload() {
  const dropZone = document.getElementById('batch-drop-zone');
  const fileInput = document.getElementById('batch-file-input');
  const selectBtn = document.getElementById('select-files-btn');
  const preview = document.getElementById('batch-preview');
  const previewList = document.getElementById('batch-preview-list');
  const uploadBtn = document.getElementById('batch-upload-btn');
  const cancelBtn = document.getElementById('batch-cancel-btn');
  
  if (!dropZone || !fileInput) return;
  
  // 点击选择文件
  selectBtn.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('click', () => fileInput.click());
  
  // 文件选择事件
  fileInput.addEventListener('change', handleFileSelect);
  
  // 拖拽事件
  dropZone.addEventListener('dragover', handleDragOver);
  dropZone.addEventListener('dragleave', handleDragLeave);
  dropZone.addEventListener('drop', handleDrop);
  
  // 按钮事件
  uploadBtn.addEventListener('click', startBatchUpload);
  cancelBtn.addEventListener('click', cancelBatchUpload);
}

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('dragover');
  const files = Array.from(e.dataTransfer.files);
  processFiles(files);
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  processFiles(files);
}

function processFiles(files) {
  // 过滤图片文件
  const imageFiles = files.filter(file => file.type.startsWith('image/'));
  
  if (imageFiles.length === 0) {
    alert('请选择图片文件！');
    return;
  }
  
  batchFiles = imageFiles.map(file => {
    const parseResult = parseChineseFilename(file.name);
    return {
      file,
      filename: file.name,
      ...parseResult
    };
  });
  
  displayBatchPreview();
}

function displayBatchPreview() {
  const preview = document.getElementById('batch-preview');
  const previewList = document.getElementById('batch-preview-list');
  
  previewList.innerHTML = '';
  
  batchFiles.forEach((item, index) => {
    const previewItem = document.createElement('div');
    previewItem.className = 'batch-preview-item';
    
    // 创建缩略图
    const thumbnail = document.createElement('img');
    thumbnail.className = 'batch-preview-thumbnail';
    thumbnail.src = URL.createObjectURL(item.file);
    
    // 创建信息区域
    const info = document.createElement('div');
    info.className = 'batch-preview-info';
    
    const filename = document.createElement('div');
    filename.className = 'batch-preview-filename';
    filename.textContent = item.filename;
    
    const match = document.createElement('div');
    match.className = `batch-preview-match ${item.isValid ? 'success' : 'error'}`;
    
    if (item.isValid) {
      match.textContent = `✓ ${item.countryName} - ${item.cardType}`;
    } else {
      match.textContent = `✗ 无法识别文件名格式`;
    }
    
    info.appendChild(filename);
    info.appendChild(match);
    previewItem.appendChild(thumbnail);
    previewItem.appendChild(info);
    previewList.appendChild(previewItem);
  });
  
  preview.classList.remove('hidden');
}

async function startBatchUpload() {
  const validFiles = batchFiles.filter(item => item.isValid);
  
  if (validFiles.length === 0) {
    alert('没有可上传的有效文件！');
    return;
  }
  
  const uploadBtn = document.getElementById('batch-upload-btn');
  uploadBtn.textContent = '上传中...';
  uploadBtn.disabled = true;
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const item of validFiles) {
    try {
      // 生成安全的文件名
      const fileExtension = item.file.name.split('.').pop();
      const safeFileName = `${item.cardId}-${Date.now()}.${fileExtension}`;
      const filePath = `${item.countryCode}/${safeFileName}`;
      
      // 上传到 Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('card-images')
        .upload(filePath, item.file, { cacheControl: '3600', upsert: false });
      
      if (uploadError) {
        console.error(`上传失败 ${item.filename}:`, uploadError);
        errorCount++;
        continue;
      }
      
      // 构建图片URL
      const imageUrl = `${supabaseUrl}/storage/v1/object/public/card-images/${filePath}`;
      
      // 保存到数据库
      await saveBatchImageToDatabase(item.countryCode, item.cardId, imageUrl);
      successCount++;
      
    } catch (error) {
      console.error(`处理文件失败 ${item.filename}:`, error);
      errorCount++;
    }
  }
  
  // 显示结果
  alert(`批量上传完成！\n成功: ${successCount} 个\n失败: ${errorCount} 个`);
  
  // 重置界面
  cancelBatchUpload();
}

async function saveBatchImageToDatabase(countryCode, cardId, imageUrl) {
  // 确保国家数据存在
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
  
  // 查找或创建卡片
  let existingCard = countryData[countryCode].cards.find(card => card.id === cardId);
  
  if (existingCard) {
    // 更新现有卡片的图片
    existingCard.imageUrl = imageUrl;
  } else {
    // 创建新卡片
    const cardTitle = Object.keys(chineseCardMapping).find(key => chineseCardMapping[key] === cardId) || cardId;
    countryData[countryCode].cards.push({
      id: cardId,
      title: cardTitle,
      content: '',
      note: '',
      imageUrl: imageUrl
    });
  }
  
  // 保存到 Supabase
  await saveCountryDataToSupabase(countryCode);
}

function cancelBatchUpload() {
  batchFiles = [];
  document.getElementById('batch-preview').classList.add('hidden');
  document.getElementById('batch-file-input').value = '';
  document.getElementById('batch-upload-btn').textContent = '开始批量上传';
  document.getElementById('batch-upload-btn').disabled = false;
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", async function() {
  // 等待认证系统初始化完成
  await new Promise(resolve => {
    if (window.authInitialized) {
      resolve();
    } else {
      const checkAuth = () => {
        if (window.authInitialized) resolve();
        else setTimeout(checkAuth, 100);
      };
      checkAuth();
    }
  });
  
  initAdminPanel();
  initImageModal();
  initBatchUpload();
});

// 拉取所有国家卡片数据（supabase）
async function loadCountryDataFromSupabase() {

    try {
        const { data: countryCardsData, error: countryCardsError } = await supabase
            .from('country_cards')
            .select('country_code, detailAnalysisUrl, pdfs');

        if (countryCardsError) {
            console.error('从 country_cards 表加载数据失败:', countryCardsError);
            return;
        }

        const { data: cardDetailsData, error: cardDetailsError } = await supabase
            .from('country_card_details')
            .select('country_code, card_id, title, content, note, order_index, imageUrl');

        if (cardDetailsError) {
            console.error('从 country_card_details 表加载数据失败:', cardDetailsError);
            return;
        }


        const cardsByCountry = cardDetailsData.reduce((acc, card) => {
            if (!acc[card.country_code]) {
                acc[card.country_code] = [];
            }
            acc[card.country_code].push({
                id: card.card_id,
                title: card.title,
                content: card.content,
                note: card.note,
                order_index: card.order_index,
                imageUrl: card.imageUrl // 确保加载 imageUrl
            });
            return acc;
        }, {});

        countryCardsData.forEach(item => {
            const code = item.country_code;
            // 若初始化数据中不存在该 code（例如 GLOBAL），则创建占位对象
            if (!countryData[code]) {
                countryData[code] = {
                    name: code,
                    name_zh: code === 'GLOBAL' ? '全局' : code,
                    region: 'Global',
                    region_zh: '全局',
                    flagUrl: '',
                    cards: [],
                    detailAnalysisUrl: ''
                };
            }
            countryData[code].detailAnalysisUrl = item.detailAnalysisUrl;
            countryData[code].cards = cardsByCountry[code] ? cardsByCountry[code].sort((a, b) => a.order_index - b.order_index) : [];
            // 同步PDF列表
            countryData[code].pdfs = Array.isArray(item.pdfs) ? item.pdfs : (item.pdfs ? item.pdfs : []);
        });

      // 读取英语水平数据
      const { data: englishRows, error: englishError } = await supabase
          .from('english_proficiency')
          .select('country_code, score, world_rank, level');
      if (englishError) {
          console.error('从 english_proficiency 表加载数据失败:', englishError);
      } else if (Array.isArray(englishRows)) {
          englishRows.forEach(row => {
              const code = (row.country_code || '').toUpperCase();
              if (!countryData[code]) {
                  countryData[code] = {
                      name: code,
                      name_zh: code,
                      region: '',
                      region_zh: '',
                      cards: [],
                      pdfs: [],
                      detailAnalysisUrl: ''
                  };
              }
              countryData[code].englishProficiency = {
                  score: typeof row.score === 'number' ? row.score : null,
                  worldRank: typeof row.world_rank === 'number' ? row.world_rank : null,
                  level: (row.level || '').trim()
              };
          });
      }
    } catch (error) {
        console.error("加载 Supabase 数据时发生错误:", error);
    }
}

// 保存单个国家卡片数据到supabase
async function saveCountryDataToSupabase(country_code) {
  const cards = countryData[country_code].cards;
  const detailAnalysisUrl = countryData[country_code].detailAnalysisUrl || '';

  // 先清空该国家现有的卡片详情
  const { error: deleteError } = await supabase
    .from('country_card_details')
    .delete()
    .eq('country_code', country_code);

  if (deleteError) {
    alert('清空旧卡片数据失败: ' + deleteError.message);
    return;
  }

  // 准备要插入的新卡片数据
  const newCardDetails = cards.map((card, index) => ({
    country_code: country_code,
    card_id: card.id, // 使用 card.id 作为卡片唯一标识
    title: card.title,
    content: card.content,
    note: card.note,
    imageUrl: card.imageUrl || null, // 保存图片URL
    order_index: index // 保存顺序
  }));

  // 批量插入新的卡片详情
  const { error: insertError } = await supabase
    .from('country_card_details')
    .insert(newCardDetails);

  if (insertError) {
    alert('上传新卡片数据失败: ' + insertError.message);
    return;
  }

  // 更新 country_cards 表的 detailAnalysisUrl
  const { error: urlUpdateError } = await supabase
    .from('country_cards')
    .upsert(
      { country_code: country_code, detailAnalysisUrl: detailAnalysisUrl },
      { onConflict: 'country_code' }
    );

  if (urlUpdateError) {
    alert('更新详细分析链接失败: ' + urlUpdateError.message);
  }
}

// 新增导出的初始化函数，统一管理数据加载时序
export async function initDataAndSupabase() {
  initializeCountryData(); // 先初始化本地所有国家数据
  await loadCountryDataFromSupabase(); // 再从Supabase加载数据并覆盖本地数据
}

// 挂载到 window，确保 map.js 能访问
window.updateCountryDetail = updateCountryDetail;

// 页面加载时自动从 supabase 拉取云端数据
// 保证云端数据覆盖本地 countryData


// 模板卡片顺序和标题
const CARD_TEMPLATE_ORDER = [
  { key: 'game_market', title: '游戏市场' },
  { key: 'infrastructure', title: '基础设施' },
  { key: 'mobile_device', title: '互联网使用' },
  { key: 'culture', title: '文化习俗' }
];

// 一键创建模板卡片
function createTemplateCards() {
  const countryCode = document.getElementById('admin-country-select').value;
  if (!countryCode) {
    alert('请先选择一个国家');
    return;
  }
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