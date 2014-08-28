//= require jquery
//= require jquery_ujs
//= require_tree .

var directionsDisplay;
var directionsService = new google.maps.DirectionsService();

function initialize() {
  directionsDisplay = new google.maps.DirectionsRenderer();
  var mapOptions = {
    zoom: 12,
    center: new google.maps.LatLng(39.7386033, -104.935449)
  };
  var map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);
  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById('directions-panel'));

  var control = document.getElementById('control');
  control.style.display = 'block';
  map.controls.push(control);

  $("#control input[type=submit]").on('click', calcRoute);
}

function calcRoute(event) {
  event.preventDefault();
  console.log("hello");
  var start = document.getElementById('start').value;
  var end = document.getElementById('end').value;
  console.log(start);
  console.log(end);
  var request = {
    origin: start,
    destination: end,
    travelMode: google.maps.TravelMode.WALKING

  };

  directionsService.route(request, function (response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
      var contentRight = document.getElementById('directions-panel');
      contentRight.style.display = 'block';
      contentRight.style.background = '#f4f4f4';
    }
  });
}
google.maps.event.addDomListener(window, 'load', initialize);


