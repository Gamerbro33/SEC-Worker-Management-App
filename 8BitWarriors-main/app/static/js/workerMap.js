let userMarker; // global varaible
let userLocation;
let selectedJobsite;
let jobsiteCircle;
let isJobsiteSelected = false;
let watchId; // to store the watchPosition ID

async function initMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            // creates a global variable for the map instance
            window.existingMapInstance = new google.maps.Map(document.getElementById('map'), {
                center: userLocation,
                zoom: 15
            });

            const userUUID = document.getElementById('currentPfp').getAttribute('data-user-id') || "{{ session['user']['UUID'] }}";
            const profilePicURL = `/get_profile_picture/${userUUID}?_=${new Date().getTime()}`;
            
            getCircularProfileIcon(profilePicURL, function (circularIcon) {
                userMarker = new google.maps.Marker({
                    position: userLocation,
                    map: window.existingMapInstance,
                    icon: {
                        url: circularIcon,
                        scaledSize: new google.maps.Size(40, 40),
                        anchor: new google.maps.Point(20, 20)
                    }
                });
            });

            startTrackingLocation(); // Start tracking the user's location
            // Display initial coordinates
            updateCoordinatesDisplay(userLocation.lat, userLocation.lng);
        }, () => {
            alert("Geolocation failed. Please allow location access.");
        });
    } else {
        alert("Your browser doesn't support geolocation.");
    }
}



// Function to track and send user's location to the server
// no need to check for navigator.geolocation, as it is already checked in initMap
// not called as of yet

function startTrackingLocation() {

    // go ahead and init the user to liveLocation

    watchId = navigator.geolocation.watchPosition(position => { // watch posisiton is used for live tracking
        userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        
        console.log("watch position running");

        // Update the map with the new location
        userMarker.setPosition(userLocation);

        // Send location to the server via Socket.IO
        // this does not call the google maps API, which is handy
        if (isJobsiteSelected) {

            const distance = calculateDistance(selectedJobsite.latitude, selectedJobsite.longitude, userLocation.lat, userLocation.lng);
            const buffer = 500; // 200 meters buffer

            if (distance >= selectedJobsite.radius + buffer) {
                console.log("User is outside the jobsite radius buffer. not sending location.");
                return; // Do not send location if outside the jobsite radius
            }

            const userData = {user, userLocation, selectedJobsite};
            socket.emit('send_location', userData);
        }


    }, error => {
        console.error("Error watching position: ", error);
    },
    {
        enableHighAccuracy: true, // Requests GPS data with high accuracy
        timeout: 5000, // Waits max 5 sec before timing out
        maximumAge: 0 // Ensures fresh data instead of cached location
    });
}

// this is for testing, not implemented in the app
function sendLocationToSocket() {
    if (isJobsiteSelected) {
        const userData = {user, userLocation, selectedJobsite};
        console.log("Sending location to socket: ", userData);
        socket.emit('send_location', userData);
    } else {
        console.error("No jobsite is selected.");
    }

}


// Function to stop tracking the user's location
function stopTrackingLocation() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
}

// Function to handle jobsite selection
function selectJobsite(jobsite) {
    selectedJobsite = jobsite;
    isJobsiteSelected = true;
    // Additional logic to handle jobsite selection can be added here
}

// Function to calculate the distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance * 1000; // return distance in meters, fixes bug
}

function getCircularProfileIcon(url, callback) {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // ensure BLOBs load properly
    img.onload = function () {
        const canvas = document.createElement('canvas');
        const size = 60;
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 0, 0, size, size);

        callback(canvas.toDataURL()); // returns a base64 image URL
    };
    img.src = url;
}

