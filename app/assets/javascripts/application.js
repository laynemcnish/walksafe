//= require jquery
//= require jquery_ujs
//= require_tree .

var rendererOptions = {draggable: false};
var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
var directionsService = new google.maps.DirectionsService();
var map;
var routeBoxer = new RouteBoxer();
var distance = 0.1; // km
var boxpolys = null;

function initialize() {
  var mapOptions = {
    zoom: 13,
    center: new google.maps.LatLng(39.7386033, -104.935449),
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);
  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById('directions-panel'));

  cartodb.createLayer(map, 'http://lmcnish14.cartodb.com/api/v2/viz/ba1f60ea-2fac-11e4-b64f-0e73339ffa50/viz.json')
    .addTo(map);

  var control = document.getElementById('control');
  control.style.display = 'block';
  map.controls.push(control);

  $("#control input[type=submit]").on('click', calcRoute);
}

function calcRoute(event) {
  event.preventDefault();
  clearBoxes();
  var start = document.getElementById('start').value + "Denver, CO";
  var end = document.getElementById('end').value + "Denver, CO";
  var request = {
    origin: start,
    destination: end,
    travelMode: google.maps.TravelMode.WALKING,
    provideRouteAlternatives: true

  };

  directionsService.route(request, function (response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
      var contentRight = document.getElementById('directions-panel');
      contentRight.style.display = 'block';
      contentRight.style.background = '#f4f4f4';

      var path = response.routes[0].overview_path;
      var boxes = routeBoxer.box(path, distance);
      drawBoxes(boxes);

      google.maps.event.addListener(directionsDisplay, 'routeindex_changed', function () {
        clearBoxes();
        var current_route_index = this.getRouteIndex();
        var path2 = response.routes[current_route_index].overview_path;
        var boxes2 = routeBoxer.box(path2, distance);
        drawBoxes(boxes2);
        console.log(current_route_index);
        console.log("route changed");
      });

    }

  });
}

function drawBoxes(boxes) {
  boxpolys = new Array(boxes.length);
  for (var i = 0; i < boxes.length; i++) {
    boxpolys[i] = new google.maps.Rectangle({
      bounds: boxes[i],
      fillOpacity: 0,
      strokeOpacity: 1.0,
      strokeColor: '#000000',
      strokeWeight: 1,
      map: map
    });
  }
}

function clearBoxes() {
  if (boxpolys != null) {
    for (var i = 0; i < boxpolys.length; i++) {
      boxpolys[i].setMap(null);
    }
  }
  boxpolys = null;
}



google.maps.event.addDomListener(window, 'load', initialize);


