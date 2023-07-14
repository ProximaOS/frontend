function showGibberish(message, element) {
  const gibberishChars = ["@", "#", "!", "?", "%", "*", "+", "-", ".", ":", ";", "^", "~"];
  const gibberishDuration = 50; // Time for each gibberish character to appear in milliseconds
  const transitionDuration = 100; // Time for the transition from gibberish to message in milliseconds

  // Generate a random gibberish string of the same length as the message
  const gibberish = Array.from(message).map(char => gibberishChars[Math.floor(Math.random() * gibberishChars.length)]).join('');

  // Show the gibberish string in the specified element
  element.textContent = gibberish;

  // Set up a timeout to transition from the gibberish to the message
  setTimeout(() => {
    // Calculate the number of steps needed to transition from gibberish to message
    const numSteps = message.length - 1;

    // For each step, replace one gibberish character with the corresponding message character
    for (let i = 0; i < numSteps; i++) {
      setTimeout(() => {
        const gibberishChars = element.textContent.split('');
        gibberishChars[i] = message.charAt(i);
        element.textContent = gibberishChars.join('');
      }, i * gibberishDuration);
    }
  }, gibberishDuration);

  // Set a timeout to remove the gibberish after the transition is complete
  setTimeout(() => {
    element.textContent = message;
  }, gibberishDuration + (message.length - 1) * gibberishDuration + transitionDuration);
}
