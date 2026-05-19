// Global Variables
let selectedLat = parseFloat("{{ selectedLat|default(0) }}");
let selectedLng = parseFloat("{{ selectedLng|default(0) }}");
let selectedMarker;
let selectedJobsiteCircle;
let existingMapInstance;

// Fetch and initialize map with jobsite coordinates
function fetchAndInitJobsiteMap() {
    fetch('/showJobsite')
        .then(response => response.json())
        .then(data => {
            console.log("Fetched jobsite:", data);
            selectedLat = data.lat;
            selectedLng = data.lng;

            const mapOptions = {
                zoom: 15,
                center: { lat: selectedLat, lng: selectedLng },
                disableDoubleClickZoom: true
            };

            existingMapInstance = new google.maps.Map(document.getElementById('map'), mapOptions);

            selectedMarker = new google.maps.Marker({
                position: { lat: selectedLat, lng: selectedLng },
                map: existingMapInstance,
                title: 'Jobsite Location'
            });

            selectedJobsiteCircle = new google.maps.Circle({
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#FF0000",
                fillOpacity: 0.2,
                map: existingMapInstance,
                center: { lat: selectedLat, lng: selectedLng },
                radius: 100
            });
        })
        .catch(error => console.error('Error fetching jobsite data:', error));
}

// Set the map view to the jobsite location
function setMapToJobsiteLocation(lat, lng) {
    if (!existingMapInstance) {
        console.error("Map instance not initialized yet.");
        return;
    }

    const location = new google.maps.LatLng(lat, lng);
    existingMapInstance.setCenter(location);
    existingMapInstance.setZoom(15);

    if (!selectedMarker) {
        selectedMarker = new google.maps.Marker({
            position: location,
            map: existingMapInstance,
            title: 'Jobsite Location'
        });
    }

    if (!selectedJobsiteCircle) {
        selectedJobsiteCircle = new google.maps.Circle({
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.2,
            map: existingMapInstance,
            center: location,
            radius: 100
        });
    }
}

// Fetch user info on page load
function whenPageOpened() {
    fetch('api/sendUserToFrontend')
        .then(response => response.json())
        .then(data => {
            document.getElementById('usernameHeader').textContent = "You are logged in as " + data.username;
        })
        .catch(error => console.error('Error fetching user info:', error));
}

// Event listener for page load
window.onload = function () {
    whenPageOpened();
    fetchAndInitJobsiteMap();  // Now this initializes the map with correct coordinates
};