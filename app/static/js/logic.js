// GOAL: RENDER A BASIC BASE MAP - set up Leaflet correctly
// Fetch the data to plot


// Helper Functions

// Custom named function
function chooseColor(borough) {
  let color = "black";

  // Switch on borough name
  if (borough === "Brooklyn") {
    color = "yellow";
  } else if (borough === "Bronx") {
    color = "red";
  } else if (borough === "Manhattan") {
    color = "orange";
  } else if (borough === "Queens") {
    color = "green";
  } else if (borough === "Staten Island") {
    color = "purple";
  } else {
    color = "black";
  }

  // return color
  return (color);
}

function createMap(data, geo_data) {
  // STEP 1: Init the Base Layers

  // Define variables for our tile layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Step 2: Create the Overlay layers
  let markers = L.markerClusterGroup();
  let heatArray = [];

  for (let i = 0; i < data.length; i++){
    let row = data[i];
    let location = row.location;

    // create marker
    if (location) {
      // extract coord
      let point = [location.coordinates[1], location.coordinates[0]];

      // make marker
      let marker = L.marker(point);
      let popup = `<h1>${row.incident_address}</h1><hr><h2>${row.borough}</h2><hr><h3>${row.descriptor} | ${row.created_date}</h3>`;
      marker.bindPopup(popup);
      markers.addLayer(marker);

      // add to heatmap
      heatArray.push(point);
    }
  }

  // create layer
  let heatLayer = L.heatLayer(heatArray, {
    radius: 25,
    blur: 20
  });

  // create the GEOJSON layer
  let geo_layer = L.geoJSON(geo_data, {
    style: function (feature) {
      return {
        color: "black",
        fillColor: chooseColor(feature.properties.borough),
        fillOpacity: 0.5,
        weight: 1.5
      }
    },
    onEachFeature: function (feature, layer) {
      // Set the mouse events to change the map styling.
      layer.on({
        // When a user's mouse cursor touches a map feature, the mouseover event calls this function, which makes that feature's opacity change to 90% so that it stands out.
        mouseover: function (event) {
          layer = event.target;
          layer.setStyle({
            fillOpacity: 0.9
          });
        },
        // When the cursor no longer hovers over a map feature (that is, when the mouseout event occurs), the feature's opacity reverts back to 50%.
        mouseout: function (event) {
          layer = event.target;
          layer.setStyle({
            fillOpacity: 0.5
          });
        },
        // When a feature (neighborhood) is clicked, it enlarges to fit the screen.
        click: function (event) {
          myMap.fitBounds(event.target.getBounds());
        }
      });

      if ((feature.properties) && (feature.properties.neighborhood) && (feature.properties.borough)) {
        let popup = `<h1>${feature.properties.neighborhood}</h1><hr><h3>${feature.properties.borough}</h3>`;
        layer.bindPopup(popup);
      }
    }
  });

  // Step 3: BUILD the Layer Controls

  // Only one base layer can be shown at a time.
  let baseLayers = {
    Street: street,
    Topography: topo
  };

  let overlayLayers = {
    Markers: markers,
    Heatmap: heatLayer,
    Boroughs: geo_layer
  }

  // Step 4: INIT the Map
  let myMap = L.map("map", {
    center: [40.7128, -74.0059],
    zoom: 11,
    layers: [street, geo_layer, markers]
  });


  // Step 5: Add the Layer Control filter + legends as needed
  L.control.layers(baseLayers, overlayLayers).addTo(myMap);

}

function doWork() {
  let user_inp = "Noise";

  // Store the API query variables.
  // For docs, refer to https://dev.socrata.com/docs/queries/where.html.
  // And, refer to https://dev.socrata.com/foundry/data.cityofnewyork.us/erm2-nwe9.
  let baseURL = "https://data.cityofnewyork.us/resource/fhrw-4uyv.json?";
  // Add the dates in the ISO formats
  let date = "$where=created_date between'2023-01-01T00:00:00' and '2024-01-01T00:00:00'";
  // Add the complaint type.
  let complaint = `&complaint_type=${user_inp}`;
  // Add a limit.
  let limit = "&$limit=10000";

  // Assemble the API query URL.
  let url = baseURL + date + complaint + limit;
  let url2 = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/15-Mapping-Web/nyc.geojson";

  // make TWO requests
  d3.json(url).then(function (data) {
    d3.json(url2).then(function (geo_data) {
      createMap(data, geo_data);
    });
  });
}

doWork();





///////////////////////////////////////////////////////


// // Creating the map object
// let myMap = L.map("map", {
//   center: [40.7, -73.95],
//   zoom: 11
// });

// // Adding the tile layer
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(myMap);

// // To do:

// // Store the API query variables.
// // For docs, refer to https://dev.socrata.com/docs/queries/where.html.
// // And, refer to https://dev.socrata.com/foundry/data.cityofnewyork.us/erm2-nwe9.
// let baseURL = "https://data.cityofnewyork.us/resource/fhrw-4uyv.json?";
// // Add the dates in the ISO formats
// let date = "$where=created_date between '' and ''";
// // Add the complaint type.
// let complaint = "&complaint_type=";
// // Add a limit.
// let limit = "&$limit=";

// // Assemble the API query URL.
// let url = baseURL + date + complaint + limit;

// // Get the data with d3.

//   // Create a new marker cluster group.

//   // Loop through the data.

//     // Set the data location property to a variable.

//     // Check for the location property.

//       // Add a new marker to the cluster group, and bind a popup.

//   // Add our marker cluster layer to the map.
