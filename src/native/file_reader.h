#ifndef FILE_READER_H
#define FILE_READER_H

#include <stdio.h>
#include <stdlib.h>

typedef struct
{
  char *data;
  size_t size;
} FileContent;

FileContent read_file(const char *filename)
{
  FileContent content = {NULL, 0};
  FILE *file = fopen(filename, "r");

  if (file)
  {
    fseek(file, 0, SEEK_END);
    content.size = ftell(file);
    rewind(file);

    content.data = (char *)malloc(content.size + 1);
    if (content.data)
    {
      fread(content.data, 1, content.size, file);
      content.data[content.size] = '\0';
    }

    fclose(file);
  }

  return content;
}

void free_file_content(FileContent content)
{
  free(content.data);
}

#endif /* FILE_READER_H */
