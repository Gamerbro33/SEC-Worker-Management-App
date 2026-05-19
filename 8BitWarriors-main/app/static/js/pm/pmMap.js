let userLocation = { lat: 0, lng: 0 };

let selectedRadius = 0;
let selectedLat = 0;
let selectedLng = 0;
let selectedMarker;
let selectedJobsiteCircle;

async function initMap() {

    userLocation = { lat: 0, lng: 0 };

    if (!navigator.geolocation) {
        alert("Your browser doesn't support geolocation or you have location services disabled, your location will not be tracked");
    }

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
    } catch (error) {
        alert("Your browser doesn't support geolocation or you have location services disabled, your location will not be tracked");
    }

    // creates a global variable for the map instance
    window.existingMapInstance = new google.maps.Map(document.getElementById('map'), {
        center: userLocation,
        disableDoubleClickZoom: true,
        zoom: 15
    });

    if (userLocation.lat == 0 && userLocation.lng == 0) {
        // if the user location is not available, set the map to a default location of bank of america stadium in charlotte
        window.existingMapInstance.setCenter(new google.maps.LatLng(35.225732493471625, -80.8527985846563));
    }



    selectedMarker = new google.maps.Marker({
        position: { lat: selectedLat, lng: selectedLng },
        map: window.existingMapInstance,
        title: 'Jobsite Center'
    });

    selectedJobsiteCircle = new google.maps.Circle({
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.2, 
        map: window.existingMapInstance,
        center: { lat: selectedLat, lng: selectedLng },
        radius: 0,          // radius in meters
        clickable: false    // disables clicking on the circle
    });

    // every time the user drags do this we will update our information
    //window.existingMapInstance.addListener('dragend', setSidebarToMapCenter);
    window.existingMapInstance.addListener('dblclick', mapDoubledClicked);
}

function mapDoubledClicked(event) {
    selectedLat = event.latLng.lat();
    selectedLng = event.latLng.lng();

    document.getElementById('latForm').value = selectedLat;
    document.getElementById('lngForm').value = selectedLng;

    // move the marker
    selectedMarker.setPosition(new google.maps.LatLng(selectedLat, selectedLng));
    selectedJobsiteCircle.setCenter(new google.maps.LatLng(selectedLat, selectedLng));
}

function setSidebarToMapCenter() {
    const center = window.existingMapInstance.getCenter();
    document.getElementById('currentLat').value = center.lat();
    document.getElementById('currentLng').value = center.lng();
}
