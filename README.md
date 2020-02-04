# Starter

Easily start a project with multiple dependencies.

Mac OSX only.

## Setup

Install the package globally with `npm i -g https://github.com/RobertMcReed/starter.git`.

Install `ttab` globally with `npm i -g ttab` and grant it privileges the first time it runs.

Run `start init` in a project directory to initialize the project with a `.start.json` file.

Tweak `.start.json` to suit your project's needs (see #Api below).

From the project directory, run `start` to launch the project.

  - Optionally, provide an argument `start path/to/some/file/<starter_file>.json` to run a specific starter file.

The project will spawn a new terminal window, and each process will run in its own tab.

The `start` process will continue to run in the original tab until you press `ENTER` (unless you set `persist: false` in the json configuration). Once you press `ENTER`, all processes will be terminated, and the spawned window will be closed.

Currently the following types of processes will be automatically closed:
```
node, python, mongod
```

## API

```
{
  "root": "~/Documents", // the default root path for your projects. Defaults to an empty string.
  "persist": true, // keep the starter process running, and close all other processes once you press ENTER (Optional, default = true)
  "projects": [ // add as many dependencies as you wish
    {
      "cmd": "mongod", // the command that will be run in order to start this part of your project
      "delay": 1000 // the amount of time in ms to delay after running this command before running the next command. (Optional)
    },
    {
      "path": "/some-project-requirement", // A path relative to the root path where the command should be run (absolute path if root is omitted).
      "delay": 500
    }, // if no cmd is provided, it will default to calling "npm start"
    {
      "path": "/some-project/api",
      "cmd": "npm run watch", // you can always provide your own cmd to run
      "code": true, // open the directory in VScode (Optional)
      "delay": 500
    },
    {
      "path": "/some-project/web",
      "code": true,
      "delay": 500
    }
  ]
}
```

## Development
Clone the repo `git clone https://github.com/RobertMcReed/starter.git`.

Install dependencies with `npm install`.

Install `ttab` globally with `npm i ttab -g` and grant it privileges the first time it runs.

Create a json file to test with `cp project_starter_template.json my_project.json`.

Tweak the template to suit your testing needs.

To start your project, provide the json filename as a command line argument.

```
node index.js my_project.json
```

Alternatively, test the cli by installing it globally with `npm i -g .` You can now run projects with the `start` command.

The project will spawn a new terminal window, and each process will run in its own tab.

The `start` process will continue to run in the original tab until you press `ENTER`. Once you press `ENTER`, all processes will be terminated, and the spawned window will be closed.

Currently the following types of processes will be automatically closed, but this can easily be tweaked in the source:
```
node, python, mongod
```
