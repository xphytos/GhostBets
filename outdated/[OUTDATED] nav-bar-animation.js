document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".main-nav");
  const indicator = document.querySelector(".nav-indicator");
  const links = document.querySelectorAll(".main-nav a");

  function updateIndicator(link) {
    const linkRect = link.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();

    // Calculate the new position and width of the indicator
    const newLeft = linkRect.left - navRect.left;
    const newWidth = linkRect.width;

    // Immediately set the position and width of the indicator
    indicator.style.transition = "none"; // Disable animation
    indicator.style.left = `${newLeft}px`;
    indicator.style.width = `${newWidth}px`;
  }

  function initializeIndicator() {
    const activeLink = document.querySelector(".main-nav a.active");
    if (activeLink) {
      updateIndicator(activeLink); // Set the indicator to match the active link
    }
  }

  // Add click event listeners to update the indicator
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      // Remove the active class from all links
      links.forEach((link) => link.classList.remove("active"));

      // Add the active class to the clicked link
      link.classList.add("active");

      // Update the indicator position and width
      updateIndicator(link);
    });
  });

  // Initialize the indicator on page load
  initializeIndicator();
});
