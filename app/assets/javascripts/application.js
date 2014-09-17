//= require jquery
//= require jquery_ujs
//= require_tree .

var rendererOptions = {draggable: false};
var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
var directionsService = new google.maps.DirectionsService();
var map;
var distance = 0.1; // km
var boxpolys = [];

function initialize() {
  var mapOptions = {
    zoom: 13,
    center: new google.maps.LatLng(39.7386033, -104.935449)
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);
  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById('directions-panel'));

//  ***************CRIME POINT MAP LAYER ************************
//  cartodb.createLayer(map, 'http://lmcnish14.cartodb.com/api/v2/viz/ba1f60ea-2fac-11e4-b64f-0e73339ffa50/viz.json')
//    .addTo(map);
//  ************************************************************

  var control = document.getElementById('control');
  control.style.display = 'block';
  map.controls.push(control);

  $("#control input[type=submit]").on('click', calcRoute);


}

function calcRoute(event) {
  event.preventDefault();
  var start = document.getElementById('start').value + "Denver, CO";
  var end = document.getElementById('end').value + "Denver, CO";
  var request = {
    origin: start,
    destination: end,
    travelMode: google.maps.TravelMode.WALKING,
    provideRouteAlternatives: true

  };

  google.maps.event.clearListeners(directionsDisplay, 'routeindex_changed');

  directionsService.route(request, function (response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      console.log("route called");
      directionsDisplay.setDirections(response);
      var contentRight = document.getElementById('directions-panel');
      contentRight.style.display = 'block';
      contentRight.style.background = '#f4f4f4';

      var path = response.routes[0].overview_path;
      var routeBoxer = new RouteBoxer();
      var boxes = routeBoxer.box(path, distance);
      for (var i = 0; i < boxes.length; i++) {
        var bounds = boxes[i];
        // Places request
        var place_request = {
          bounds: bounds,
          types: ['hospital', 'police']
        };
        service = new google.maps.places.PlacesService(map);
        service.search(place_request, callback);
      }
      console.log("after route called:", path);
      drawBoxes(boxes);
      google.maps.event.addListener(directionsDisplay, 'routeindex_changed', function () {
        console.error("this gets called a ton");
        var current_route_index = this.getRouteIndex();
        var path2 = response.routes[current_route_index].overview_path;
        var boxes2 = routeBoxer.box(path2, distance);
        drawBoxes(boxes2);
      });

    }

  });
}

function drawBoxes(boxes) {
  console.log("drawboxes activated");
  console.log("boxes", boxes);
  var count = 0;
  var crime_count = 0;
  var promise = $.getJSON("http://lmcnish14.cartodb.com/api/v2/sql?q=SELECT geo_lon, geo_lat, severity FROM public.crime_updated");
  clearBoxes();
  promise.then(function (data) {
    for (var i = 0; i < boxes.length; i++) {
      boxpolys[i] = new google.maps.Rectangle({
//       ************* BOX BORDERS ********************************************
//        bounds: boxes[i],
//        fillOpacity: 0,
//        strokeOpacity: 1.0,
//        strokeColor: '#000000',
//        strokeWeight: 1,
//        *********************************************************************
        map: map
      });
      var northeast = boxes[i].getNorthEast();
      var southwest = boxes[i].getSouthWest();
      $.each(data["rows"], function (i, crime_point) {
        var lat = crime_point.geo_lat;
        var lon = crime_point.geo_lon;
        if (lat > southwest["k"] && lat < northeast["k"] && lon > southwest["B"] && lon < northeast["B"]) {
          crime_count += 1;
          sev_count = parseInt(crime_point.severity);
          count += sev_count;

        }
      });
    }
    var avg_crime = parseInt(count / crime_count);
    $('#severity_score').replaceWith('<div id="severity_score"><p><strong>Number of Crimes: ' + crime_count + '  |   Avg Score: ' + avg_crime + '  |  Total Score: ' + count + '</strong></p></div>');
    console.log(count);
  });
}

function clearBoxes() {
  console.log("clearBoxes activated");
  for (var i = 0; i < boxpolys.length; i++) {
    boxpolys[i].setMap(null);
  }

  boxpolys = [];
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    var i = 0;

    while(i < results.length) {
      createMarker(results[i]);
      var request = { reference: results[i].reference };
      service.getDetails(request, function(details, status2) {
        //if(status2 == google.maps.places.PlacesServiceStatus.OK)
        addResult(details);
      });
      i++;
    }
  }
}

function addResult(place) {
  if(place != null) {
    // You should now have a "place" object here that has address, name, URL, etc...
  }
}

function createMarker(place) {
console.log(place.name)
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location

  });


}


console.log('Boxpolys:', boxpolys);

google.maps.event.addDomListener(window, 'load', initialize);

