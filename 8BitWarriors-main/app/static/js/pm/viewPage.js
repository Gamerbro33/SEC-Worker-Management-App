let jobsiteData;
let workersDiv;
let workersArray = []; // array each element is an array of size 2, [worker, marker]
let socket;

//the map will show the selected jobsites map information
async function initMap(jobsite) {
    const latitude = parseFloat(jobsite.latitude);
    const longitude = parseFloat(jobsite.longitude);
    const radius = parseFloat(jobsite.radius);
    if (!navigator.geolocation) {
        alert("Your browser doesn't support geolocation.");
        return;
    }
    navigator.geolocation.getCurrentPosition(position => {
        jobsiteLocation = {
            lat: latitude,
            lng: longitude
        };
        // creates a global variable for the map instance
        window.existingMapInstance = new google.maps.Map(document.getElementById('map'), {
            center: jobsiteLocation,
            disableDoubleClickZoom: true,
            zoom: 15
        });
        const map = window.existingMapInstance;
        window.existingCircle = new google.maps.Circle({
            map: map,
            radius: radius,
            fillColor: '#AA0000',
            center: { lat: latitude, lng: longitude } // Explicitly set center
        });
    
    }, () => {
        alert("Geolocation failed. Please allow location access.");
    });
}

window.onload = () => {
    const jobsiteElement = document.getElementById('jobsiteData');
    const jobsiteDataString = jobsiteElement.getAttribute('data-jobsite');
    jobsiteData = JSON.parse(jobsiteDataString); 
    initMap(jobsiteData);
    displayJobsiteSideBar(jobsiteData);
    connectToSocket(jobsiteData.uuid);
    fetchAssignedUsers(jobsiteData.uuid); // Fetch assigned users for the jobsite
}

async function fetchAssignedUsers(jobsiteUUID) {
    try {
        const response = await fetch('/getAssignedUsersForJobsiteJSON', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ jobsiteUUID: jobsiteUUID }),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch assigned users: ${response.status} ${response.statusText}`);
        }

        const assignedUsers = await response.json();
        
        assignedUsers.forEach(user => {
            const worker = {
                ...user,
                type: 'worker'
            }

            const workerElement = [worker, null];
            workersArray.push(workerElement);
        });

        updateWorkerSidebar(); // Update the sidebar with the fetched users

    } catch (error) {
        console.error('Error fetching assigned users:', error);
    }
}


function displayJobsiteSideBar(jobsite) {
    let title = document.getElementById('jobsite-title');
    title.textContent = jobsite.name || 'Error: title not found';
    title.title = jobsite.description || 'Error: description not found';
}

function connectToSocket(uuid) {
    console.log('Connecting to socket:', uuid);
    socket = io.connect(window.location.origin + '/jobsite/' + uuid);

    socket.on('jobsite_location_update', (data) => {
        //console.log('Jobsite location update received:', data);
        updateWorkerArray(data.user, data.location);
    });

    socket.on('connect', () => {
        console.log('Socket connected');
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
    });
}

function updateWorkerSidebar() {
    const container = document.getElementById('worker-cards-container');
    container.innerHTML = ''; // Clear existing cards

    workersArray.forEach(([worker, marker]) => {

        const top = document.createElement('div');
        top.className = 'worker-card-top';

        const card = document.createElement('div');
        card.className = 'worker-card';

        const name = document.createElement('h4');
        name.textContent = worker.username;

        const status = document.createElement('h4');
        status.textContent = '🔴'
        status.title = 'Offline';
        if (marker !== null) {
            status.textContent = '🟢'
            status.title = 'Online';
        }

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        const focusButton = document.createElement('button');
        focusButton.textContent = 'Focus';
        focusButton.onclick = () => {
            if (marker === null) {
                alert('Worker has not activated their location yet.');
                return;
            }
            window.existingMapInstance.setCenter(marker.getPosition());
        };

        buttonContainer.appendChild(focusButton);

        top.appendChild(name);
        top.appendChild(status);

        card.appendChild(top);
        card.appendChild(buttonContainer);
        container.appendChild(card);
    });
}

// this function will add a marker to the array or update the marker if it already exists
function updateWorkerArray(workerData, locationData) {
    if (!window.existingMapInstance) {
        console.error('Map instance is not available');
        return;
    }

    //console.log('Worker data:', workerData);

    // Check if the worker already exists in the array
    const existingWorkerIndex = workersArray.findIndex(worker => worker[0].UUID === workerData.UUID);
    if (existingWorkerIndex == -1) {
        console.error('Worker not found in array:', workerData.UUID);
        return;
    }


    console.log('Updating worker:');
    const marker = workersArray[existingWorkerIndex][1];
    if (marker == null) {
        console.log('Creating new marker for worker:');
        const newMarker = new google.maps.Marker({
            position: new google.maps.LatLng(locationData.lat, locationData.lng),
            map: window.existingMapInstance,
            title: workerData.username,
            icon: {
                url: "https://cdn-icons-png.flaticon.com/512/149/149071.png", // Example: User Avatar Icon
                scaledSize: new google.maps.Size(20, 20), // Resize the icon
                anchor: new google.maps.Point(10, 10) // Center the icon correctly
            }
        });
        workersArray[existingWorkerIndex][1] = newMarker; // Update the marker in the array
    } else {
        console.log('Updating existing marker for worker:');
        workersArray[existingWorkerIndex][1].setPosition(new google.maps.LatLng(locationData.lat, locationData.lng));
    }
    updateWorkerSidebar() // Update the sidebar with the new marker position
}

function confirmLogout() {
    return confirm("Are you sure you want to log out?");
}