#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/types.h>
#include <sys/stat.h>

#ifdef _WIN32
#include <winsock2.h>
#include <io.h>
#pragma comment(lib, "ws2_32.lib")
#else
#include <arpa/inet.h>
#include <sys/socket.h>
#endif

#define PORT 8081
#define BUF_SIZE 1024

typedef struct
{
  const char *extension;
  const char *mime_type;
} MimeMap;

MimeMap mime_types[] = {
    {".html", "text/html"},
    {".htm", "text/html"},
    {".txt", "text/plain"},
    {".json", "text/json"},
    {".css", "text/css"},
    {".js", "text/javascript"},
    {".jpg", "image/jpeg"},
    {".jpeg", "image/jpeg"},
    {".png", "image/png"},
    {".webp", "image/webp"},
    {".gif", "image/gif"},
    {".pdf", "application/pdf"},
    {".ico", "image/x-icon"},
    {NULL, NULL}};

const char *get_mime_type(const char *path)
{
  const char *ext = strrchr(path, '.');
  if (ext)
  {
    for (int i = 0; mime_types[i].extension != NULL; i++)
    {
      if (strcmp(ext, mime_types[i].extension) == 0)
      {
        return mime_types[i].mime_type;
      }
    }
  }
  return "application/octet-stream"; // Default MIME type
}

void handle_request(int client_sock, const char *web_root)
{
  char buffer[BUF_SIZE];
  memset(buffer, 0, sizeof(buffer));
  read(client_sock, buffer, sizeof(buffer) - 1);
  printf("Received request:\n%s\n", buffer);

  char request_path[BUF_SIZE];
  sscanf(buffer, "GET %s HTTP", request_path);

  char file_path[BUF_SIZE];
  sprintf(file_path, "%s/%s", web_root, request_path);

  int fd = open(file_path, O_RDONLY);

  if (fd == -1)
  {
    const char *not_found_response = "HTTP/1.1 404 Not Found\r\nContent-Type: text/html\r\n\r\n<html><body><h1>404 Not Found</h1></body></html>";
    write(client_sock, not_found_response, strlen(not_found_response));
  }
  else
  {
    const char *mime_type = get_mime_type(file_path);

    char ok_response[BUF_SIZE];
    sprintf(ok_response, "HTTP/1.1 200 OK\r\nContent-Type: %s\r\n\r\n", mime_type);
    write(client_sock, ok_response, strlen(ok_response));

    char file_buffer[BUF_SIZE];
    int bytes_read;
    while ((bytes_read = read(fd, file_buffer, sizeof(file_buffer))) > 0)
    {
      write(client_sock, file_buffer, bytes_read);
    }

    close(fd);
  }

#ifdef _WIN32
  closesocket(client_sock);
#else
  close(client_sock);
#endif
}

int main(int argc, char *argv[])
{
  if (argc != 2)
  {
    printf("Usage: %s <path_to_web_content>\n", argv[0]);
    return -1;
  }

#ifdef _WIN32
  WSADATA wsaData;
  if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0)
  {
    perror("WSAStartup failed");
    return -1;
  }
#endif

  int server_sock, client_sock;
  struct sockaddr_in server_addr, client_addr;
  socklen_t client_addr_size = sizeof(client_addr);

  server_sock = socket(AF_INET, SOCK_STREAM, 0);
  if (server_sock == -1)
  {
    perror("Socket creation failed");
#ifdef _WIN32
    WSACleanup();
#endif
    return -1;
  }

  memset(&server_addr, 0, sizeof(server_addr));
  server_addr.sin_family = AF_INET;
  server_addr.sin_addr.s_addr = htonl(INADDR_ANY);
  server_addr.sin_port = htons(PORT);

  if (bind(server_sock, (struct sockaddr *)&server_addr, sizeof(server_addr)) == -1)
  {
    perror("Binding failed");
#ifdef _WIN32
    closesocket(server_sock);
    WSACleanup();
#else
    close(server_sock);
#endif
    return -1;
  }

  if (listen(server_sock, 5) == -1)
  {
    perror("Listening failed");
#ifdef _WIN32
    closesocket(server_sock);
    WSACleanup();
#else
    close(server_sock);
#endif
    return -1;
  }

  printf("Server started at port %d\n", PORT);

  char *web_root = argv[1];

  while (1)
  {
    client_sock = accept(server_sock, (struct sockaddr *)&client_addr, &client_addr_size);
    if (client_sock == -1)
    {
      perror("Accepting connection failed");
      break;
    }

    handle_request(client_sock, web_root);
  }

#ifdef _WIN32
  WSACleanup();
  closesocket(server_sock);
#else
  close(server_sock);
#endif

  return 0;
}
