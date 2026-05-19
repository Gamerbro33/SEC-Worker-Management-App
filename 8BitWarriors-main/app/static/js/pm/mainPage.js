window.onload = async function() {
    // Add this event listener declaration here to ensure the page is loaded
    await initMap(); // Ensure initMap is completely finished
    editCheck();
    addEventListeners();
};

function editCheck() {
    const jobsiteElement = document.getElementById('jobsiteToEdit');
    const jobsiteDataString = jobsiteElement.getAttribute('data-jobsite');
    
    if (jobsiteDataString == "None") {
        return;
    }

    const jobsiteData = (JSON.parse(jobsiteDataString)); // double parse to get the object

    // the user has clicked create jobsite and is not editing, so the data passed from the landing page is null

    document.getElementById('submitForm').action = "/updateJobsite"; // changes the flask route to update the jobsite
    // here we will update the sidebar form
    document.getElementById('uuid').value = jobsiteData.uuid;
    document.getElementById('submitButton').textContent = "Save Changes";
    document.getElementById('nameInput').value = jobsiteData.name;
    document.getElementById('descriptionInput').value = jobsiteData.description;
    document.getElementById('latForm').value = jobsiteData.latitude;
    document.getElementById('lngForm').value = jobsiteData.longitude;

    document.getElementById('radiusForm').value = jobsiteData.radius;
    updateRadiusValue(jobsiteData.radius);

    // updating the variables in pmMap.js, radius is already updated
    selectedLat = jobsiteData.latitude;
    selectedLng = jobsiteData.longitude;
    selectedMarker.setPosition(new google.maps.LatLng(selectedLat, selectedLng));
    selectedJobsiteCircle.setCenter(new google.maps.LatLng(selectedLat, selectedLng));
    setMapToSelectedLocation();

}

function updateRadiusValue(value) {
    selectedRadius = value;
    document.getElementById('radiusValue').innerText = "Radius: " + value;
    document.querySelector('.radius').value = value;
    // document.getElementById('radiusSlider').value = value;
    selectedJobsiteCircle.setRadius(parseInt(value));
}

function setMapToCurrentLocation() {

    if (userLocation.lat == 0 && userLocation.lng == 0) {
        if (!confirm("User location is not set. Do you want to set map to default location? (Charlotte, NC)")) {
            map.setCenter(new google.maps.LatLng(35.225732493471625, -80.8527985846563));
            return;
        }
    }

    let map = window.existingMapInstance;
    // user location is defined in pmMap.js
    map.setCenter(userLocation);
    map.setZoom(15);
    setSidebarToMapCenter();
}

function setMapToSelectedLocation() {
    let map = window.existingMapInstance;

    if (!selectedLat || !selectedLng) {
        //alert("Please select a location first.");
        return;
    }
    // selectedLat and selectedLng are defined in pmMap.js
    const selectedLocation = new google.maps.LatLng(selectedLat, selectedLng);
    map.setCenter(selectedLocation);
    map.setZoom(15);
}

function geocodeAddress() {
    const address = document.getElementById('addressInput').value.trim();
    const errorText = document.getElementById('addressError');
    errorText.textContent = ''; // Clear previous errors

    if (!address) {
        errorText.textContent = "Please enter an address.";
        return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': address }, function(results, status) {
        if (status === 'OK') {
            const location = results[0].geometry.location;
            selectedLat = location.lat();
            selectedLng = location.lng();
            selectedMarker.setPosition(new google.maps.LatLng(selectedLat, selectedLng));
            selectedJobsiteCircle.setCenter(new google.maps.LatLng(selectedLat, selectedLng));
            setMapToSelectedLocation();

            // Also update the form values:
            document.getElementById('latForm').value = selectedLat;
            document.getElementById('lngForm').value = selectedLng;
        } else {
            errorText.textContent = "Unable to find the address. Please try again.";
        }
    });
}
/*
function instructionsAlert() {
    const text = "To create a jobsite, please enter the name, description, " +
    "and select a location on the map. You can also adjust the radius of " +
    "the jobsite using the slider. Once you are done, click on the 'Create " +
    "Jobsite' button to save your changes. To select a location, you can " +
    "either double click on the map, or enter the coordinates in the sidebar textboxes.";
    alert(text);
}
*/

function addEventListeners() {
    document.getElementById('radiusForm').addEventListener('input', (event) => {
        const radius = parseInt(event.target.value, 10);
        if (!isNaN(radius) && radius > 0 && radius <= 1000) {
            selectedJobsiteCircle.setRadius(radius); // only affect map
            document.getElementById('radiusValue').innerText = "Radius: " + radius;
        }
        else {
            document.getElementById('radiusValue').innerText = "Radius: Invalid";
        }
    });    

    document.getElementById('latForm').addEventListener('input', (event) => {
        selectedLat = event.target.value;
        selectedMarker.setPosition(new google.maps.LatLng(selectedLat, selectedLng));
        selectedJobsiteCircle.setCenter(new google.maps.LatLng(selectedLat, selectedLng));
    });

    document.getElementById('lngForm').addEventListener('input', (event) => {
        selectedLng = event.target.value;
        selectedMarker.setPosition(new google.maps.LatLng(selectedLat, selectedLng));
        selectedJobsiteCircle.setCenter(new google.maps.LatLng(selectedLat, selectedLng));
    });
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidenav');
    if (sidebar.style.width === '250px' || sidebar.style.width === '') {
        sidebar.style.width = '0';
    } else {
        sidebar.style.width = '250px';
    }
}

function confirmNoSave() {
    return confirm("Are you sure you want to leave without saving?")
}


function validateForm() {
    const nameInput = document.getElementById('nameInput').value;
    const descriptionInput = document.getElementById('descriptionInput').value;
    const latInput = parseFloat(document.getElementById('latForm').value);
    const lngInput = parseFloat(document.getElementById('lngForm').value);
    const radiusInput = parseInt(document.getElementById('radiusForm').value, 10);

    if (!nameInput || !descriptionInput || isNaN(latInput) || isNaN(lngInput) || isNaN(radiusInput)) {
        if(!nameInput) {
            document.getElementById("error4").innerHTML = "Please fill out the name box";
            return false;
        }
        if(!descriptionInput) {
            document.getElementById("error").innerHTML = "Please fill out the description box";
            return false;
        }
        if(isNaN(latInput)) {
            document.getElementById("error4").innerHTML = "Please fill out the latitude box";
            return false;
        }
        if(isNaN(lngInput)) {
            document.getElementById("error4").innerHTML = "Please fill out the longitude box";
            return false;
        }
        if(isNaN(radiusInput)) {
            document.getElementById("error4").innerHTML = "Please fill out the radius box or use the slider";
            return false;
        }
        return false;
    }

    if (nameInput.length > 50) {
        document.getElementById("error4").innerHTML = "Radius must be an integer greater than 0.";
        return false;
    }

    if (latInput < -90 || latInput > 90) {
        document.getElementById("error2").innerHTML = "Latitude must be a valid coordinate between -90 and 90.";
        return false;
    }

    if (lngInput < -180 || lngInput > 180) {
         document.getElementById("error3").innerHTML = "Longitude must be a valid coordinate between -180 and 180.";
        return false;
    }

    if (radiusInput <= 0 || !Number.isInteger(radiusInput) || radiusInput > 1000) {
        if(radiusInput <= 0) {
            document.getElementById("error4").innerHTML = "Radius must be an integer greater than 0.";
            return false;
        }
        if(radiusInput > 1000) {
            document.getElementById("error4").innerHTML = "Radius must be lest than 1000";
            return false;
        }
       
        return false;
    }
   

    return true;
}