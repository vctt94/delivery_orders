/**
 * @ToDo draw generated routes into map
 */
         
var MAPAPP = {};
MAPAPP.markers = [];
MAPAPP.currentInfoWindow;
MAPAPP.pathName = window.location.pathname;

var sendToApi = []

var directionsService = new google.maps.DirectionsService;
var directionsDisplay = new google.maps.DirectionsRenderer;

$(document).ready(function() {
    initialize();
    populateMarkers(MAPAPP.pathName);
});


//Initialize our Google Map
function initialize() {
    var center = new google.maps.LatLng(30.648670261474,76.809466440475);
    var mapOptions = {
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: center,
    };
    this.map = new google.maps.Map(document.getElementById('map_canvas'),
        mapOptions);
    directionsDisplay.setMap(this.map);
};

// Fill map with markers
function populateMarkers(dataType) {
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    apiLoc = typeof apiLoc !== 'undefined' ? apiLoc : '/data/' + dataType + '.json';

    // jQuery AJAX call for JSON
    $.getJSON(apiLoc, function(data) {
        //For each item in our JSON, add a new map marker

        $.each(data, function(i, ob) {
            var data = {
                id       : this.order_id, 
                lat      : this.delivery_latitude,
                lng      : this.delivery_longitude,
                name     : this.delivery_address
            }
            sendToApi.push(data)

            var marker = new google.maps.Marker({
                map: map,
                position: new google.maps.LatLng(this.delivery_latitude, this.delivery_longitude),
                shopname: this.delivery_address,
                details: "delivery date: "+this.delivery_date,
                website: this.order_id,
                icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            });
    	//Build the content for InfoWindow
            var content = '<h1 class="mt0"><a href="' + marker.website + '" target="_blank" title="' + marker.shopname + '">' + marker.shopname + '</a></h1><p>' + marker.details + '</p>';
        	marker.infowindow = new google.maps.InfoWindow({
            	content: content,
            	maxWidth: 400
            });directionsDisplay.setMap(null);

    	//Add InfoWindow
            google.maps.event.addListener(marker, 'click', function() {
                if (MAPAPP.currentInfoWindow) MAPAPP.currentInfoWindow.close();
                marker.infowindow.open(map, marker);
                MAPAPP.currentInfoWindow = marker.infowindow;
            });
            MAPAPP.markers.push(marker);
        });

    }).done(function(){
        calculateServiceCost(sendToApi)
    });
};

function calculateAndDisplayRoute(origin,destination,directionsService, directionsDisplay) {
    directionsService.route({
          origin: new google.maps.LatLng(origin[0], origin[1]),
          destination: new google.maps.LatLng(destination[0], destination[1]),
          travelMode: 'DRIVING'
        }, function(response, status) {
              if (status === 'OK') {
                console.log(response)
                directionsDisplay.setDirections(response);
              } else {
                window.alert('Directions request failed due to ' + status);
              }
        });
}

function calculateServiceCost(data){

    var dataToSend = {
        service             : data,
        fleet               : [{"id":1,"lat":30.7188978,"lng":76.8102981,"latEnd":30.7188978,"lngEnd":76.8102981,"returnToStart":0}],
        maxVisits           : data.length,
        polylines           : false,
        distanceCalculation : false,
        speed               : 40,
        decideFleetSize     : 0
    }
    dataToSend = JSON.stringify(dataToSend)

    $.ajax({
      type: "POST",
      dataType : "json",
      headers: {
        "Authorization": "772ea600-78ad-11e6-a56b-0bff586a75e5",
        "Content-Type": "application/json; charset=utf-8"
      },
      url: "https://api.flightmap.io/api/v1/vrp",
      data: dataToSend,
      success: function(response){
        console.log(response)
      },
    });
}
