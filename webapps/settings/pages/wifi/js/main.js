const si = require('systeminformation');

window.addEventListener('DOMContentLoaded', () => {
  // Fetch available networks and populate the list
  const availableNetworksList = document.getElementById('available-networks');

  async function searchNetworks() {
    try {
      const networks = await si.wifiNetworks();
      availableNetworksList.innerHTML = '';
      networks.forEach(network => {
        // Convert signal strength to percentage
        const signalStrengthPercentage = network.quality;

        const listItem = document.createElement('li');
        listItem.dataset.icon = `wifi-${Math.round(
          signalStrengthPercentage / 25
        )}`;
        availableNetworksList.appendChild(listItem);

        const listName = document.createElement('p');
        listName.textContent = network.ssid;
        listItem.appendChild(listName);

        const listSecurity = document.createElement('p');
        listSecurity.textContent = network.security[0];
        listItem.appendChild(listSecurity);
      });
    } catch (error) {
      console.error('Error fetching available networks:', error);
    }
  }
  setInterval(searchNetworks, 3000);

  // Add event listener to the Wi-Fi switch
  const wifiSwitch = document.getElementById('wifi-switch');
  wifiSwitch.addEventListener('change', () => {
    const isChecked = wifiSwitch.checked;
    // Handle Wi-Fi switch change event here
    console.log('Wi-Fi switch state changed:', isChecked);
  });

  // Add event listener to the reload button
  const wifiReload = document.getElementById('reload-button');
  wifiReload.addEventListener('click', searchNetworks);
});
