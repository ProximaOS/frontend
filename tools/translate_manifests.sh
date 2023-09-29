#!/bin/bash

ECHO_PREFIX="[OpenOrchid Translator]"
TRANSLATOR_PATH="./toolkit/translator"
TRANSLATOR_PATH_BACKING="../.."
LANGUAGES="af ga sq it ar ja az kn eu ko bn la be lv bg lt ca mk zh ms mt hr no cs fa da pl nl pt ro eo ru et sr tl sk fi sl fr es gl sw ka sv de ta el te gu th ht tr uk hi ur hu vi is cy id yi"

cd $TRANSLATOR_PATH
npm install
cd $TRANSLATOR_PATH_BACKING

rm -f $TRANSLATOR_LOG
echo "$ECHO_PREFIX This process might take from few minutes up to few hours so go get a cup of coffee and watch some fun videos to kill time..."

mkdir -p logs
for lang in $LANGUAGES; do
  echo "$ECHO_PREFIX Translating \"en-US\" to \"$lang\"..."
  node "$TRANSLATOR_PATH/translate_manifests.js" $lang >> "logs/translate-manifest-$(date +%FT%H-%M-%S).log"
done
