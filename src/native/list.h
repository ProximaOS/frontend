#ifndef LIST_H
#define LIST_H

#ifdef _WIN32
#include <windows.h>
#else
#include <sys/types.h>
#include <dirent.h>
#endif

typedef struct
{
  char **files;
  int count;
} FileList;

FileList list_files(const char *path)
{
  FileList result;
  result.files = NULL;
  result.count = 0;

#ifdef _WIN32
  WIN32_FIND_DATA findFileData;
  HANDLE hFind = FindFirstFile(strcat(strcat(path, "\\*"), "*"), &findFileData);

  if (hFind == INVALID_HANDLE_VALUE)
  {
    return result;
  }
  else
  {
    do
    {
      if (!(findFileData.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY))
      {
        result.files = realloc(result.files, (result.count + 1) * sizeof(char *));
        result.files[result.count] = strdup(findFileData.cFileName);
        result.count++;
      }
    } while (FindNextFile(hFind, &findFileData) != 0);
    FindClose(hFind);
  }

#else
  struct dirent *entry;
  DIR *dp = opendir(path);

  if (dp == NULL)
  {
    return result;
  }

  while ((entry = readdir(dp)))
  {
    if (entry->d_type == DT_REG)
    {
      result.files = realloc(result.files, (result.count + 1) * sizeof(char *));
      result.files[result.count] = strdup(entry->d_name);
      result.count++;
    }
  }

  closedir(dp);
#endif

  return result;
}

void free_file_list(FileList list)
{
  for (int i = 0; i < list.count; i++)
  {
    free(list.files[i]);
  }
  free(list.files);
}

#endif /* LIST_H */
