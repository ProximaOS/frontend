#ifndef FILE_WRITER_H
#define FILE_WRITER_H

#include <stdio.h>

void write_file(const char *filename, const char *content)
{
  FILE *file = fopen(filename, "w");

  if (file)
  {
    fputs(content, file);
    fclose(file);
  }
}

#endif /* FILE_WRITER_H */
