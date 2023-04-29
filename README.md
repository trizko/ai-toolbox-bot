# ai-toolbox-bot
![ci-job](https://github.com/trizko/ai-toolbox-bot/actions/workflows/ci-job.yml/badge.svg)
![cd-job](https://github.com/trizko/ai-toolbox-bot/actions/workflows/cd-job.yml/badge.svg)

A Discord bot with commands for prompting the OpenAI API.

## Getting Started + Prerequisites

To get this discord bot up and running on your machine, you will need the following prerequisites:

-   Docker
-   OpenAI API Key
-   Discord Developer Token
-   Discord bot (created from the Discord developer console)
-   Discord Guild ID (For the channel you want the bot to run in)
-   Discord Client ID (Obtained from the Discord Developer Console)

Once you have docker installed and you've obtained all the necessary API keys and tokens, you are ready to get started.

## Installation

First step to installation is to make a copy of the `config.json.template` file, rename the file to `config.json`, and fill it in with the API credentials you obtained based on the list above:

```
# copy and update the values in the config file
$ cp config.json.template config.json
```

Once that is done, run the following commands in the root directory:

```
# build the docker image
$ ./run.sh build

# deploy the commands in the commands directory
$ ./run.sh deploy

# run the bot
$ ./run.sh start

# for full list of commands for `./run.sh`, use the `help` command
$ ./run.sh help
```

## Deployment

This bot is automatically deployed to a discord server on any change to master.
