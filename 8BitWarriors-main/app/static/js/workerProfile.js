document.addEventListener('DOMContentLoaded', function () {
    console.log("DOMContentLoaded triggered: Page loaded.");

    // === Profile Picture Upload ===
    const uploadForm = document.getElementById('uploadFormBlob');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const fileInput = document.getElementById('profilePic');
            if (!fileInput || fileInput.files.length === 0) {
                console.error("No file selected.");
                return;
            }

            const formData = new FormData();
            formData.append('profilePic', fileInput.files[0]);

            fetch('/upload_profile_picture_blob', {
                method: 'POST',
                body: formData,
            })
            .then(response => response.json())


            .then(data => {
                if (data.success) {
                    alert('Profile picture uploaded successfully!');
            
                    const currentPfp = document.getElementById('currentPfp');
                    const currentPfpProfile = document.getElementById('currentPfpProfile'); // ✅ Also get profile image
            
                    if (currentPfp) {
                        const baseUrl = currentPfp.src.split('?')[0];
                        const newSrc = baseUrl + '?' + new Date().getTime();
                        currentPfp.src = newSrc;
            
                        // ✅ Update map marker if it exists
                        if (typeof userMarker !== 'undefined' && userMarker.setIcon) {
                            userMarker.setIcon({
                                url: newSrc,
                                scaledSize: new google.maps.Size(30, 30),
                                anchor: new google.maps.Point(25, 25)
                            });
                        }
                    }
            
                    if (currentPfpProfile) {
                        const baseUrlProfile = currentPfpProfile.src.split('?')[0];
                        currentPfpProfile.src = baseUrlProfile + '?' + new Date().getTime();
                    }
            
                } else {
                    alert('Upload failed: ' + data.error);
                }
            })
            


            .catch(error => {
                console.error('Error during fetch:', error);
            });
        });
    }

    // === Eye Icon SVGs ===
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

    // === Toggle Password Visibility Function ===
    function togglePasswordVisibility(inputId, iconElement) {
        const input = document.getElementById(inputId);
        if (!input) return;

        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        iconElement.innerHTML = isPassword ? eyeSlashIcon : eyeIcon;
    }

    // === Hook Up Toggles ===
    document.querySelectorAll('.toggle-password').forEach(toggle => {
        const inputId = toggle.getAttribute('data-input');
        toggle.innerHTML = eyeIcon;
        toggle.style.cursor = 'pointer';
        toggle.addEventListener('click', () => togglePasswordVisibility(inputId, toggle));
    });
});
