// The query URL to USGS (United States Geological Survey) GeoJSON feed for all earthquakes in past 24
let queryURL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

// Perform a GET request to the query URL
d3.json(queryURL).then(function (data) {
    console.log(data);
    // Once we get a response, send the data.features object to the 'createFeatures function
    createFeatures(data.features);
});

function markerSize(magnitude) {
    return magnitude * 4000;
  };

function chooseColor(depth) {
    switch(true) {
      case depth > 90:
        return "red";
      case depth > 70:
        return "orangered";
      case depth > 50:
        return "orange";
      case depth > 30:
        return "gold";
      case depth > 10:
        return "yellow";
      default:
        return "green";
    }
  }

function createFeatures(earthquakeData) {

    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h2>Location: ${feature.properties.place}</h2><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
  }

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
    // Point to layer used to alter markers
        pointToLayer: function(feature, latlng) {

        // Determine the style of markers based on properties
        let markers = {
            radius: markerSize(feature.properties.mag*5),
            fillColor: chooseColor(feature.geometry.coordinates[2]),
            fillOpacity: .45,
            color: "black",
            stroke: true,
            weight: 0.75
      } 
      return L.circle(latlng,markers);
    }
  });

    // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap (earthquakes) {

    // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [36.0, -1.6],
    zoom: 2,
    layers: [street, earthquakes]
  });

// Add legend
let legend = L.control({position: "bottomright"});
legend.onAdd = function() {
  let div = L.DomUtil.create("div", "info legend"),
  depth = [-10, 10, 30, 50, 70, 90];

  div.innerHTML += "<h3 style='text-align: center'>Depth</h3>"

  for (var i = 0; i < depth.length; i++) {
    div.innerHTML +=
    '<i style="background:' + chooseColor(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
  }
  return div;
};
legend.addTo(myMap)


  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

}
