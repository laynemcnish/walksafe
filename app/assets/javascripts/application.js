// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require_tree .

$(document).ready(function () {
  function initialize() {
    var mapOptions = {
      center: new google.maps.LatLng(40.7542789, -73.9765479),
      zoom: 13
    };
    var map = new google.maps.Map(document.getElementById("map-canvas"),
      mapOptions);
  }

  google.maps.event.addDomListener(window, 'load', initialize);


});
