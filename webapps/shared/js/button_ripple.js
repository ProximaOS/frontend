// Add click event listener to elements with .ripple-button class
const rippleButtons = document.querySelectorAll(".ripple-button");
rippleButtons.forEach((button) => {
  button.addEventListener("click", createRipple);
});

// Create ripple effect on click
function createRipple(event) {
  const button = event.currentTarget;

  // Create ripple element
  const ripple = document.createElement("span");
  ripple.classList.add("ripple");

  // Calculate ripple size based on button dimensions
  const buttonRect = button.getBoundingClientRect();
  const size = Math.max(buttonRect.width, buttonRect.height) * 2;

  // Position ripple element
  const posX = event.clientX - buttonRect.left - size / 2;
  const posY = event.clientY - buttonRect.top - size / 2;
  ripple.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    top: ${posY}px;
    left: ${posX}px;
  `;

  // Append ripple element to the button
  button.appendChild(ripple);

  // Add animation class to enable the ripple effect
  ripple.classList.add("animate");

  // Remove the ripple element after the animation is complete
  setTimeout(() => {
    ripple.remove();
  }, 1000);
}
