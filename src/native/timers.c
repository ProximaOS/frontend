#include "timers.h"

// Global variables to keep track of timers
int timerCount = 0;

typedef struct
{
  TimerCallback callback;
  unsigned int interval;
  void *data;
  int isActive;
} Timer;

Timer timers[100];

void timer_handler(int signum)
{
  for (int i = 0; i < timerCount; i++)
  {
    if (timers[i].isActive)
    {
      timers[i].callback(timers[i].data);
    }
  }
}

int setTimeout(TimerCallback callback, unsigned int milliseconds, void *data)
{
  Timer timer;
  timer.callback = callback;
  timer.interval = milliseconds;
  timer.data = data;
  timer.isActive = 1;
  timers[timerCount++] = timer;

  signal(SIGALRM, timer_handler);
  ualarm(milliseconds * 1000, 0);

  return timerCount - 1;
}

void clearTimeout(int timerId)
{
  if (timerId >= 0 && timerId < timerCount)
  {
    timers[timerId].isActive = 0;
  }
}

int setInterval(TimerCallback callback, unsigned int milliseconds, void *data)
{
  int timerId = setTimeout(callback, milliseconds, data);
  timers[timerId].isActive = 1;
  return timerId;
}

void clearInterval(int timerId)
{
  clearTimeout(timerId);
}
