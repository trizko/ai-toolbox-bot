#!/bin/bash

# Set up the help message
help_message="
(Note: Must be used from the root directory of this repository.)

Usage:
    ./run.sh COMMAND

Commands:
    build   build the docker image for this repo
    check   check if files have been formatted
    deploy  deploy the bot commands to discord
    fmt     format the files using prettier
    start   start the bot server
    help    show this help message
"

# Process the command line arguments
while [[ $# -gt 0 ]]
do
    key="$1"
    case $key in
        help)
            echo "$help_message"
            exit
            ;;
        build)
            docker build -t ai-tool-bot .
            exit
            ;;
        check)
            docker run --rm -v $(pwd):/opt/app/ ai-tool-bot run check-fmt
            exit
            ;;
        deploy)
            docker run --rm ai-tool-bot run deploy
            exit
            ;;
        fmt)
            docker run --rm -v $(pwd):/opt/app/ ai-tool-bot run fmt
            exit
            ;;
        start)
            docker run -it --rm --pid=host ai-tool-bot run start
            exit
            ;;
        *)
            echo "Unknown command: $key. Use the `help` command to see a list of available commands"
            exit
            ;;
    esac
    shift
done