import { countryData, regionTranslations, updateCountryDetail, initDataAndSupabase } from './data.js';

// Main app functionality

// Global variables
let selectedCountryData = null;

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
  // Call map.js function to filter/highlight countries
  if (typeof window.filterMapCountries === 'function') {
    window.filterMapCountries(searchTerm);
  }
}

// Initialize the application
function initApp() {
  console.log("app.js - initApp 函数被调用"); // 新增日志
  // No category filter needed anymore - app is simplified
  console.log("App initialized");

  // Initialize search input
  const searchInput = document.getElementById("country-search");
  if (searchInput) {
    searchInput.addEventListener("input", debounce(handleSearchInput, 300));
  }
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
// document.addEventListener("DOMContentLoaded", initApp);