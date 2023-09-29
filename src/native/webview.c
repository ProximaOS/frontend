#include <math.h>
#include <stdio.h>
#include "SDL2/SDL.h"
#include "SDL2/SDL_ttf.h"
// #include <curl/curl.h>
// #include <libxml     /HTMLParser.h>
// #include <string.h>

void drawText(SDL_Renderer *renderer, const char *text, int x, int y, const char *fontPath, int fontSize, SDL_Color textColor, int line_height)
{
  TTF_Font *font = TTF_OpenFont(fontPath, fontSize);

  if (font == NULL)
  {
    printf("Failed to load font: %s\n", TTF_GetError());
    return;
  }

  SDL_Surface *surface = TTF_RenderText_Solid(font, text, textColor); // 800 is the wrap length, adjust as needed
  if (surface == NULL)
  {
    printf("Failed to create surface: %s\n", TTF_GetError());
    TTF_CloseFont(font);
    return;
  }

  SDL_Texture *texture = SDL_CreateTextureFromSurface(renderer, surface);
  if (texture == NULL)
  {
    printf("Failed to create texture: %s\n", SDL_GetError());
    SDL_FreeSurface(surface);
    TTF_CloseFont(font);
    return;
  }

  SDL_Rect rect = {x, y, surface->w, surface->h};
  if (line_height != NULL)
  {
    rect.h = line_height;
  }

  SDL_RenderCopy(renderer, texture, NULL, &rect);

  // Clean up
  SDL_FreeSurface(surface);
  SDL_DestroyTexture(texture);
  TTF_CloseFont(font);
}

void drawCircle(SDL_Renderer *renderer, int x, int y, int radius)
{
  for (int dy = 1; dy <= radius; dy++)
  {
    int dx = floor(sqrt((2.0 * radius * dy) - (dy * dy)));
    SDL_RenderDrawLine(renderer, x - dx, y + dy - radius, x + dx, y + dy - radius);
    SDL_RenderDrawLine(renderer, x - dx, y - dy + radius, x + dx, y - dy + radius);
  }
}

void drawRect(SDL_Renderer *renderer, int x, int y, int w, int h, int border_radius)
{
  SDL_SetRenderDrawColor(renderer, 255, 255, 255, 255); // Set color (white in this case)

  // Draw the four rounded corners
  drawCircle(renderer, x + border_radius, y + border_radius, border_radius);
  drawCircle(renderer, x + w - border_radius, y + border_radius, border_radius);
  drawCircle(renderer, x + border_radius, y + h - border_radius, border_radius);
  drawCircle(renderer, x + w - border_radius, y + h - border_radius, border_radius);

  // Draw the center rectangle
  SDL_Rect center = {x + border_radius, y, w - 2 * border_radius, h};
  SDL_RenderFillRect(renderer, &center);

  SDL_Rect center2 = {x, y + border_radius, w, h - 2 * border_radius};
  SDL_RenderFillRect(renderer, &center2);
}

// size_t WriteCallback(void *contents, size_t size, size_t nmemb, void *userp)
// {
//   ((char *)userp)[0] = '\0';
//   strncat((char *)userp, (char *)contents, size * nmemb);
//   return size * nmemb;
// }

// void initCurlWeb()
// {
  // CURL *curl;
  // CURLcode res;

  // curl_global_init(CURL_GLOBAL_DEFAULT);

  // curl = curl_easy_init();
  // if (curl)
  // {
  //   char url[] = "http://example.com"; // Replace with your desired URL

  //   curl_easy_setopt(curl, CURLOPT_URL, url);

  //   char buffer[100000]; // Adjust the buffer size as needed
  //   buffer[0] = '\0';

  //   curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
  //   curl_easy_setopt(curl, CURLOPT_WRITEDATA, buffer);

  //   res = curl_easy_perform(curl);

  //   if (res != CURLE_OK)
  //     fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
  //   else
  //     printf("%s\n", buffer);

  //   curl_easy_cleanup(curl);
  // }

  // curl_global_cleanup();
// }

#ifdef _WIN32
int WinMain(int argc, char *argv[])
#else
int SDL_main(int argc, char *argv[])
#endif
{
  SDL_Init(SDL_INIT_VIDEO);

  SDL_Window *window = SDL_CreateWindow("Orchid WebVision", SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, 320, 640, SDL_WINDOW_RESIZABLE);
  SDL_Renderer *renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_ACCELERATED);

  SDL_SetHint(SDL_HINT_VIDEO_HIGHDPI_DISABLED, "0");

  float dpi;
  SDL_GetDisplayDPI(0, NULL, &dpi, NULL); // Get the DPI for the default display

  // Calculate the scaling factor based on the DPI
  float scalingFactor = dpi / 96.0; // Assuming 96 DPI is 100% scale

  // Set the logical size and scale
  SDL_RenderSetLogicalSize(renderer, 320, 640);
  SDL_RenderSetScale(renderer, scalingFactor, scalingFactor);

  // Initialize the TTF library
  if (TTF_Init() < 0)
  {
    SDL_Log("Couldn't initialize TTF: %s\n", SDL_GetError());
    SDL_Quit();
    return (2);
  }

  // initCurlWeb();

  SDL_Event event;
  int quit = 0;

  while (!quit)
  {
    while (SDL_PollEvent(&event))
    {
      if (event.type == SDL_QUIT)
      {
        quit = 1;
      }
      if (event.type == SDL_WINDOWEVENT)
      {
        if (event.window.event == SDL_WINDOWEVENT_RESIZED)
        {
          // Handle window resize event
          int newWidth = event.window.data1;
          int newHeight = event.window.data2;
          SDL_RenderSetLogicalSize(renderer, newWidth, newHeight);
        }
      }
    }

    SDL_SetRenderDrawColor(renderer, 239, 245, 255, 255); // Set background color (black in this case)
    SDL_RenderClear(renderer);

    SDL_Color textColor = {51, 51, 51, 255}; // White color
    drawText(renderer, "Control Center", 20, 90, "fonts/JaliArabic-Regular.ttf", 24, textColor, 30);

    drawRect(renderer, 15, 130, 140, 65, 20);
    drawRect(renderer, 15, 205, 140, 65, 20);
    drawRect(renderer, 165, 130, 140, 140, 20);

    SDL_RenderPresent(renderer);
  }

  SDL_DestroyRenderer(renderer);
  SDL_DestroyWindow(window);
  SDL_Quit();

  return 0;
}
