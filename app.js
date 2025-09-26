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

  function openPdfViewer(url, title = 'PDF 报告') {
    if (!overlay || !drawer || !frame) return;
    titleEl && (titleEl.textContent = title);
    // 使用官方托管的 PDF.js Viewer，最稳定
    const viewerCdn = 'https://mozilla.github.io/pdf.js/web/viewer.html';
    frame.src = `${viewerCdn}?file=${encodeURIComponent(url)}`;
    overlay.classList.remove('hidden');
    drawer.classList.remove('hidden');
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

  // AI 助手抽屉逻辑（骨架）
  const aiOverlay = document.getElementById('ai-overlay');
  const aiDrawer = document.getElementById('ai-drawer');
  const aiClose = document.getElementById('ai-close');
  const aiSummary = document.getElementById('ai-summary');
  const aiAsk = document.getElementById('ai-ask');
  const aiInput = document.getElementById('ai-question');
  let lastPdfUrl = '';

  function openAiDrawer() {
    if (!aiOverlay || !aiDrawer) return;
    aiOverlay.classList.remove('hidden');
    aiDrawer.classList.remove('hidden');
    aiDrawer.setAttribute('aria-hidden', 'false');
    // 占位：后续填充提取与总结
    if (aiSummary) aiSummary.innerHTML = '<div style="padding:6px 0;">正在分析报告，请稍候…</div>';
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
  aiAsk && aiAsk.addEventListener('click', ()=>{
    if (!aiInput) return;
    const q = aiInput.value.trim();
    if (!q) return;
    if (aiSummary) {
      const p = document.createElement('div');
      p.textContent = 'Q: ' + q;
      aiSummary.appendChild(p);
    }
    aiInput.value = '';
  });

  // ====== AI 阅读：PDF 抽取与总结 (v1) ======
  const edgeUrl = `${supabaseUrl}/functions/v1/deepseek`;
  async function callDeepSeek(prompt) {
    const resp = await fetch(edgeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseAnonKey}` },
      body: JSON.stringify({ prompt, model: 'deepseek-chat', max_tokens: 1200, temperature: 0.4 })
    });
    if (!resp.ok) throw new Error('LLM错误');
    const j = await resp.json();
    const content = j?.data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('LLM返回为空');
    return content;
  }

  async function loadPdfJs() {
    if (window.pdfjsLib) return window.pdfjsLib;
    await import('https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js');
    await import('https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js');
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
      return window.pdfjsLib;
    }
    throw new Error('pdf.js 加载失败');
  }

  async function extractPdfText(url) {
    const pdfjsLib = await loadPdfJs();
    // 优先以 ArrayBuffer 方式加载，规避部分对象存储的 CORS/Range 限制
    let loadingTask;
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) throw new Error('fetch failed');
      const buf = await res.arrayBuffer();
      loadingTask = pdfjsLib.getDocument({ data: buf });
    } catch (e) {
      // 回退使用 url 直连
      loadingTask = pdfjsLib.getDocument({ url });
    }
    const pdf = await loadingTask.promise;
    const pages = [];
    const maxPages = Math.min(pdf.numPages, 80); // 安全上限，过大文档先限制
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const tc = await page.getTextContent();
      const text = tc.items.map(it => it.str).join(' ');
      pages.push({ page: i, text });
    }
    return pages;
  }

  function chunkPages(pages, charsPerChunk = 3500, overlap = 300) {
    const chunks = [];
    let buf = '';
    let start = 1;
    for (const p of pages) {
      const clean = p.text.replace(/\s+/g, ' ').trim();
      if ((buf + ' ' + clean).length > charsPerChunk && buf.length > 0) {
        chunks.push({ from: start, to: p.page - 1, text: buf });
        const tail = buf.slice(-overlap);
        buf = tail + ' ' + clean;
        start = Math.max(start, p.page);
      } else {
        buf = (buf + ' ' + clean).trim();
      }
    }
    if (buf.length) {
      const lastPage = pages.length ? pages[pages.length - 1].page : 1;
      chunks.push({ from: start, to: lastPage, text: buf });
    }
    return chunks.slice(0, 30);
  }

  async function summarizePdf(url) {
    const pages = await extractPdfText(url);
    const chunks = chunkPages(pages);
    const mapResults = [];
    for (const c of chunks) {
      const prompt = `你是一名中文分析师。请基于下列报告片段（第${c.from}-${c.to}页）提炼3-5条要点，保留关键数字、时间、国家/主体名词，每条≤120字。\n返回JSON：{\n  "bullets": ["…", "…"]\n}\n\n片段：\n${c.text}`;
      try {
        const raw = await callDeepSeek(prompt);
        const json = JSON.parse(raw);
        mapResults.push(json.bullets || []);
      } catch (e) {
        mapResults.push([`第${c.from}-${c.to}页摘要失败，原文摘录：` + c.text.slice(0, 120)]);
      }
    }
    const flat = mapResults.flat().slice(0, 60);
    const reducePrompt = `基于这些要点（中文）输出：1) Top 10 要点列表；2) 300~500字结论；返回JSON：{top10:["…"], conclusion:"…"}\n要点：\n${flat.map((b,i)=>`${i+1}. ${b}`).join('\n')}`;
    let summary;
    try {
      const reduceRaw = await callDeepSeek(reducePrompt);
      summary = JSON.parse(reduceRaw);
    } catch {
      summary = { top10: flat.slice(0,10), conclusion: '总结生成失败，请重试。' };
    }
    return summary;
  }

  // 将“帮我读”按钮与总结流程打通
  async function openAiAndSummarize() {
    openAiDrawer();
    try {
      if (!lastPdfUrl) throw new Error('未获取到PDF地址');
      if (aiSummary) aiSummary.innerHTML = '<div>正在提取文本…</div>';
      const summary = await summarizePdf(lastPdfUrl);
      if (aiSummary) {
        aiSummary.innerHTML = '';
        const ul = document.createElement('ul');
        (summary.top10 || []).forEach(t => {
          const li = document.createElement('li'); li.textContent = t; ul.appendChild(li);
        });
        const concl = document.createElement('div');
        concl.style.marginTop = '8px';
        concl.textContent = summary.conclusion || '';
        aiSummary.appendChild(ul); aiSummary.appendChild(concl);
      }
    } catch (e) {
      if (aiSummary) aiSummary.textContent = '分析失败：' + (e?.message || '未知错误');
    }
  }
  btnAiRead && btnAiRead.removeEventListener('click', openAiDrawer);
  btnAiRead && btnAiRead.addEventListener('click', openAiAndSummarize);
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