$ECHO_PREFIX = "[OpenOrchid Translator]"
$TRANSLATOR_PATH = "./toolkit/translator"
$TRANSLATOR_PATH_BACKING = "../.."
$LANGUAGES = "af", "ga", "sq", "it", "ar", "ja", "az", "kn", "eu", "ko", "bn", "la", "be", "lv", "bg", "lt", "ca", "mk", "zh", "ms", "mt", "hr", "no", "cs", "fa", "da", "pl", "nl", "pt", "ro", "eo", "ru", "et", "sr", "tl", "sk", "fi", "sl", "fr", "es", "gl", "sw", "ka", "sv", "de", "ta", "el", "te", "gu", "th", "ht", "tr", "uk", "hi", "ur", "hu", "vi", "is", "cy", "id", "yi"

$TRANSLATOR_LOG = "translate.log"

Set-Location $TRANSLATOR_PATH
npm install
Set-Location $TRANSLATOR_PATH_BACKING

Remove-Item -Path $TRANSLATOR_LOG -Force
Write-Host "$ECHO_PREFIX This process might take from a few minutes up to a few hours, so go get a cup of coffee and watch some fun videos to kill time..."

mkdir -Force logs
foreach ($lang in $LANGUAGES) {
  Write-Host "$ECHO_PREFIX Translating 'en-US' to '$lang'..."
  $logFile = "logs/translate-manifest-$((Get-Date).ToString('yyyy-MM-ddTHH-mm-ss')).log"
  node "$TRANSLATOR_PATH/translate_manifests.js" $lang >> $logFile
}
