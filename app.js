import { countryData, regionTranslations, updateCountryDetail, initDataAndSupabase, allWorldCountries } from './data.js';
import { supabaseUrl, supabaseAnonKey } from './supabase.js';

// Main app functionality

// Global variables
let selectedCountryData = null;
const autocompleteResultsContainer = document.getElementById("autocomplete-results");

// Utility function for debouncing
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

// Handle search input
function handleSearchInput(event) {
  const searchTerm = event.target.value.toLowerCase();
  
  if (searchTerm.length > 0) {
    const filteredCountries = allWorldCountries.filter(country => {
      const name = country.name ? country.name.toLowerCase() : '';
      const name_zh = country.name_zh ? country.name_zh.toLowerCase() : '';
      return name.includes(searchTerm) || name_zh.includes(searchTerm);
    });
    displayAutocompleteResults(filteredCountries);
  } else {
    displayAutocompleteResults([]); // Clear results if search term is empty
  }
  
  // Call map.js function to filter/highlight countries
  if (typeof window.filterMapCountries === 'function') {
    window.filterMapCountries(searchTerm);
  }
}

// Display autocomplete results
function displayAutocompleteResults(results) {
  autocompleteResultsContainer.innerHTML = '';
  if (results.length > 0) {
    results.forEach(country => {
      const item = document.createElement('div');
      item.classList.add('autocomplete-item');
      item.textContent = country.name_zh || country.name;
      item.dataset.countryCode = country.code;
      item.dataset.countryName = country.name;
      item.dataset.countryNameZh = country.name_zh; // 存储中文名
      item.addEventListener('click', () => selectAutocompleteItem(country.name, country.code, country.name_zh));
      autocompleteResultsContainer.appendChild(item);
    });
    autocompleteResultsContainer.classList.remove('hidden');
  } else {
    autocompleteResultsContainer.classList.add('hidden');
  }
}

// Select an item from autocomplete
function selectAutocompleteItem(countryName, countryCode, countryNameZh) {
  const searchInput = document.getElementById("country-search");
  // 将全局报告列表按钮移动到搜索区左侧作为悬浮按钮
  const globalBtnHeader = document.getElementById('global-reports-btn');
  const searchSection = document.querySelector('.search-section');
  if (globalBtnHeader && searchSection) {
    try {
      searchSection.appendChild(globalBtnHeader);
      globalBtnHeader.classList.add('floating-reports-btn');
    } catch(_) {}
  }
  searchInput.value = countryNameZh || countryName; // 优先显示中文名
  autocompleteResultsContainer.classList.add('hidden');
  
  // Trigger map functionality
  if (typeof window.filterMapCountries === 'function') {
    window.filterMapCountries(countryName.toLowerCase()); // Use English name for map filter
  }
  
  // Simulate click for detail card (if needed, map.js's filterMapCountries already handles this for single matches)
  // We might need to directly call onCountryClick if filterMapCountries doesn't always trigger it
}

// Initialize the application
function initApp() {
  // 调用数据初始化函数，确保在应用启动时加载 Supabase 数据
  initDataAndSupabase();

  // Initialize search input
  const searchInput = document.getElementById("country-search");
  if (searchInput) {
    searchInput.addEventListener("input", debounce(handleSearchInput, 300));
    
    // Add Enter key search functionality
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const searchTerm = event.target.value.trim().toLowerCase();
        if (searchTerm) {
          // Find the first matching country
          const matchedCountry = allWorldCountries.find(country => {
            const name = country.name ? country.name.toLowerCase() : '';
            const name_zh = country.name_zh ? country.name_zh.toLowerCase() : '';
            return name.includes(searchTerm) || name_zh.includes(searchTerm);
          });
          
          if (matchedCountry) {
            // Select the first match
            selectAutocompleteItem(matchedCountry.name, matchedCountry.code, matchedCountry.name_zh);
          }
        }
      }
    });
    
    // Hide autocomplete results when search input loses focus
    searchInput.addEventListener("blur", () => {
      setTimeout(() => {
        autocompleteResultsContainer.classList.add('hidden');
      }, 150); // Small delay to allow click event on autocomplete item
    });
    // Show autocomplete results again when search input gains focus and has value
    searchInput.addEventListener("focus", (event) => {
      if (event.target.value.length > 0) {
        handleSearchInput(event); // Re-trigger search to show results
      }
    });
  }

  // PDF 抽屉 open/close
  const overlay = document.getElementById('pdf-overlay');
  const drawer = document.getElementById('pdf-drawer');
  const frame = document.getElementById('pdf-frame');
  const btnClose = document.getElementById('pdf-close');
  const btnOpenNew = document.getElementById('pdf-open-new');
  const btnDownload = document.getElementById('pdf-download');
  const btnAiRead = document.getElementById('pdf-ai-read');
  const titleEl = document.getElementById('pdf-title');
  // 全部报告抽屉元素
  const globalBtn = document.getElementById('global-reports-btn');
  const repOverlay = document.getElementById('reports-overlay');
  const repDrawer = document.getElementById('reports-drawer');
  const repClose = document.getElementById('reports-close');
  const repList = document.getElementById('reports-list');

  function openPdfViewer(url, title = 'PDF 报告') {
    if (!overlay || !drawer || !frame) return;
    titleEl && (titleEl.textContent = title);
    // 使用官方托管的 PDF.js Viewer，最稳定
    const viewerCdn = 'https://mozilla.github.io/pdf.js/web/viewer.html';
    frame.src = `${viewerCdn}?file=${encodeURIComponent(url)}`;
    overlay.classList.remove('hidden');
    drawer.classList.remove('hidden');
    // 置顶层级，避免被其他抽屉覆盖
    overlay.style.zIndex = '2000';
    drawer.style.zIndex = '2001';
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    btnOpenNew && (btnOpenNew.href = url);
    btnDownload && (btnDownload.href = url);
    lastPdfUrl = url;
  }

  function closePdfViewer() {
    if (!overlay || !drawer || !frame) return;
    overlay.classList.add('hidden');
    drawer.classList.add('hidden');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    frame.src = '';
  }

  if (overlay && drawer) {
    overlay.addEventListener('click', closePdfViewer);
    btnClose && btnClose.addEventListener('click', closePdfViewer);
  }

  // 暴露给全局（供 data.js 或详情按钮调用）
  window.openPdfViewer = openPdfViewer;
  window.closePdfViewer = closePdfViewer;
  function openReportsDrawer() {
    if (!repOverlay || !repDrawer || !repList) return;
    // 聚合所有国家的报告
    repList.innerHTML = '';
    const all = [];
    Object.keys(countryData || {}).forEach(code => {
      const pdfs = countryData[code]?.pdfs || [];
      pdfs.forEach(p => all.push({ countryCode: code, ...p }));
    });

    // 按报告标题去重合并（同名报告合并为一条，展示关联国家）
    const groups = new Map();
    for (const it of all) {
      const key = (it.title || '').trim();
      if (!groups.has(key)) {
        groups.set(key, { ...it, countries: [it.countryCode] });
      } else {
        const g = groups.get(key);
        if (!g.countries.includes(it.countryCode)) g.countries.push(it.countryCode);
        if (!g.summaryCard && it.summaryCard) g.summaryCard = it.summaryCard;
        if (!g.url && it.url) g.url = it.url;
      }
    }
    const merged = Array.from(groups.values());

    if (merged.length === 0) {
      const tip = document.createElement('div');
      tip.textContent = '暂无任何报告';
      tip.style.padding = '10px';
      repList.appendChild(tip);
    } else {
      merged.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = 'report-item';
        const headerRow = document.createElement('div');
        headerRow.className = 'report-row';
        const tt = document.createElement('div');
        tt.className = 'report-title';
        const countryNames = (item.countries || [item.countryCode])
          .map(c => (countryData[c]?.name_zh) || c)
          .filter(Boolean)
          .join('、');
        const cname = countryNames ? `（${countryNames}）` : '';
        tt.textContent = (item.title || `报告${idx+1}`) + cname;
        const action = document.createElement('span');
        action.className = 'report-action';
        action.textContent = '阅读';
        headerRow.appendChild(tt);
        headerRow.appendChild(action);
        const open = () => {
          const cc = (item.countries && item.countries[0]) || item.countryCode;
          window.currentReportMeta = { countryCode: cc, ...item };
          openPdfViewer(item.url, item.title || 'PDF 报告');
        };
        headerRow.addEventListener('click', open);
        card.appendChild(headerRow);
        if (item.summaryCard) {
          const sum = document.createElement('div');
          sum.className = 'report-summary';
          sum.textContent = item.summaryCard;
          sum.addEventListener('click', open);
          card.appendChild(sum);
        }
        repList.appendChild(card);
      });
    }
    repOverlay.classList.remove('hidden');
    repDrawer.classList.remove('hidden');
    repDrawer.setAttribute('aria-hidden','false');
  }
  function closeReportsDrawer() {
    if (!repOverlay || !repDrawer) return;
    repOverlay.classList.add('hidden');
    repDrawer.classList.add('hidden');
    repDrawer.setAttribute('aria-hidden','true');
  }
  globalBtn && globalBtn.addEventListener('click', openReportsDrawer);
  repOverlay && repOverlay.addEventListener('click', closeReportsDrawer);
  repClose && repClose.addEventListener('click', closeReportsDrawer);

  // 报告摘要抽屉逻辑（只读展示，内容来自数据库）
  const aiOverlay = document.getElementById('ai-overlay');
  const aiDrawer = document.getElementById('ai-drawer');
  const aiClose = document.getElementById('ai-close');
  const aiSummary = document.getElementById('ai-summary');
  let lastPdfUrl = '';

  function openAiDrawer() {
    if (!aiOverlay || !aiDrawer) return;
    aiOverlay.classList.remove('hidden');
    aiDrawer.classList.remove('hidden');
    aiDrawer.setAttribute('aria-hidden', 'false');
    // 置顶摘要抽屉，确保不被 PDF/报告列表覆盖
    aiOverlay.style.zIndex = '2500';
    aiDrawer.style.zIndex = '2501';
    // 打开时从内存数据加载当前报告摘要（由后台维护）
    try {
      const meta = window.currentReportMeta || {};
      const code = (meta.countryCode || '').toUpperCase();
      const url = meta.url || lastPdfUrl || '';
      const list = (countryData && countryData[code] && Array.isArray(countryData[code].pdfs)) ? countryData[code].pdfs : [];
      const found = list.find(p => p.url === url);
      if (aiSummary) aiSummary.innerText = (found && found.summaryReader) ? found.summaryReader : '';
    } catch (_) {
      if (aiSummary) aiSummary.innerText = '';
    }
  }
  function closeAiDrawer() {
    if (!aiOverlay || !aiDrawer) return;
    aiOverlay.classList.add('hidden');
    aiDrawer.classList.add('hidden');
    aiDrawer.setAttribute('aria-hidden', 'true');
  }
  aiOverlay && aiOverlay.addEventListener('click', closeAiDrawer);
  aiClose && aiClose.addEventListener('click', closeAiDrawer);
  btnAiRead && btnAiRead.addEventListener('click', openAiDrawer);
  // 导出到全局（供其他模块触发打开）
  window.openAiDrawer = openAiDrawer;

  // “帮我读”仅打开摘要抽屉（无AI调用）
  btnAiRead && btnAiRead.addEventListener('click', openAiDrawer);
}

// Handle country click event (to be called from map.js)
function onCountryClick(countryName, countryCode) {
  // Store selected country data
  selectedCountryData = countryData[countryCode];
  
  // Update country detail panel
  if (typeof window.updateCountryDetail === 'function') {
    window.updateCountryDetail(countryName, countryCode);
  } else {
    alert('国家详情弹窗函数未加载，请刷新页面或检查脚本顺序');
  }
}

// 挂载到 window，确保 map.js 能访问
window.onCountryClick = onCountryClick;
window.initApp = initApp; // 挂载 initApp 到 window，确保 map.js 可以调用它

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initApp);