import os
import glob
from translate import Translator
import re
from concurrent.futures import ThreadPoolExecutor

def translate_line(line, translator):
    if '=' in line:
        key, value = line.split('=', 1)
        # Translate the value part, leaving the key part unchanged
        translated_value = translator.translate(value.strip())
        line = f'{key}={translated_value}\n'
    return line

def translate_file(input_file, target_language):
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    translator = Translator(to_lang=target_language)

    def translate_non_brace(text):
        non_brace_parts = re.split(r'(\{[^\}]*\})', text)
        translated_parts = [part if part.startswith('{') else translator.translate(part) for part in non_brace_parts]
        return ''.join(translated_parts)

    def translate_line_concurrent(line):
        parts = re.split(r'(\{[^\}]*\})', line)
        # Translate only the parts that are not inside curly braces and not before '='
        translated_line = ''.join([translate_non_brace(part) if not part.startswith('{') else part for part in parts])
        return translate_line(translated_line, translator)

    with ThreadPoolExecutor() as executor:
        translated_lines = list(executor.map(translate_line_concurrent, lines))

    return translated_lines

def save_translated_file(input_file, translated_lines, target_language):
  # Get the base name of the input file
  base_name = os.path.basename(input_file)
  # Replace the language code with the target language
  new_base_name = re.sub(r'\..+?\.', f'.{target_language}.', base_name)
  output_file = os.path.join(os.path.dirname(input_file), new_base_name)

  with open(output_file, 'w', encoding='utf-8') as f:
    f.write(''.join(translated_lines))

def translate_properties_files(target_language, file_pattern):
  files = glob.glob(file_pattern)
  for file in files:
    translated_lines = translate_file(file, target_language)
    save_translated_file(file, translated_lines, target_language)

if __name__ == '__main__':
  import argparse

  parser = argparse.ArgumentParser(description='Translate .properties files.')
  parser.add_argument('target_language', type=str, help='Target language code (e.g., en)')
  parser.add_argument('file_pattern', type=str, help='File pattern (e.g., *.properties)')

  args = parser.parse_args()

  target_language = args.target_language
  file_pattern = args.file_pattern

  translate_properties_files(target_language, file_pattern)
