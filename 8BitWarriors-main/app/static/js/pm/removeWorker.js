// Get DOM elements
const userSelect = document.getElementById('userSelect');
const jobsiteSelect = document.getElementById('jobsiteSelect');
const assignButton = document.getElementById('assignButton');
const resultMessage = document.getElementById('resultMessage');

let currentJobSites = [];
// Fetch users and jobsites from the backend on page load
document.addEventListener('DOMContentLoaded', function () {
    // Fetch users
    fetch('/getAllWorkerUsers')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(users => {
            console.log('Users fetched:', users); // Log the fetched users
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.UUID; // Set the value to the user's UUID
                option.textContent = user.username; // Set the display text to the username
                userSelect.appendChild(option); // Add the option to the dropdown
            });
        })
        .catch(error => {
            console.error('Error fetching users:', error);
            resultMessage.textContent = 'Failed to load users. Please try again later.';
            resultMessage.style.color = 'red';
        });

        const userUUID = userSelect.value;
    fetch('/getAssignedJobsitesPM', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            userUUID: userUUID
        }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch jobsites');
            }
            return response.json();
        })
        .then(jobsites => {
            jobsites.forEach(jobsite => {
                const option = document.createElement('option');
                option.value = jobsite.UUID; // Set the value to the jobsite's UUID
                option.textContent = jobsite.title; // Set the display text to the jobsite title
                jobsiteSelect.appendChild(option); // Add the option to the dropdown
            });
        });
});

// Handle form submission
// Handle form submission
document.getElementById('removeUserForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the default form submission

    const userUUID = userSelect.value;
    const jobsiteUUID = jobsiteSelect.value;

    // Validate inputs
    if (!userUUID || !jobsiteUUID) {
        resultMessage.textContent = 'Please select both a user and a jobsite.';
        resultMessage.style.color = 'red';
        return;
    }

    // Send request to remove the  user to jobsite
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
                throw new Error('Failed to assign user to jobsite');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                resultMessage.textContent = 'User successfully removed to the jobsite!';
                resultMessage.style.color = 'green';
            } else {
                resultMessage.textContent = 'Failed to remove user to jobsite.';
                resultMessage.style.color = 'red';
            }
        })
        .catch(error => {
            console.error('Error assigning user:', error);
            resultMessage.textContent = 'An error occurred while removing the user.';
            resultMessage.style.color = 'red';
        });
        updateList()
});
function fillAssignJobsites(selectedUser) {
    updateList()
}

function updateList() {
    const userUUID = userSelect.value;
    jobsiteSelect.innerHTML = '';
    // Send request to test if onchange works and send user to assigned to jobsite
    fetch('/getAssignedJobsitesPM', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            userUUID: userUUID
        }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch jobsites');
            }
            return response.json();
        })
        .then(jobsites => {
            jobsites.forEach(jobsite => {
                const option = document.createElement('option');
                option.value = jobsite.UUID; // Set the value to the jobsite's UUID
                option.textContent = jobsite.title; // Set the display text to the jobsite title
                jobsiteSelect.appendChild(option); // Add the option to the dropdown
            });
        });

}