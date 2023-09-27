#include <iostream>
#include <vector>
#include <string>
#include <cstdio>
#include <cstring>
#include <unistd.h>
#include <sys/wait.h>
#include <signal.h>

std::vector<std::string> get_args(int argc, char *argv[])
{
  std::vector<std::string> args;
  for (int i = 1; i < argc; i++)
  {
    args.push_back(argv[i]);
  }
  return args;
}

int main(int argc, char *argv[])
{
  if (argc < 2)
  {
    std::cout << "Usage: " << argv[0] << " <program> [arg1] [arg2] ... [argn]" << std::endl;
    return 1;
  }

  std::vector<std::string> args = get_args(argc, argv);
  std::string program = args[0];
  args.erase(args.begin());

  pid_t pid = fork();
  if (pid == 0)
  {
    // child process
    char *arg_list[args.size() + 2];
    arg_list[0] = const_cast<char *>(program.c_str());
    for (unsigned int i = 0; i < args.size(); i++)
    {
      arg_list[i + 1] = const_cast<char *>(args[i].c_str());
    }
    arg_list[args.size() + 1] = NULL;
    execvp(program.c_str(), arg_list);
  }
  else if (pid > 0)
  {
    // parent process
    int status;
    wait(&status);
    if (WIFEXITED(status))
    {
      // check if the child terminated normally
      if (WEXITSTATUS(status) == 0)
      {
        // check if the child exit status is 0 (success)
        std::cout << program << " terminated successfully" << std::endl;
        return 0;
      }
      else
      {
        // if child terminated with exit status != 0, re-run the program
        std::cout << program << " terminated with exit status " << WEXITSTATUS(status) << std::endl;
        std::cout << "Re-running " << program << " with the same arguments" << std::endl;
        pid_t new_pid = fork();
        if (new_pid == 0)
        {
          // child process
          char *arg_list[args.size() + 2];
          arg_list[0] = const_cast<char *>(program.c_str());
          for (unsigned int i = 0; i < args.size(); i++)
          {
            arg_list[i + 1] = const_cast<char *>(args[i].c_str());
          }
          arg_list[args.size() + 1] = NULL;
          execvp(program.c_str(), arg_list);
        }
        else if (new_pid > 0)
        {
          // parent process
          int new_status;
          wait(&new_status);
        }
        else
        {
          std::cout << "Error: Failed to fork process." << std::endl;
          return 1;
        }
      }
    }
    else
    {
      // if child terminated due to a signal, check if the process is already running
      std::cout << program << " terminated due to signal " << WTERMSIG(status) << std::endl;
      pid_t check_pid = fork();
      if (check_pid == 0)
      {
        // child process
        // use the pgrep command to check if the process is already running
        execlp("pgrep", "pgrep", "-f", program.c_str(), NULL);
      }
      else if (check_pid > 0)
      {
        // parent process
        int check_status;
        wait(&check_status);
        if (WEXITSTATUS(check_status) == 1)
        {
          // if pgrep returns 1, the process is not running and can be re-run
          std::cout << program << " is not running" << std::endl;
          std::cout << "Re-running " << program << " with the same arguments" << std::endl;
          pid_t new_pid = fork();
          if (new_pid == 0)
          {
            // child process
            char *arg_list[args.size() + 2];
            arg_list[0] = const_cast<char *>(program.c_str());
            for (unsigned int i = 0; i < args.size(); i++)
            {
              arg_list[i + 1] = const_cast<char *>(args[i].c_str());
            }
            arg_list[args.size() + 1] = NULL;
            execvp(program.c_str(), arg_list);
          }
          else if (new_pid > 0)
          {
            // parent process
            int new_status;
            wait(&new_status);
          }
          else
          {
            std::cout << "Error: Failed to fork process." << std::endl;
            return 1;
          }
        }
        else
        {
          std::cout << program << " is already running" << std::endl;
          return 0;
        }
      }
      else
      {
        std::cout << "Error: Failed to fork process." << std::endl;
        return 1;
      }
    }
  }
  else
  {
    std::cout << "Error: Failed to fork process." << std::endl;
    return 1;
  }
  return 0;
}
