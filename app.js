import { countryData, regionTranslations, updateCountryDetail, initDataAndSupabase, allWorldCountries } from './data.js';

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
  const titleEl = document.getElementById('pdf-title');

  function openPdfViewer(url, title = 'PDF 报告') {
    if (!overlay || !drawer || !frame) return;
    titleEl && (titleEl.textContent = title);
    frame.src = `/pdfjs/web/viewer.html?file=${encodeURIComponent(url)}`;
    overlay.classList.remove('hidden');
    drawer.classList.remove('hidden');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    btnOpenNew && (btnOpenNew.href = url);
    btnDownload && (btnDownload.href = url);
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