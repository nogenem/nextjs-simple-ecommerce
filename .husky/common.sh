command_exists () {
  command -v "$1" >/dev/null 2>&1
}

# Workaround for Windows 10, Git Bash and Yarn
if command_exists winpty && test -t 1; then
  exec < /dev/tty
fi

# https://github.com/typicode/husky/issues/968#issuecomment-1176848345
exec >/dev/tty 2>&1
