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
  updateCountryDetail(countryName, countryCode);
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initApp);