//= require jquery
//= require jquery_ujs
//= require_tree .

var directionsDisplay;
var directionsService = new google.maps.DirectionsService();

function initialize() {
  directionsDisplay = new google.maps.DirectionsRenderer();
  var mapOptions = {
    zoom: 13,
    center: new google.maps.LatLng(39.7386033, -104.935449)
  };
  var map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);
  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById('directions-panel'));

  cartodb.createLayer(map, 'http://lmcnish14.cartodb.com/api/v2/viz/ba1f60ea-2fac-11e4-b64f-0e73339ffa50/viz.json')
    .addTo(map)
    .on('done', function(layer) {
      var sublayer = layer.getSubLayer(0);
      sublayer.on('featureOver', function(e, pos, latlng, data) {
        cartodb.log.log(e, pos, latlng, data);
      });

      sublayer.on('error', function(err) {
        cartodb.log.log('error: ' + err);
      });

    })
    .on('error', function() {
      cartodb.log.log("some error occurred");
    });


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
    travelMode: google.maps.TravelMode.WALKING,
    provideRouteAlternatives : true

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


