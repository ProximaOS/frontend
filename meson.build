project('systemutils', ['cpp', 'c'])

# Define sources
cpp_sources = files('src/native/*.cpp')
c_sources = files('src/native/*.c')
sources = cpp_sources + c_sources

# Create an executable
executable('systemutils', sources)

# Define compiler flags (optional)
cpp_args = ['-Wall', '-O2']
add_project_arguments(cpp_args, language : 'cpp')

c_args = ['-Wall', '-O2']
add_project_arguments(c_args, language : 'c')

# Define dependencies (if any)
# For example, if you depend on a library called 'my_library':
# my_library = dependency('my_library')

# Optionally, you can configure other aspects of the build here.
