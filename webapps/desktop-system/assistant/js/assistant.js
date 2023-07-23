// Check if the browser supports the Web Speech API
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
  // Create a new SpeechRecognition object
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

  // Set the language for speech recognition
  recognition.lang = 'en-US';

  // Add an event listener for the result event
  recognition.addEventListener('result', (event) => {
    const transcript = event.results[0][0].transcript;
    console.log('You said:', transcript);

    // You can add your logic here to process the user's speech input and provide appropriate responses
  });

  // Start the speech recognition
  recognition.start();
} else {
  console.log('Web Speech API is not supported in this browser.');
}
