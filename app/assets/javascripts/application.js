//= require jquery
//= require jquery_ujs
//= require bootstrap-sprockets
//= require_tree .

var rendererOptions = {draggable: false};
var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
var directionsService = new google.maps.DirectionsService();
var map;
var zoom;
var bounds;
var distance = 0.1; // km
var boxpolys = [];
var markers = [];

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
  cartodb.createLayer(map, 'http://lmcnish14.cartodb.com/api/v2/viz/ba1f60ea-2fac-11e4-b64f-0e73339ffa50/viz.json')
    .addTo(map);
//  ************************************************************

  var control = document.getElementById('control');
  control.style.display = 'block';
  map.controls.push(control);

  google.maps.event.trigger(map, 'resize');


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
      directionsDisplay.setDirections(response);
      var directionsPanel = document.getElementById('directions-panel');
      directionsPanel.style.display = 'block';
      directionsPanel.style.background = '#f4f4f4';

      var path = response.routes[0].overview_path;
      var routeBoxer = new RouteBoxer();
      var boxes = routeBoxer.box(path, distance);
      bounds = response.routes[0][bounds];
      drawBoxes(boxes);
      google.maps.event.addListener(directionsDisplay, 'routeindex_changed', function () {
        var current_route_index = this.getRouteIndex();
        var path2 = response.routes[current_route_index].overview_path;
        var boxes2 = routeBoxer.box(path2, distance);
        drawBoxes(boxes2);
      });
    }
  });
}

function drawBoxes(boxes) {
  var count = 0;
  var crime_count = 0;
  var promise = $.getJSON("http://lmcnish14.cartodb.com/api/v2/sql?q=SELECT geo_lon, geo_lat, severity FROM public.crime_updated");
  clearBoxes();
  deleteMarkers();


  promise.then(function (data) {
    for (var i = 0; i < boxes.length; i++) {
      var bounds = boxes[i];
      var place_request = {
        bounds: bounds,
        types: ['fire_station'],
        keyword: 'fire station'
      };

      var place_request2 = {
        bounds: bounds,
        keyword: "health",
        types: ['hospital']
      };

      var place_request3 = {
        bounds: bounds,
        keyword: 'police',
        types: ['police']
      };

      service = new google.maps.places.PlacesService(map);
      service.search(place_request, callback);
      service2 = new google.maps.places.PlacesService(map);
      service2.search(place_request2, callback);
      service3 = new google.maps.places.PlacesService(map);
      service3.search(place_request3, callback);
      boxpolys[i] = new google.maps.Rectangle({
//       ************* BOX BORDERS ********************************************
        bounds: boxes[i],
        fillOpacity: 0,
        strokeOpacity: 1.0,
        strokeColor: '#000000',
        strokeWeight: 1,
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
    $('#severity_score').replaceWith('<div id="severity_score" class="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12"><div class="col-xs-12 col-sm-4 col-md-4 col-lg-4 col-xl-4 sev"><h5 class="text-nowrap">Number of Crimes: ' + crime_count + '</h5></div><div class="col-xs-12 col-sm-4 col-md-4 col-lg-4 col-xl-4 sev"><h5 class="text-nowrap sev">Avg Score: ' + avg_crime + '</h5></div><div class="col-xs-12 col-sm-4 col-md-4 col-lg-4 col-xl-4 sev"><h5 class="text-nowrap sev">Total Score: ' + count + '</h5></div></div>');
  });
}

function clearBoxes() {
  for (var i = 0; i < boxpolys.length; i++) {
    boxpolys[i].setMap(null);
  }
  boxpolys = [];
}


function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    var i = 0;

    while (i < results.length) {
      createMarker(results[i]);
      var request = { reference: results[i].reference };
      service.getDetails(request, function (details, status2) {
      });
      i++;
    }
  }
}

function createMarker(place) {
  var str = place.name;
  if (str.indexOf("Green") == -1 && str.indexOf("Medicinals") == -1 && str.indexOf("Herban") == -1 && str.indexOf("Dispensary") == -1 && str.indexOf("Paternity") == -1 && str.indexOf("Mining") == -1 && str.indexOf("Plastic") == -1 && str.indexOf("Dentist") == -1 && str.indexOf("Dermatology") == -1 && str.indexOf("Marijuana") == -1 && str.indexOf("Chief") == -1) {
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location,
      clickable: true
    });
    marker.info = new google.maps.InfoWindow({
      content: '<p class="marker"><strong>' + place.name + '</strong></p>' + '<p class="marker">' + place.vicinity + '</p>'
    });
    markers.push(marker);
    google.maps.event.addListener(marker, 'click', function () {
      marker.info.open(map, marker);
      setTimeout(function () { marker.info.close(); }, 4000);
    });
  }
}

function deleteMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}

$('#myTab a:last').click(function (e) {
  e.preventDefault();
  $(this).tab('show');
});

$(document).ready(function () {
  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    var center = map.getCenter();
    google.maps.event.trigger(map, "resize");
    map.setCenter(center);
    map.fitBounds(bounds);
    console.log(bounds);
//    map.setZoom(zoom);
  });
});


google.maps.event.addDomListener(window, 'load', initialize);