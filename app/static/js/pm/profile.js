document.addEventListener('DOMContentLoaded', function () {
    console.log("DOMContentLoaded triggered: Page loaded.");

    const uploadForm = document.getElementById('uploadFormBlob');
    if (!uploadForm) {
        console.error("Upload form (uploadFormBlob) not found!");
        return;
    } else {
        console.log("Upload form found.");
    }

    uploadForm.addEventListener('submit', function (event) {
        event.preventDefault();
        console.log("Upload form submitted.");

        const fileInput = document.getElementById('profilePic');
        if (!fileInput) {
            console.error("File input (profilePic) not found!");
            return;
        }
        if (fileInput.files.length === 0) {
            console.error("No file selected in the file input.");
            return;
        }
        console.log("File selected:", fileInput.files[0]);

        const formData = new FormData();
        formData.append('profilePic', fileInput.files[0]);
        console.log("FormData prepared, initiating fetch to /upload_profile_picture_blob");

        fetch('/upload_profile_picture_blob', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            console.log("Fetch response received:", response);
            return response.json();
        })
        .then(data => {
            console.log("JSON data received from server:", data);
            if (data.success) {
                alert('Profile picture uploaded successfully!');
                const currentPfp = document.getElementById('currentPfp');
                if (!currentPfp) {
                    console.error("Profile picture element (currentPfp) not found!");
                    return;
                }
                console.log("Before update, currentPfp.src =", currentPfp.src);
                const baseUrl = currentPfp.src.split('?')[0];
                currentPfp.src = baseUrl + '?' + new Date().getTime();
                console.log("After update, currentPfp.src =", currentPfp.src);
            } else {
                console.error("Upload failed:", data.error);
                alert('Upload failed: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error during fetch:', error);
        });
        window.location.reload();
    });
});

// Define the icons
const eyeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
</svg>`;

const eyeSlashIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 012.46-4.362M6.1 6.1l11.8 11.8M15 12a3 3 0 00-3-3m0 0a3 3 0 00-2.121.879M9 15l-3-3m12-3l3 3" />
</svg>`;

// Define toggle function
function togglePasswordVisibility(input, toggle) {
    if (input.type === 'password') {
        input.type = 'text';
        toggle.innerHTML = eyeSlashIcon;
    } else {
        input.type = 'password';
        toggle.innerHTML = eyeIcon;
    }
}

// Attach to all toggle icons
document.querySelectorAll('.toggle-password').forEach((toggle, i) => {
    const input = toggle.previousElementSibling;
    toggle.innerHTML = eyeIcon;
    toggle.style.cursor = 'pointer';
    toggle.addEventListener('click', () => togglePasswordVisibility(input, toggle));
});

function togglePasswordVisibility(inputId, iconElement) {
    const input = document.getElementById(inputId);
  
    if (input) {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
  
      iconElement.innerHTML = isPassword
        ? `<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                   d="M13.875 18.825A10.05 10.05 0 0112 19c-4.418 0-8.167-2.885-9.542-7 0.574-1.77 1.636-3.32 3.042-4.505M9.88 9.88a3 3 0 104.24 4.24M6.1 6.1l11.8 11.8M17.9 17.9a9.965 9.965 0 002.642-4.275c-1.05-3.22-4.267-6.125-8.542-6.125-.818 0-1.61.112-2.368.32" />
           </svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                   d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm7.5 0c-1.667 4.5-6 7.5-10.5 7.5S3.667 16.5 2 12c1.667-4.5 6-7.5 10.5-7.5s8.833 3 10.5 7.5z" />
           </svg>`;
    }
  }
  