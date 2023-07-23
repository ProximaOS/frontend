#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <signal.h>
#include <rtl-sdr.h>

#define SAMPLE_RATE 2400000 // Sample rate in Hz (2.4 MHz)

rtlsdr_dev_t *dev = NULL;

void stop_fm_radio() {
  if (dev) {
    rtlsdr_cancel_async(dev);
    rtlsdr_close(dev);
    printf("FM radio stopped.\n");
    exit(0);
  }
}

void signal_handler(int signal) {
  stop_fm_radio();
}

int main(int argc, char *argv[]) {
  if (argc != 3) {
    printf("Usage: %s {start|stop} [<frequency_in_Hz>]\n", argv[0]);
    return -1;
  }

  char *mode = argv[1];
  unsigned int frequency = atoi(argv[2]);

  if (strcmp(mode, "start") == 0) {
    int ret;
    int tuner_gain = 0;

    // Initialize SDR device
    ret = rtlsdr_open(&dev, 0);
    if (ret < 0) {
      printf("Failed to open RTL-SDR device.\n");
      return -1;
    }

    // Set sample rate and frequency
    ret = rtlsdr_set_sample_rate(dev, SAMPLE_RATE);
    if (ret < 0) {
      printf("Failed to set sample rate.\n");
      rtlsdr_close(dev);
      return -1;
    }

    ret = rtlsdr_set_center_freq(dev, frequency);
    if (ret < 0) {
      printf("Failed to set frequency.\n");
      rtlsdr_close(dev);
      return -1;
    }

    // Enable auto-gain mode or set manual gain
    if (tuner_gain == 0) {
      ret = rtlsdr_set_tuner_gain_mode(dev, 0);
      if (ret < 0) {
        printf("Failed to set automatic gain.\n");
        rtlsdr_close(dev);
        return -1;
      }
    } else {
      ret = rtlsdr_set_tuner_gain_mode(dev, 1);
      if (ret < 0) {
        printf("Failed to set manual gain.\n");
        rtlsdr_close(dev);
        return -1;
      }

      ret = rtlsdr_set_tuner_gain(dev, tuner_gain * 10);
      if (ret < 0) {
        printf("Failed to set tuner gain.\n");
        rtlsdr_close(dev);
        return -1;
      }
    }

    // Start streaming I/Q samples
    ret = rtlsdr_reset_buffer(dev);
    if (ret < 0) {
      printf("Failed to reset buffer.\n");
      rtlsdr_close(dev);
      return -1;
    }

    printf("FM radio started at %u Hz. Press Ctrl+C to stop.\n", frequency);

    signal(SIGINT, signal_handler); // Setup signal handler to stop FM radio on Ctrl+C

    while (1) {
      // Now you can process the received samples and perform FM demodulation
      // Remember, FM demodulation is a complex signal processing task.
    }
  } else if (strcmp(mode, "stop") == 0) {
    stop_fm_radio();
  } else {
    printf("Invalid mode. Usage: %s {start|stop} [<frequency_in_Hz>]\n", argv[0]);
    return -1;
  }

  return 0;
}
