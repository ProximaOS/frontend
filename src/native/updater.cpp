#include <chrono>
#include <fstream>
#include <iostream>
#include <string>
#include <thread>

#include <curl/curl.h>

// Check for updates every 10 minutes
constexpr std::chrono::minutes kUpdateCheckInterval(10);

// Write callback function for CURL
size_t writeCallback(char *ptr, size_t size, size_t nmemb, void *userdata)
{
  if (userdata)
  {
    std::ostream &os = *static_cast<std::ostream *>(userdata);
    std::streamsize len = size * nmemb;
    if (os.write(ptr, len))
    {
      return len;
    }
  }
  return 0;
}

// Retrieve the update list from the server
std::string retrieveUpdateList()
{
  CURL *curl;
  CURLcode res;
  std::string updateList;

  curl = curl_easy_init();
  if (curl)
  {
    curl_easy_setopt(curl, CURLOPT_URL, "https://openorchid.github.io/dist/orchidos/update-list.txt");
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, &writeCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &updateList);
    res = curl_easy_perform(curl);
    curl_easy_cleanup(curl);
  }

  return updateList;
}

// Parse the update list and get the next update
bool getNextUpdate(const std::string &updateList, std::string &updateFilename)
{
  static size_t currentPos = 0;

  size_t newlinePos = updateList.find('\n', currentPos);
  if (newlinePos == std::string::npos)
  {
    return false;
  }

  updateFilename = updateList.substr(currentPos, newlinePos - currentPos);
  currentPos = newlinePos + 1;
  return true;
}

// Download an update from the server
void downloadUpdate(const std::string &updateFilename)
{
  CURL *curl;
  CURLcode res;
  std::ofstream updateFile;

  curl = curl_easy_init();
  if (curl)
  {
    std::string updateUrl = "https://openorchid.github.io/dist/orchidos/" + updateFilename;
    curl_easy_setopt(curl, CURLOPT_URL, updateUrl.c_str());
    updateFile.open(updateFilename);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, &writeCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &updateFile);
    res = curl_easy_perform(curl);
    curl_easy_cleanup(curl);
    updateFile.close();
  }
}

// Install the downloaded updates
void installUpdates()
{
  // Extract the update files and install them
  std::string extractCommand = "tar -xzf update.tar.gz -C /system";
  if (system(extractCommand.c_str()) != 0)
  {
    std::cerr << "Error extracting update file" << std::endl;
  }
  else
  {
    // Restart the system
    std::string restartCommand = "reboot";
    if (system(restartCommand.c_str()) != 0)
    {
      std::cerr << "Error rebooting the system" << std::endl;
    }
  }
}

int main()
{
  while (true)
  {
    // Retrieve the update list
    std::string updateList = retrieveUpdateList();

    // Get the latest update
    std::string updateFilename;
    if (getNextUpdate(updateList, updateFilename))
    {
      // Download the update
      downloadUpdate(updateFilename);

      // Install the update
      installUpdates();
    }

    // Sleep for the update check interval
    std::this_thread::sleep_for(kUpdateCheckInterval);
  }

  return 0;
}
