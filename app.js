// Main app functionality

// Global variables
let selectedCountryData = null;

// Initialize the application
function initApp() {
  // No category filter needed anymore - app is simplified
  console.log("App initialized");
}

// Handle country click event (to be called from map.js)
function onCountryClick(countryName, countryCode) {
  // Store selected country data
  selectedCountryData = getCountryData(countryCode);
  
  // Update country detail panel
  if (typeof window.updateCountryDetail === 'function') {
    window.updateCountryDetail(countryName, countryCode);
  } else {
    alert('国家详情弹窗函数未加载，请刷新页面或检查脚本顺序');
  }
}

// 挂载到 window，确保 map.js 能访问
window.onCountryClick = onCountryClick;

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initApp);