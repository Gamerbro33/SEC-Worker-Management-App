// Get DOM elements
let users = [];
let jobsites = [];
const resultMessage = document.getElementById('resultMessage') || {
    textContent: '',
    style: { color: '' }
};

let currentJobSites = [];
// Fetch users and jobsites from the backend on page load
document.addEventListener('DOMContentLoaded', async function () {
    await getJobsites();
    await getWorkers();
    await getAssignments();
    populateUserColumn();
});

async function getWorkers() {
    try {
        const response = await fetch('/getAllWorkerUsers');
        if (!response.ok) {
            throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
        }
        users = await response.json(); // Update the global `users` array
        console.log('Users fetched:', users); // Log the fetched users
    } catch (error) {
        console.error('Error fetching users:', error);
        resultMessage.textContent = 'Failed to load users. Please try again later.';
        resultMessage.style.color = 'red';
    }
}

function populateUserColumn() {
    const userSelect = document.getElementById('user-column');

    addSearchBarUsers();

    users.forEach((user, i) => {
        const div = document.createElement('div');
        div.className = 'user-item';

        if (i % 2 !== 0) {
            div.classList.add('odd');
        }

        const title = document.createElement('h4');
        title.textContent = user.username;
        div.appendChild(title);

        div.addEventListener('click', () => { userClicked(user); });

        userSelect.appendChild(div);
    });
}

function addSearchBarUsers() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search users...';
    searchInput.id = 'user-search-input';

    const userSelect = document.getElementById('user-column');
    userSelect.prepend(searchInput);

    searchInput.addEventListener('input', function () {
        const filter = searchInput.value.toLowerCase();
        const userItems = userSelect.querySelectorAll('.user-item');

        userItems.forEach(item => {
            const usernameElement = item.querySelector('h4');
            if (usernameElement && usernameElement.textContent.toLowerCase().includes(filter)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

function addSearchBarJobs() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search jobsites...';
    searchInput.id = 'jobsite-search-input';

    const jobsiteSelect = document.getElementById('jobsite-column');
    jobsiteSelect.prepend(searchInput);

    searchInput.addEventListener('input', function () {
        const filter = searchInput.value.toLowerCase();
        const jobsiteItems = jobsiteSelect.querySelectorAll('.jobsite-item');

        jobsiteItems.forEach(item => {
            const titleElement = item.querySelector('h4');
            if (titleElement && titleElement.textContent.toLowerCase().includes(filter)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

async function getJobsites() {
    try {
        const response = await fetch('/getJobsitesForWorkers');
        if (!response.ok) {
            throw new Error(`Failed to fetch jobsites: ${response.status} ${response.statusText}`);
        }
        jobsites = await response.json(); // Update the global `jobsites` array
    } catch (error) {
        console.error('Error fetching jobsites:', error);
        resultMessage.textContent = 'Failed to load jobsites. Please try again later.';
        resultMessage.style.color = 'red';
    }
}

async function getAssignments() {
    try {
        for (const user of users) {
            const response = await fetch('/getAssignedJobsitesPMJSON', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userUUID: user.UUID }),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch assignments for user ${user.UUID}`);
            }

            const assignments = await response.json();
            user.assignments = assignments;
        }

        console.log('Users with assignments:', users);
    } catch (error) {
        console.error('Error fetching assignments:', error);
    }
}

function userClicked(user) {
    // clear previous selection highlight
    const allUserItems = document.querySelectorAll('.user-item');
    allUserItems.forEach(item => item.classList.remove('selected'));

    // highlight the clicked user
    const userSelect = document.getElementById('user-column');
    const userItems = userSelect.querySelectorAll('.user-item');

    userItems.forEach(item => {
        const usernameElement = item.querySelector('h4');
        if (usernameElement && usernameElement.textContent === user.username) {
            item.classList.add('selected');
        }
    });

    // Clear jobsite display and render jobsites for this user
    const jobsiteDiv = document.getElementById('jobsite-column');
    jobsiteDiv.innerHTML = '';

    addSearchBarJobs(); // Add the jobsite search bar

    jobsites.forEach(jobsite => {
        const jobsiteItem = document.createElement('div');
        jobsiteItem.className = 'jobsite-item';

        let isAssigned = false;
        user.assignments.forEach(assignment => {
            if (jobsite.UUID === assignment.UUID) {
                isAssigned = true;
            }
        });

        const title = document.createElement('h4');
        title.textContent = jobsite.title;
        jobsiteItem.appendChild(title);

        const addButton = document.createElement('button');
        const removeButton = document.createElement('button');
        addButton.textContent = 'Add';
        removeButton.textContent = 'Remove';

        if (isAssigned) {
            removeButton.onclick = () => removeWorker(user.UUID, jobsite.UUID);
            jobsiteItem.appendChild(removeButton);
            jobsiteItem.classList.add('assigned');
        } else {
            addButton.onclick = () => submitJobsiteSelection(user, jobsite.UUID);
            jobsiteItem.appendChild(addButton);
        }

        const viewButton = document.createElement('button');
        viewButton.textContent = 'View';
        viewButton.onclick = () => { viewJobsite(jobsite); }
        jobsiteItem.appendChild(viewButton);

        jobsiteDiv.appendChild(jobsiteItem);
    });
}

function viewJobsite(jobsite) {

    // because we have inconsistent naming...
    jobsite = {
        uuid: jobsite.UUID,
        name: jobsite.title,
        description: jobsite.description,
        latitude: jobsite.latitude,
        longitude: jobsite.longitude,
        radius: jobsite.radius,
    }

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

function removeWorker(userUUID, jobsiteUUID) {
    console.log("removeWorker called", userUUID, jobsiteUUID);
    if (!userUUID || !jobsiteUUID) {
        alert('Please select both a user and a jobsite.');
        return;
    }

    fetch('/removeUserFromJobsite', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            userUUID: userUUID,
            jobsiteUUID: jobsiteUUID,
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to remove user from jobsite');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            resultMessage.textContent = 'User successfully removed from the jobsite!';
            resultMessage.style.color = 'green';

            // Refresh and re-render that specific user
            const user = users.find(u => u.UUID === userUUID);
            refreshUserAssignments(user);
        } else {
            resultMessage.textContent = 'Failed to remove user from the jobsite.';
            resultMessage.style.color = 'red';
        }
    })
    .catch(error => {
        console.error('Error removing user:', error);
        resultMessage.textContent = 'An error occurred while removing the user.';
        resultMessage.style.color = 'red';
    });
}

function submitJobsiteSelection(user, jobsiteUUID) {
    console.log("submitJobsiteSelection called", user, jobsiteUUID);
    const userUUID = user.UUID;

    fetch('/assignUserToJobsite', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            userUUID: userUUID,
            jobsiteUUID: jobsiteUUID,
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to assign user to jobsite');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            resultMessage.textContent = 'User successfully assigned to the jobsite!';
            resultMessage.style.color = 'green';

            // Refresh and re-render that specific user
            refreshUserAssignments(user);
        } else {
            resultMessage.textContent = data.error || 'Failed to assign user.';
            resultMessage.style.color = 'red';
        }
    })
    .catch(error => {
        console.error('Error assigning user:', error);
        resultMessage.textContent = 'An error occurred while assigning the user.';
        resultMessage.style.color = 'red';
    });
}

function confirmLogout() {
    return confirm("Are you sure you want to log out?");
}

function refreshUserAssignments(user) {
    console.log(">> refreshUserAssignments CALLED with:", user);

    if (!user || !user.UUID) {
        console.warn("refreshUserAssignments called with invalid user:", user);
        return;
    }

    fetch('/getAssignedJobsitesPMJSON', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userUUID: user.UUID }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch updated assignments');
        }
        return response.json();
    })
    .then(assignments => {
        const realUser = users.find(u => u.UUID === user.UUID);
        if (!realUser) {
            console.warn("User not found in users[]:", user.UUID);
            return;
        }

        realUser.assignments = assignments;
        userClicked(realUser); // Re-renders
    })
    .catch(error => {
        console.error('Error updating user assignments:', error);
    });
}