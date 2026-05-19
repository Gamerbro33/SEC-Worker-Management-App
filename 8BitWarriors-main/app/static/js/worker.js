//
class Jobsite {
    constructor(uuid, name, description, latitude, longitude, radius) {
        this.uuid = uuid;
        this.name = name;
        this.description = description;
        this.latitude = latitude;
        this.longitude = longitude;
        this.radius = radius;
    }
}

const socket = io.connect(window.location.origin); // Initialize Socket.IO connection to the server
let user;
let currentJobSites = [];

async function getJobsites() {
    try {
        const response = await fetch('/getAssignedJobsites');
        if (!response.ok) {
            throw new Error('Failed to fetch assigned jobsites');
        }
        const data = await response.json();
        if (data.success) {
            currentJobSites = data.jobsites.map(jobsite => new Jobsite(
                jobsite.UUID,
                jobsite.title,
                jobsite.description,
                parseFloat(jobsite.latitude),
                parseFloat(jobsite.longitude),
                parseFloat(jobsite.radius)
            ));
        } else {
            console.error('No jobsites assigned.');
            currentJobSites = [];
        }
    } catch (error) {
        console.error('Error fetching assigned jobsites:', error);
    }
}

function populateJobsiteSelect() {
    const selectElement = document.getElementById('workerJobsitesView');
    selectElement.innerHTML = ''; // Clear existing options

    if (currentJobSites.length === 0) {
        const option = document.createElement('option');
        option.textContent = 'No jobsites assigned';
        option.disabled = true;
        selectElement.appendChild(option);
        return;
    }

    currentJobSites.forEach(jobsite => {
        const option = document.createElement('option');
        option.value = jobsite.uuid;
        option.textContent = jobsite.name;
        selectElement.appendChild(option);
    });
}

async function whenPageOpened() {
    try {
        const response = await fetch('/api/sendUserToFrontend');
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        user = await response.json();
        console.log("Logged-in User:", user); // Debug log
        await getJobsites(); // Fetch assigned jobsites
        populateJobsiteSelect(); // Populate dropdown with jobsites
    } catch (error) {
        console.error('Error initializing page:', error);
    }
}

window.onload = async function() {
    await whenPageOpened();
    await initMap();
};

// Function when a jobsite is selected
async function jobsiteSelected() {
    try{
        const selectElement = document.getElementById('workerJobsitesView');
        const selectedJobsiteId = selectElement.value;
        selectedJobsite = currentJobSites.find(jobsite => jobsite.uuid === selectedJobsiteId);
        isJobsiteSelected = true;
        goToJobsite(selectedJobsite);
        checkWorkerLocation(selectedJobsite);

        const sidebar = document.getElementById("sidebar");
        sidebar.classList.remove("active");
    } catch (error) {
        console.error('Error selecting jobsite:', error);
    }
}

//sends a alert if worker is in or out of a selected jobsite radius
function checkWorkerLocation(jobsite) {
    const userData = {user, userLocation};
    distance = calculateDistance(jobsite.latitude,jobsite.longitude, userLocation.lat,userLocation.lng);
    if(distance <= jobsite.radius){
        const userData = {user, userLocation, selectedJobsite};
        jobsiteCircle.setOptions({ fillColor: '#00FF00' });
        //window.alert("you are IN the select jobsite geofence");
    } else {
        jobsiteCircle.setOptions({ fillColor: '#AA0000' });
        //window.alert("you are OUT the select jobsite geofence");
    }
    
}


// Function to go to a selected jobsite
function goToJobsite(jobsite) {
    // Convert latitude, longitude, and radius to numbers if they are strings
    const latitude = parseFloat(jobsite.latitude);
    const longitude = parseFloat(jobsite.longitude);
    const radius = parseFloat(jobsite.radius);

    // Validate the converted values
    if (isNaN(latitude) || isNaN(longitude) || isNaN(radius)) {
        console.error("Invalid jobsite data:", jobsite);
        alert("Invalid jobsite data. Please ensure latitude, longitude, and radius are valid numbers.");
        return;
    }

    // Get the existing map instance
    const map = window.existingMapInstance;

    // Set the new center of the map
    map.setCenter({ lat: latitude, lng: longitude });
    map.setZoom(15);

    // Clear existing markers and circles
    if (window.existingMarker) {
        window.existingMarker.setMap(null);
    }
    if (window.existingCircle) {
        window.existingCircle.setMap(null);
    }

    // Add a new marker
    window.existingMarker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: jobsite.name || "Jobsite"
    });

    // Add a new circle
    jobsiteCircle = window.existingCircle = new google.maps.Circle({
        map: map,
        radius: radius,
        fillColor: '#AA0000',
        center: { lat: latitude, lng: longitude } // Explicitly set center
    });

    // Make circle clickable
    jobsiteCircle.setOptions({ clickable: true });

    // Create InfoWindow with "Get Directions" button
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="text-align: center;">
                <strong>${jobsite.name}</strong><br>
                <button id="getDirectionsBtn" style="margin-top: 5px; padding: 6px 10px; background-color: #004aad; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Get Directions
                </button>
            </div>
        `
    });

    // Attach listener to marker
    window.existingMarker.addListener("click", () => {
        infoWindow.open(map, window.existingMarker);
        google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
            const btn = document.getElementById('getDirectionsBtn');
            if (btn) {
                //alert("Opening directions...");
                btn.onclick = () => {
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
                };
            }
        });
    });

    // Attach listener to circle
    jobsiteCircle.addListener("click", () => {
        infoWindow.setPosition({ lat: latitude, lng: longitude });
        infoWindow.open(map);
        google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
            const btn = document.getElementById('getDirectionsBtn');
            if (btn) {
                //alert("Opening directions...");
                btn.onclick = () => {
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
                };
            }
        });
    });
}

function goToUserLocation() {
   
    // to be removed after debugging
    const userData = {user, userLocation};
     //window.alert("user"+userLocation.lat+", "+userLocation.lng);
    //window.alert("this is printing user coords for testing:"+userLocation.lat+", "+userLocation.lng);

    const map = window.existingMapInstance;
    // global variable userlocation
    map.setCenter(userLocation);
    map.setZoom(15);
}

// Creates a time card for each employee
async function createTimeCard(workerLocation, jobsite) {
    const now = new Date();
    const currentTime = now.toISOString();
    const isInside = calculateDistance(workerLocation.lat, workerLocation.lng, jobsite.latitude, jobsite.longitude) <= jobsite.radius;
  
    if (isInside) {
      if (!workerLocation.lastEntered) {
        workerLocation.lastEntered = currentTime; // Log entry time
      }
    } else {
      if (workerLocation.lastEntered) {
        const entryTime = workerLocation.lastEntered;
        const exitTime = currentTime;
  
        // Log entry and exit to the backend
        await fetch('/logTimeCard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workerUUID: user.uuid,
            jobsiteUUID: jobsite.uuid,
            entered: entryTime,
            exited: exitTime
          })
        });
  
        workerLocation.lastEntered = null; // Reset entry time
      }
    }
  }

// Add event listeners for socket events
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

socket.on('update_location', (data) => {
    console.log('Location update received:', data);
    // Handle location update
});

function confirmLogout() {
    return confirm("Are you sure you want to log out?");
}