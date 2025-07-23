# World Map Dashboard for Google Play Top Charts

This project displays the real-time Google Play free chart top 10 apps for different countries on an interactive world map. It allows users to drill down into country-specific data and includes an admin panel for managing the displayed data.

## Project Structure

- `index.html` - Main entry point containing the dashboard structure
- `styles.css` - CSS styling for the dashboard
- `map.js` - D3.js-based interactive world map implementation
- `data.js` - Mock data for Google Play store rankings and data management functions
- `app.js` - Main application logic for integrating the map and data components

## Features

- Interactive world map with zoom and pan functionality
- Country selection to view country-specific app rankings
- App details display with icons, ratings, and download counts
- Category filtering for app rankings
- Admin panel for editing country-specific app data

## Libraries Used

- D3.js v7 - For interactive map visualization
- TopoJSON - For map data conversion and rendering

## Development Notes

### Map Functionality
The map uses D3.js for rendering and interaction. Key functions include:
- `initMap()` - Sets up the SVG and map components
- `loadWorldMap()` - Loads and displays the world map data
- `handleZoom()` - Manages zoom and pan behaviors
- `zoomToCountry()` - Zooms to a specific country when clicked

### Data Management
The application uses a mock data structure for demonstration purposes:
- `appStoreData` - Contains country-specific app rankings
- `getCountryData()` - Retrieves app data for a specific country
- `updateCountryDetail()` - Updates the UI with country-specific app data

### Admin Panel
The admin panel allows for editing app data:
- `initAdminPanel()` - Sets up the admin panel functionality
- `populateAppEditor()` - Populates the editor with country-specific app data
- `saveAppData()` - Saves changes made in the admin panel

## Planned Improvements

- Add real API integration for live Google Play store data
- Implement user authentication for admin panel
- Add data visualization for app rankings trends
- Improve mobile responsiveness
- Add offline support with local storage