# Contributing
You can git clone this repo and create a pull request to send your requested changes.

But you have to follow these simple rules to make it easy and quick for us to approve
- Every feature/change should be in its own pull request (e.g. Feature #1 is in a seperate pull reqest from Feature #2)
- No swearing in code comments because that's unprofessional and means you are likely a terrible developer
- Don't fragment code by spreading code over too many coding languages
- Don't use any development tools provided from Mozilla or it's forks
- Only use the following languages and use only the ones needed (Non-code text files arent affected by this rule)
  - Assembly
  - C
  - C++
  - XML
  - Toml
  - Shell
  - Python
  - Java (Moved to a seperate [repository](https://github.com/openorchid/java_syscore))
  - Kotlin
  - HTML
  - CSS
  - SCSS
  - Javascript
  - Typescript
  - Fluent
  - JSON
  - GLSL

  And ABSOLUTELY don't use the following unless you're asking to be rejected and clowned on
  - Rust
  - Ruby
  - Groovy
  - XHTML
  - PHP
  - Perl
  - R
  - C#
  - VBA
  - Objective-C
- Be respectful for other developers cuz apparently this world is full of deaf idiots
- Make sure your code works in LFS with libraries other than standard C libraries compiled staticly with binary of your code
- Stick with the Orchid hiearchy standard which is similar to Android hiearchy with minor differences. It looks like this
```
bin/      => system/bin
cache/    => data/local/cache
config/
d/        => sys/kernel/debug
data/
dev/
etc/      => system/etc
mnt/
proc/
root/
sbin/
sdcard/
sys/
system/
vendor/   => system/vendor
```
