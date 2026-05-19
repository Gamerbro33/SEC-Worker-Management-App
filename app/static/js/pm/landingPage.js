currentJobSites = [];

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

window.onload = () => {
    showLoadingIndicator();
    getJobsites();
}

async function getJobsites() {
    try {
        const response = await fetch('/api/getJobsitesForWorkers');
        const data = await response.json();
        currentJobSites = data.map(element => new Jobsite(...element));
        createCards();
    } catch (error) {
        console.error('internal server error:', error);
        //alert("An error occurred while fetching jobsites.");
    } finally {
        hideLoadingIndicator();
    }
}

function viewJobsite(jobsite) {
    fetch('/viewJobsite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobsite)
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;
        } else {
            return response.json(); // Handle non-redirect responses if needed
        }
    })
    .catch(error => {
        console.error('Error when sending packet:', error);
        //alert("An error occurred when requesting to view a jobsite");
    });
}

function deleteJobsite(jobsite) {
    fetch('/deleteJobsite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobsite)
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;
        } else {
            return response.json(); // Handle non-redirect responses if needed
        }
    })
    .catch(error => {
        console.error('Error when sending packet:', error);
        //alert("An error occurred when requesting to view a jobsite");
    });
}

function editJobsite(jobsite) {
    fetch('/editJobsite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobsite)
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;
        } else {
            return response.json(); // Handle non-redirect responses if needed
        }
    })
    .catch(error => {
        console.error('Error when sending packet:', error);
        //alert("An error occurred when requesting to edit a jobsite");
    });
}

function assignUsers(jobsite) {
    // Redirect to the worker management/assignUsers page, passing the jobsite ID
    window.location.href = `/assignUsers?jobsiteId=${jobsite.uuid}`;
}

function createCards() {
    const container = document.getElementById('cards-container');
    container.innerHTML = ''; // Clear existing cards

    currentJobSites.forEach(jobsite => {
        const card = document.createElement('div');
        card.className = 'jobsite-card';

        const title = document.createElement('h2');
        title.textContent = jobsite.name;
        card.appendChild(title);

        const description = document.createElement('p');
        description.textContent = jobsite.description;
        card.appendChild(description);

        // Create a div for the button row
        const buttonRow = document.createElement('div');
        buttonRow.className = 'button-row';

        const viewButton = document.createElement('button');
        viewButton.textContent = 'View';
        viewButton.onclick = () => { viewJobsite(jobsite); }
        buttonRow.appendChild(viewButton);

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => { editJobsite(jobsite); }
        buttonRow.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => { deleteJobsite(jobsite); }
        buttonRow.appendChild(deleteButton);

        const assignedButton = document.createElement('button');
        assignedButton.textContent = 'Workers';
        assignedButton.onclick = () => { showAssignedUsers(jobsite.uuid); }
        assignedButton.className = 'view-workers-btn'; // Optional for styling
        buttonRow.appendChild(assignedButton);

        // Append the button row to the card
        card.appendChild(buttonRow);

        container.appendChild(card);
    });
}

function showLoadingIndicator() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
    }
}

function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

function confirmLogout() {
    return confirm("Are you sure you want to log out?");
}

function showAssignedUsers(jobsiteUUID) {
    console.log("Sent jobsiteUUID:", jobsiteUUID);
    fetch('/getAssignedUsersForJobsite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ jobsiteUUID: jobsiteUUID })
    })
    .then(response => response.json())
    .then(data => {
        const workerList = document.getElementById('workerList');
        workerList.innerHTML = '';
        data.forEach(worker => {
            const li = document.createElement('li');
            li.textContent = worker.username;
            workerList.appendChild(li);
        });
        document.getElementById('workerModal').style.display = 'block';
    })
    .catch(error => {
        console.error('Error fetching assigned users:', error);
    });
}

function closeModal() {
    document.getElementById('workerModal').style.display = 'none';
}
