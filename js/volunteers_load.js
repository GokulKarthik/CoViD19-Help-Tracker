var currentPage = 1;
var volunteers;
var map;
var user_location;
var max_distance = 10 * 1000;
var markerCluster;
var volunteer_markers;

var table = new Tabulator("#volunteers_table", {
    dataFiltered: function (filters, rows) {
        var newData = []
        for (index = 0; index < rows.length; index++) {
            newData.push(rows[index].getData());
        }
        volunteers = newData;
        console.log("volunteers after data filter",volunteers);
        set_volunteer_markers(volunteers);
    },
    layout: "fitColumns",
    placeholder: "Data Loading",
    autoResize: true,
    columns: [
        { title: "Name", field: "name", headerFilter: "input" },
        { title: "Email", field: "email", headerFilter: "input" },
        { title: "Phone", field: "phone", headerFilter: "number" },
        { title: "Help Type", field: "help_type", headerFilter: "input" },
        { title: "Help category", field: "help_category.main", formatter: "textarea", headerFilter: "input" },
        { title: "Help Item", field: "help_category.sub", formatter: "textarea", headerFilter: "input" },
        { title: "Help Message", field: "help_message", formatter: "textarea", headerFilter: "input" },
        { title: "Datetime", field: "datetime", headerFilter: "number" },
    ],
    pagination: "local",
    paginationSize: 5,
});

function get_data() {
    var data = {};
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "https://db-server-dot-corona-bot-gbakse.appspot.com/get_all_volunteers", true);
    xmlhttp.onreadystatechange = function () {
        var currentPage = table.getPage()
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            data = JSON.parse(xmlhttp.responseText);
            table.setData(data);
            table.setPage(Math.min(currentPage, table.getPageMax()));
        }
    };
    xmlhttp.send(null);
}
// setInterval(get_data, 5000);


// function fetch_volunteers_data(){
// 	$.ajax({
// 		url: 'https://db-server-dot-corona-bot-gbakse.appspot.com/get_all_volunteers',
// 		type: 'get',
// 		success: function(response){
// 			volunteers = response;
// 			initMap();
// 		}
// 	});
// }


function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 5,
        center: { lat: 23.2599, lng: 77.4126 }, // Bhopal
        styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
            }
          ],
    });
    var display_info = 'false';

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var current_pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setCenter(current_pos);
            map.setZoom(12)

            var access_area = new google.maps.Circle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.35,
                map: map,
                center: current_pos,
                radius: max_distance // in M
            });
            user_location=current_pos;
            // set_volunteer_markers("true", current_pos);
            //set_help_seeker_markers("true", current_pos);

        }, function () {
            handleLocationError(true, map.getCenter());
            // set_volunteer_markers("false", "false");
            // set_help_seeker_markers("false", "false");
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, map.getCenter());
        // set_volunteer_markers("false", "false");
        //set_help_seeker_markers("false", "false");
    }

    function handleLocationError(browserHasGeolocation, pos) {
        let error_message = browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.';
        window.alert(error_message);
    }

}

function find_haversine_distance(lat1, lon1, lat2, lon2) {
    var R = 6371; // km (change this constant to get miles)
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return Math.round(d * 1000); //return distance in m
}


function set_volunteer_markers(display_info) {
    // Add some markers to the map.
    // Note: The code uses the JavaScript Array.prototype.map() method to
    // create an array of markers based on a given "locations" array.
    // The map() method here has nothing to do with the Google Maps API.
    if(markerCluster){
        markerCluster.removeMarkers(volunteer_markers);
    }
    console.log(volunteers)
    volunteer_markers = volunteers.map(function (entry, i) {

        let loc = {
            lat: parseFloat(entry['lat']),
            lng: parseFloat(entry['long'])
        }

        var contentString = '' +
            '<p>' +
            '	<h3>' + entry['help_category']['main'] + '</h3>' +
            '	<h5>' + entry['help_category']['sub'] + '</h3>' +
            '	Datetime: ' + entry['datetime'] + '<br>' +
            '	Name: ' + entry['name'] + '<br>' +
            '	Phone: ' + entry['phone'] + '<br>' +
            '	Email: ' + entry['email'] + '<br>' +
            '	Report: ' + entry['report_message'] +
            '</p>';

        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });

        icon_url = "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|0000ff"
        var marker = new google.maps.Marker({
            position: loc,
            label: entry['name'],
            icon: icon_url
        });

        console.log(user_location);
        if (display_info && user_location) {
            let haversine_distance = find_haversine_distance(user_location.lat, user_location.lng, loc.lat, loc.lng)
            //console.log(haversine_distance, max_distance)
            if (haversine_distance <= max_distance) {
                marker.addListener('click', function () {
                    infowindow.open(map, marker);
                });
            }
        }

        return marker
    });

    // Add a marker clusterer to manage the markers.
    markerCluster = new MarkerClusterer(map, volunteer_markers,
        { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m', maxZoom: 18 });
}

get_data();
// fetch_volunteers_data();

initMap();