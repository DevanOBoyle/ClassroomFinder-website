window.addEventListener("load", () => {
    
    

    // Send data from the form to "tjena.php"
    function sendData() {
        const XHR = new XMLHttpRequest();
    
        // Bind the FormData object and the form element
        const FD = new FormData(form);
    
        // Define what happens on successful data submission
        XHR.addEventListener("load", (event) => {
            alert(event.target.responseText);
        });
    
        // Define what happens in case of error
        XHR.addEventListener("error", (event) => {
            alert('Oops! Something went wrong.');
        });
    
        // Set up our request
        XHR.open("POST", "tjena.php");
    
        // The data sent is what the user provided in the form
        XHR.send(FD);
    }


    // Receive the result from "tjena.php"
    function receiveData() {
        fetch("tjena.php")
        .then((response) => {
            if(!response.ok){ // Before parsing (i.e. decoding) the JSON data,
                              // check for any errors.
                // In case of an error, throw.
                throw new Error("Something went wrong!");
            }

            return response.json(); // Parse the JSON data.
        })
        .then((data) => {
             // This is where you handle what to do with the response.
            alert(data);
            return data;

        })
        .catch((error) => {
             // This is where you handle errors.
             alert('Oops! Something went wrong.');
        });
    }

    // Show the place on the map
    function showOnMap(place_id) {
        var request = {
            placeId: 'ChIJCXluInVBjoARXmKm8WSQRNk',
            fields: ['name', 'formatted_address', 'formatted_phone_number', 'geometry']
          };
          
          service = new google.maps.places.PlacesService(map);
          service.getDetails(request, callBack);
          
          function callBack(place, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                var marker = new google.maps.Marker({
                    map: map,
                    place: {
                        placeId: request.placeId,
                        location: place.geometry.location
                    }
                });
                map.setCenter(place.geometry.location);
                var url = "https://www.google.com/maps/place/?q=place_id:"+request.placeId;
                var content = '<div id="infoWindow">'+
                    '<h3 id = infoWindow_header>' + place.name + '</h3>'+
                    '<div id="infoWindow_body">'+
                        '<p><b>Address</b>:<br>' +
                            place.formatted_address + '<br>'+
                            '<strong><a id = infoWindow_link href="' + url + '" target="_blank">' + "Get Directions" + '</a></strong><br>' +
                        '</p>'+
                    '</div>'
        
                infowindow.setContent(content);
                infowindow.open(map, marker);
            }
          }
    }   

    // Get the form element
    const form = document.getElementById("myForm");
  
    // Add 'submit' event lstener
    form.addEventListener("submit", (event) => {
      event.preventDefault();  
      sendData();
      var place_id = receiveData();
      showOnMap(place_id);
    });
});

function doSearching() {
    // Search for Baskin Engineering
    var request = {
        location: UCSC,
        radius: '100',
        query: 'Baskin Engineering'
    };

    var service = new google.maps.places.PlacesService(map);
    service.textSearch(request, callback);
}

// Checks that the PlacesServiceStatus is OK, and adds a marker
// using the place ID and location from the PlacesService.
function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        var marker = new google.maps.Marker({
            map: map,
            place: {
                placeId: results[0].place_id,
                location: results[0].geometry.location
            }
        });
        map.setCenter(results[0].geometry.location);
        var url = "https://www.google.com/maps/place/?q=place_id:"+results[0].place_id;
        var content = '<div id="infoWindow">'+
            '<h3 id = infoWindow_header>' + results[0].name + '</h3>'+
            '<div id="infoWindow_body">'+
                '<p><b>Address</b>:<br>' +
                    results[0].formatted_address + '<br>'+
                    '<strong><a id = infoWindow_link href="' + url + '" target="_blank">' + "Get Directions" + '</a></strong><br>' +
                '</p>'+
            '</div>'

        infowindow.setContent(content);
        infowindow.open(map, marker);
    }
}

var UCSC;
// Global variables
var map;
var service;
var infowindow;
var content; 

// Initialize the map
function initMap() {
    UCSC = new google.maps.LatLng(36.992, -122.06);
    infowindow = new google.maps.InfoWindow();
    // Create a map
    map = new google.maps.Map(document.getElementById('map'), {
        center: UCSC,
        zoom: 14
    });
}

// google.maps.event.addDomListener(window, 'load', initialize);