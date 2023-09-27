#ifndef TIMERS_H
#define TIMERS_H

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <signal.h>

// Function prototypes
typedef void (*TimerCallback)(void *);

int setTimeout(TimerCallback callback, unsigned int milliseconds, void *data);
void clearTimeout(int timerId);
int setInterval(TimerCallback callback, unsigned int milliseconds, void *data);
void clearInterval(int timerId);

#endif
