// Get URL and proxy from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const websiteUrl = urlParams.get('content');
const proxyUrl = urlParams.get('proxy');

// Define default proxy if not provided
const corsProxyUrl = proxyUrl || 'https://corsproxy.io/?';

// Make the request
fetch(corsProxyUrl + encodeURIComponent(websiteUrl))
  .then(response => response.text())
  .then(html => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const articleContent = doc.querySelector('article');

    // Create a temporary element to hold the HTML content
    const tempElement = document.createElement('div');
    tempElement.appendChild(articleContent.cloneNode(true)); // Clone to avoid altering the original

    // Remove IDs and classes from all elements
    tempElement.querySelectorAll('*').forEach(el => {
      el.removeAttribute('id');
      el.removeAttribute('class');
    });

    // Append the modified content to the main view
    const main = document.getElementById('main');
    main.appendChild(tempElement);
  })
  .catch(error => {
    console.error('Error fetching website:', error);
  });
