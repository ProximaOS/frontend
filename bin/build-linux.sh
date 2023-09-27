#!/bin/bash

set -e

./kernel/build.sh

for package in $(cat ./package-list.txt); do
  ./packages/$package/build.sh
done

./kernel/build-finish.sh
