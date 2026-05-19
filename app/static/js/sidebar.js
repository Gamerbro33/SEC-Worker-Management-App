document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.getElementById("sidebar");

    // Dynamically create the toggle button
    const toggleBtn = document.createElement("button");
    toggleBtn.id = "toggleSidebar";
    toggleBtn.className = "toggle-btn";
    toggleBtn.textContent = "☰";
    sidebar.appendChild(toggleBtn);

    toggleBtn.addEventListener("click", function () {
        sidebar.classList.toggle("active"); // Toggle the sidebar open/close
    });
});
