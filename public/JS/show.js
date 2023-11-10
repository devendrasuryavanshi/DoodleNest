// Microsoft Maps
let MAP_API = mapApi;
let MAP_LOCATION = mapLocation;
let MAP_TITLE = mapTitle;
let map;

// Map style configuration
const myStyle = {
  "elements": {
    aerial: true,
    "settings": { "landColor": "#D3EDDB" },
    "water": { "fillColor": "#B3E6F4" },
    "waterPoint": { "iconColor": "#5B9FAF" },
    "transportation": { "strokeColor": "#ffffff" },
    "road": { "fillColor": "#ffffff" },
    "railway": { "strokeColor": "#85A8D5" },
    "structure": { "fillColor": "#F8F4F1" },
    "runway": { "fillColor": "#ff7fed" },
    "area": { "fillColor": "#F0F2F4" },
    "political": { "borderStrokeColor": "#000000", "borderOutlineColor": "transparent" },
    "point": { "iconColor": "#ffffff", "fillColor": "#000000", "strokeColor": "#ff0000" },
    "transit": { "fillColor": "transparent" }
  },
  "version": "1.0" 
};

// Function to initialize and display the map
async function GetMap() {
  await Microsoft.Maps.loadModule('Microsoft.Maps.Search', () => {
    const searchManager = new Microsoft.Maps.Search.SearchManager(map);

    searchManager.geocode({
      where: MAP_LOCATION,
      callback: (result) => {
        if (result && result.results && result.results.length > 0) {
          const location = result.results[0].location;
          map.setView({ center: location, zoom: 14 });

          // Custom icon URL for the pushpin
          const customIconUrl = 'https://cdn-icons-png.flaticon.com/512/5193/5193714.png';

          // Create a pushpin with a custom icon
          const pushpin = new Microsoft.Maps.Pushpin(location, {
            icon: customIconUrl,
            iconSize: new Microsoft.Maps.Size(60, 60),
          });

          // Create an Infobox for the popup
          const infobox = new Microsoft.Maps.Infobox(location, {
            title: MAP_TITLE,
            description: 'Exact location will be provided after booking',
            visible: false,
            offset: new Microsoft.Maps.Point(0, 30)
          });

          Microsoft.Maps.Events.addHandler(pushpin, 'click', () => {    
            infobox.setOptions({ visible: true });
          });

          map.entities.push(infobox);
          map.entities.push(pushpin);
        } else {
          alert('Location not found');
        }
      }
    });
  });

  map = new Microsoft.Maps.Map('#myMap', {
    credentials: MAP_API,
    center: new Microsoft.Maps.Location(28.6139, 77.2090), // Center the map at a specific location
    zoom: 14, // Set the initial zoom level
    customMapStyle: myStyle,
    showMapTypeSelector: false,
  });
}

// ----------------------------------------------------------------------------
// Delete Warning Popup

function del_popup() {
  try {
    // Event listener for delete button
    document.querySelector(".del").addEventListener("click", () => {
      // Disable elements
      const disabledElements = document.querySelectorAll(".disabled-element");
      for (const element of disabledElements) {
        element.setAttribute("disabled", "true"); // Disable buttons
        element.classList.add("disabled"); // Add a disabled class for styling
      }
      
      // Add opacity class to elements
      const del_el = document.querySelectorAll(".del-opacity");
      del_el.forEach((element) => {
        element.classList.add("opacity_el");
      });
      
      // Show the delete confirmation popup
      document.querySelector(".del_div").style.visibility = "visible";
    });
    
    // Event listener for cancel button in the popup
    document.querySelector(".cancel").addEventListener("click", () => {
      // Enable elements
      const disabledElements = document.querySelectorAll(".disabled-element");
      for (const element of disabledElements) {
        element.removeAttribute("disabled"); // Enable buttons
        element.classList.remove("disabled"); // Remove the disabled class
      };
      
      // Remove opacity class from elements
      const del_el = document.querySelectorAll(".del-opacity");
      del_el.forEach((element) => {
        element.classList.remove("opacity_el");
      });
      
      // Hide the delete confirmation popup
      document.querySelector(".del_div").style.visibility = "hidden";
    });
  } catch(err) {
    // Handle errors
  }
}

// Call the delete_popup function
del_popup();
// ----------------------------------------------------------------------------
