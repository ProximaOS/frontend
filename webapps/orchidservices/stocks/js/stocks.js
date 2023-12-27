const API_KEY = 'ZEUGJ9PVVRXXbYAprAKL0HugAbMupCE7'; // Replace with your Polygon.io API key

// Function to fetch top gainers and losers
async function fetchTopStocks(type) {
  try {
    const response = await fetch(`https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/${type}?apiKey=${API_KEY}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

// Function to display top gainers and losers
function displayTopStocks(listId, stocks) {
  const list = document.getElementById(listId);
  list.innerHTML = '';
  stocks.forEach(stock => {
    const listItem = document.createElement('li');
    listItem.textContent = `${stock.ticker}: ${stock.lastTradePrice}`;
    list.appendChild(listItem);
  });
}

// Display top gainers and losers
async function displayStockData() {
  const topGainersData = await fetchTopStocks('gainers');
  const topLosersData = await fetchTopStocks('losers');

  if (topGainersData && topLosersData) {
    const topGainers = topGainersData.tickers.slice(0, 5);
    const topLosers = topLosersData.tickers.slice(0, 5);

    displayTopStocks('topGainersList', topGainers);
    displayTopStocks('topLosersList', topLosers);
  }
}

// Call function to display stock data
displayStockData();
