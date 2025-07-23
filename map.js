// Map configuration
const mapConfig = {
  width: 960,
  height: 500,
  scale: 150,
  minZoom: 1,
  maxZoom: 8,
  initialScale: 150,
  initialTranslate: [480, 250]
};

// Map variables
let svg, g, path, zoom, countries;
let currentZoom = { k: 1, x: 0, y: 0 };
let selectedCountry = null;

// Initialize the map
function initMap() {
  // Set up SVG container
  svg = d3.select("#world-map")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${mapConfig.width} ${mapConfig.height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  // Create a group for map elements
  g = svg.append("g");

  // Define the projection (Mercator)
  const projection = d3.geoMercator()
    .scale(mapConfig.scale)
    .translate([mapConfig.width / 2, mapConfig.height / 2]);

  // Define the path generator
  path = d3.geoPath().projection(projection);

  // Set up zoom behavior
  zoom = d3.zoom()
    .scaleExtent([mapConfig.minZoom, mapConfig.maxZoom])
    .on("zoom", handleZoom);

  // Apply zoom to SVG
  svg.call(zoom);

  // Initial positioning
  // 初始状态直接重置，与resetZoom一致
  svg.call(zoom.transform, d3.zoomIdentity);

  // Load and display the world map
  loadWorldMap();

  // Set up reset button
  d3.select("#reset-zoom").on("click", resetZoom);
}

// Load the world map data
function loadWorldMap() {
  // Load world map data (TopoJSON)
  d3.json("https://unpkg.com/world-atlas@2/countries-110m.json")
    .then(data => {
      // Convert TopoJSON to GeoJSON
      const worldData = topojson.feature(data, data.objects.countries);
      
      // Draw countries
      countries = g.selectAll(".country")
        .data(worldData.features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("data-id", d => d.id)
        .attr("data-name", d => d.properties.name)
        .on("click", handleCountryClick);
    })
    .catch(error => {
      console.error("Error loading map data:", error);
    });
}

// Handle zoom events
function handleZoom(event) {
  // Store current zoom state
  currentZoom = event.transform;
  
  // Apply transformation to the map group
  g.attr("transform", event.transform);
}

// Reset the zoom to initial state
function resetZoom() {
  svg.transition()
    .duration(750)
    .call(zoom.transform, d3.zoomIdentity);
    
  // Reset the selected country
  if (selectedCountry) {
    d3.select(selectedCountry).classed("selected", false);
    selectedCountry = null;
  }
  
  // Hide country detail panel
  d3.select("#country-detail").classed("hidden", true);
}

// Zoom to a specific country
function zoomToCountry(d) {
  // Get the country's bounds
  const bounds = path.bounds(d);
  const dx = bounds[1][0] - bounds[0][0];
  const dy = bounds[1][1] - bounds[0][1];
  const x = (bounds[0][0] + bounds[1][0]) / 2;
  const y = (bounds[0][1] + bounds[1][1]) / 2;
  
  // Calculate the appropriate scale
  const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / mapConfig.width, dy / mapConfig.height)));
  
  // Calculate the transform
  const translate = [mapConfig.width / 2 - scale * x, mapConfig.height / 2 - scale * y];
  
  // Apply the zoom transformation
  svg.transition()
    .duration(750)
    .call(
      zoom.transform,
      d3.zoomIdentity
        .translate(translate[0], translate[1])
        .scale(scale)
    );
}

// Handle country click events
function handleCountryClick(event, d) {
  // Prevent default behavior
  event.stopPropagation();
  
  // Reset previous selection
  if (selectedCountry) {
    d3.select(selectedCountry).classed("selected", false);
  }
  
  // Set new selection
  selectedCountry = this;
  d3.select(this).classed("selected", true);
  
  // Zoom to the selected country
  zoomToCountry(d);
  
  // Get country name
  const countryName = d.properties.name;
  const countryCode = getCountryCode(countryName);
  
  // Update country detail panel
  if (typeof window.updateCountryDetail === 'function') {
    window.updateCountryDetail(countryName, countryCode);
  } else {
    alert('国家详情弹窗函数未加载，请刷新页面或检查脚本顺序');
  }
}

// Get country code from country name
function getCountryCode(countryName) {
  // Expanded mapping for demo purposes
  const countryMapping = {
    // 英文国家名映射
    "United States of America": "US",
    "United States": "US",
    "United Kingdom": "GB",
    "Germany": "DE",
    "France": "FR",
    "Japan": "JP",
    "China": "CN",
    "India": "IN",
    "Brazil": "BR",
    "Russia": "RU",
    "Australia": "AU",
    "Canada": "CA",
    "Spain": "ES",
    "Italy": "IT",
    "South Korea": "KR",
    "Mexico": "MX",
    "Argentina": "AR",
    "Chile": "CL",
    "Colombia": "CO",
    "Peru": "PE",
    "Venezuela": "VE",
    "Netherlands": "NL",
    "Belgium": "BE",
    "Switzerland": "CH",
    "Austria": "AT",
    "Sweden": "SE",
    "Norway": "NO",
    "Denmark": "DK",
    "Finland": "FI",
    "Poland": "PL",
    "Czech Republic": "CZ",
    "Hungary": "HU",
    "Romania": "RO",
    "Ukraine": "UA",
    "Turkey": "TR",
    "Egypt": "EG",
    "South Africa": "ZA",
    "Nigeria": "NG",
    "Kenya": "KE",
    "Morocco": "MA",
    "Algeria": "DZ",
    "Tunisia": "TN",
    "Saudi Arabia": "SA",
    "United Arab Emirates": "AE",
    "Israel": "IL",
    "Iran": "IR",
    "Iraq": "IQ",
    "Afghanistan": "AF",
    "Pakistan": "PK",
    "Bangladesh": "BD",
    "Sri Lanka": "LK",
    "Myanmar": "MM",
    "Thailand": "TH",
    "Vietnam": "VN",
    "Cambodia": "KH",
    "Laos": "LA",
    "Malaysia": "MY",
    "Singapore": "SG",
    "Indonesia": "ID",
    "Philippines": "PH",
    "Taiwan": "TW",
    "Hong Kong": "HK",
    "Mongolia": "MN",
    "Kazakhstan": "KZ",
    "Uzbekistan": "UZ",
    
    // 中文国家名映射 - 完整版本
    "美国": "US",
    "英国": "GB", 
    "德国": "DE",
    "法国": "FR",
    "日本": "JP",
    "中国": "CN",
    "印度": "IN",
    "巴西": "BR",
    "俄罗斯": "RU",
    "澳大利亚": "AU",
    "加拿大": "CA",
    "西班牙": "ES",
    "意大利": "IT",
    "韩国": "KR",
    "南韩": "KR",
    "墨西哥": "MX",
    "阿根廷": "AR",
    "智利": "CL",
    "哥伦比亚": "CO",
    "秘鲁": "PE",
    "委内瑞拉": "VE",
    "荷兰": "NL",
    "比利时": "BE",
    "瑞士": "CH",
    "奥地利": "AT",
    "瑞典": "SE",
    "挪威": "NO",
    "丹麦": "DK",
    "芬兰": "FI",
    "波兰": "PL",
    "捷克共和国": "CZ",
    "捷克": "CZ",
    "匈牙利": "HU",
    "罗马尼亚": "RO",
    "乌克兰": "UA",
    "土耳其": "TR",
    "埃及": "EG",
    "南非": "ZA",
    "尼日利亚": "NG",
    "肯尼亚": "KE",
    "摩洛哥": "MA",
    "阿尔及利亚": "DZ",
    "突尼斯": "TN",
    "沙特阿拉伯": "SA",
    "阿拉伯联合酋长国": "AE",
    "阿联酋": "AE",
    "以色列": "IL",
    "伊朗": "IR",
    "伊拉克": "IQ",
    "阿富汗": "AF",
    "巴基斯坦": "PK",
    "孟加拉国": "BD",
    "斯里兰卡": "LK",
    "缅甸": "MM",
    "泰国": "TH",
    "越南": "VN",
    "柬埔寨": "KH",
    "老挝": "LA",
    "马来西亚": "MY",
    "新加坡": "SG",
    "印度尼西亚": "ID",
    "印尼": "ID",
    "菲律宾": "PH",
    "台湾": "TW",
    "中国台湾": "TW",
    "香港": "HK",
    "中国香港": "HK",
    "蒙古": "MN",
    "蒙古国": "MN",
    "哈萨克斯坦": "KZ",
    "乌兹别克斯坦": "UZ",
    "新西兰": "NZ",
    "葡萄牙": "PT",
    "希腊": "GR",
    "爱尔兰": "IE",
    "冰岛": "IS",
    "卢森堡": "LU",
    "摩纳哥": "MC",
    "安道尔": "AD",
    "列支敦士登": "LI",
    "圣马力诺": "SM",
    "梵蒂冈": "VA",
    "马耳他": "MT",
    "塞浦路斯": "CY",
    "保加利亚": "BG",
    "克罗地亚": "HR",
    "塞尔维亚": "RS",
    "波黑": "BA",
    "波斯尼亚和黑塞哥维那": "BA",
    "黑山": "ME",
    "北马其顿": "MK",
    "阿尔巴尼亚": "AL",
    "科索沃": "XK",
    "摩尔多瓦": "MD",
    "白俄罗斯": "BY",
    "立陶宛": "LT",
    "拉脱维亚": "LV",
    "爱沙尼亚": "EE",
    "斯洛伐克": "SK",
    "斯洛文尼亚": "SI",
    "格鲁吉亚": "GE",
    "亚美尼亚": "AM",
    "阿塞拜疆": "AZ",
    "吉尔吉斯斯坦": "KG",
    "塔吉克斯坦": "TJ",
    "土库曼斯坦": "TM",
    "朝鲜": "KP",
    "尼泊尔": "NP",
    "不丹": "BT",
    "马尔代夫": "MV",
    "文莱": "BN",
    "东帝汶": "TL",
    "巴布亚新几内亚": "PG",
    "斐济": "FJ",
    "瓦努阿图": "VU",
    "所罗门群岛": "SB",
    "汤加": "TO",
    "萨摩亚": "WS",
    "基里巴斯": "KI",
    "图瓦卢": "TV",
    "瑙鲁": "NR",
    "帕劳": "PW",
    "密克罗尼西亚": "FM",
    "马绍尔群岛": "MH",
    "利比亚": "LY",
    "苏丹": "SD",
    "南苏丹": "SS",
    "埃塞俄比亚": "ET",
    "厄立特里亚": "ER",
    "吉布提": "DJ",
    "索马里": "SO",
    "乌干达": "UG",
    "坦桑尼亚": "TZ",
    "卢旺达": "RW",
    "布隆迪": "BI",
    "刚果民主共和国": "CD",
    "刚果共和国": "CG",
    "中非共和国": "CF",
    "乍得": "TD",
    "喀麦隆": "CM",
    "赤道几内亚": "GQ",
    "加蓬": "GA",
    "圣多美和普林西比": "ST",
    "安哥拉": "AO",
    "赞比亚": "ZM",
    "津巴布韦": "ZW",
    "博茨瓦纳": "BW",
    "纳米比亚": "NA",
    "南非": "ZA",
    "莱索托": "LS",
    "斯威士兰": "SZ",
    "马达加斯加": "MG",
    "毛里求斯": "MU",
    "塞舌尔": "SC",
    "科摩罗": "KM",
    "马里": "ML",
    "布基纳法索": "BF",
    "尼日尔": "NE",
    "象牙海岸": "CI",
    "科特迪瓦": "CI",
    "加纳": "GH",
    "多哥": "TG",
    "贝宁": "BJ",
    "塞内加尔": "SN",
    "冈比亚": "GM",
    "几内亚比绍": "GW",
    "几内亚": "GN",
    "塞拉利昂": "SL",
    "利比里亚": "LR",
    "佛得角": "CV",
    "毛里塔尼亚": "MR",
    "西撒哈拉": "EH",
    "约旦": "JO",
    "黎巴嫩": "LB",
    "叙利亚": "SY",
    "也门": "YE",
    "阿曼": "OM",
    "卡塔尔": "QA",
    "巴林": "BH",
    "科威特": "KW"
  };
  
  return countryMapping[countryName] || countryName; // Return the actual country name if not found in mapping
}

// Initialize the map when DOM is ready
document.addEventListener("DOMContentLoaded", initMap);

// 全屏按钮事件
const fullscreenBtn = document.getElementById('fullscreen-btn');
if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', function() {
    document.body.classList.toggle('fullscreen');
    if (document.body.classList.contains('fullscreen')) {
      fullscreenBtn.textContent = '退出全屏';
    } else {
      fullscreenBtn.textContent = '全屏';
    }
  });
}

// 夜间模式按钮事件
const nightBtn = document.getElementById('night-mode-btn');
if (nightBtn) {
  nightBtn.addEventListener('click', function() {
    document.body.classList.toggle('night-mode');
    nightBtn.textContent = document.body.classList.contains('night-mode') ? '日间模式' : '夜间模式';
  });
}

// ===== 国家搜索功能 =====
const searchToggleBtn = document.getElementById('search-toggle-btn');
const searchBox = document.getElementById('country-search-box');
const searchInput = document.getElementById('country-search-input');
const searchSuggest = document.getElementById('country-search-suggest');
let searchActiveIndex = -1;
let searchResults = [];

if (searchToggleBtn && searchBox && searchInput && searchSuggest) {
  searchToggleBtn.addEventListener('click', () => {
    searchBox.classList.toggle('hidden');
    searchInput.value = '';
    searchSuggest.innerHTML = '';
    searchActiveIndex = -1;
    if (!searchBox.classList.contains('hidden')) {
      setTimeout(() => searchInput.focus(), 100);
    }
  });

  // 搜索联想逻辑
  searchInput.addEventListener('input', function() {
    const val = this.value.trim().toLowerCase();
    if (!val) {
      searchSuggest.innerHTML = '';
      searchResults = [];
      return;
    }
    // 支持拼音、中文、英文模糊匹配
    searchResults = (window.allWorldCountries || []).filter(c => {
      return (
        c.name_zh && c.name_zh.includes(val)
        || c.name && c.name.toLowerCase().includes(val)
        || (c.pinyin && c.pinyin.includes(val))
      );
    });
    // 兼容无拼音字段时只用中英文
    if (!searchResults.length) {
      searchResults = (window.allWorldCountries || []).filter(c => {
        return (
          (c.name_zh && c.name_zh.toLowerCase().includes(val))
          || (c.name && c.name.toLowerCase().includes(val))
        );
      });
    }
    searchSuggest.innerHTML = searchResults.slice(0, 10).map((c, i) =>
      `<li data-index="${i}">${c.name_zh || ''} ${c.name ? '(' + c.name + ')' : ''}</li>`
    ).join('');
    searchActiveIndex = -1;
  });

  // 下拉选中与键盘事件
  searchInput.addEventListener('keydown', function(e) {
    const items = searchSuggest.querySelectorAll('li');
    if (!items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      searchActiveIndex = (searchActiveIndex + 1) % items.length;
      items.forEach((li, idx) => li.classList.toggle('active', idx === searchActiveIndex));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      searchActiveIndex = (searchActiveIndex - 1 + items.length) % items.length;
      items.forEach((li, idx) => li.classList.toggle('active', idx === searchActiveIndex));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchActiveIndex >= 0 && searchResults[searchActiveIndex]) {
        selectCountry(searchResults[searchActiveIndex]);
      } else if (searchResults.length) {
        selectCountry(searchResults[0]);
      }
    }
  });
  searchSuggest.addEventListener('mousedown', function(e) {
    if (e.target.tagName === 'LI') {
      const idx = +e.target.dataset.index;
      if (searchResults[idx]) {
        selectCountry(searchResults[idx]);
      }
    }
  });
}

function selectCountry(country) {
  if (!country) return;
  // 1. 地图高亮并缩放到该国家
  if (window.zoomToCountry && typeof window.zoomToCountry === 'function') {
    // 需要找到地图数据中的d对象
    const svg = document.getElementById('world-map');
    if (svg) {
      const paths = svg.querySelectorAll('.country');
      for (const p of paths) {
        if (p.getAttribute('data-name') === country.name) {
          // 触发地图点击事件
          p.dispatchEvent(new MouseEvent('click', {bubbles:true}));
          break;
        }
      }
    }
  }
  // 2. 关闭搜索框
  if (searchBox) searchBox.classList.add('hidden');
  if (searchInput) searchInput.value = '';
  if (searchSuggest) searchSuggest.innerHTML = '';
}