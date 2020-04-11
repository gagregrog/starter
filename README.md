# Starter

Easily start a project with multiple dependencies.

Mac OSX only. See [Limitations](#limitations).

## Dependencies
This project relies on `ttab` for opening new terminal windows.

Install `ttab` globally with `npm i -g ttab` and grant it privileges (requested the first time it runs) before using this tool.

See [VSCode Integration](#vscode-integration) for VS Code dependencies.

## Setup

1. Install the package globally with `npm i -g https://github.com/RobertMcReed/starter.git`.
    - This will expose the command `start` to your `PATH`

2. Ensure [dependencies](#dependencies) are met.

3. Enter the directory of a project you would like to automate and type `start`.
    - This will initialize the project with a `.start.json` file

4. Tweak `.start.json` to suit your project's needs (see [API](#api) below).

5. From now on, run `start` from the project root to launch the project.
    - Optionally, call from anywhere and provide a path as a command line argument to run a specific starter file.
        - Example: `start path/to/some/<starter_file>.json`

The project will spawn a new terminal window, and each process will run in a dedicated tab.

The `start` process will continue to run in the original tab until you press `ENTER` (unless you set `"persist": false` in the json configuration). 

Once you press `ENTER`, all processes will be terminated, and the spawned window will be closed.

Any windows that were opened in VSCode will be closed automatically. See [VSCode Integration](#vscode-integration) for details.

## API

```
{
  "root": "~/Documents", // the default root path for your projects. Defaults to the current working directory of the initialized project when created.
  "persist": true, // keep the starter process running, and close all other processes once you press ENTER (set false to disable)
  "projects": [ // add as many dependencies as you wish
    { // this starts mongodb in a new tab
      "cmd": "mongod", // the command that will be run in order to start this part of your project
      "delay": 1000 // the amount of time in ms to delay after running this command before running the next command. (Optional)
    },
    { // if "cmd" is not provided, no command will be executed. No tab will be opened.
      // since no "path" is provided, "path" defaults to "root"
      "vscode": true, // open the directory in VScode (Optional) [must have code installed in PATH (see VSCode Integration)]
    },
    {
      "path": "/some-project/api", // A path relative to the root path where the command should be run (absolute path if "root" is omitted).
      "cmd": "python app.py", // you can always provide your own cmd to run
      "vscode": true,
      "delay": 500
    },
    {
      "path": "/some-project/web",
      "vscode": true,
      "cmd": "npm start",
      "delay": 500
    }
  ]
}
```

## Limitations

First and foremost, this will only work on Mac OS as it relies on `osascript`.

Only the following types of processes will be automatically closed:

```
node, python, mongod
```

You can pass arbitrary commands to the `cmd` field and they will run, but a Terminal dialog will be opened when you try to close unknown processes.

## VSCode Integration

You can open project windows in VSCode but you need to ensure that `code` is installed to your `PATH`. See [documentation](https://code.visualstudio.com/docs/setup/mac).

When your project closes down, it will attempt to close any open windows in VS Code that match the directory. To achieve this, it searches for windows that have the directory set as their name. This is a setting that can be enabled in VS Code.

To enable this, edit `~/Library/Application\ Support/Code/User/settings.json`  and set `"window.title": "${folderPath}"`.

Your editor window should now match the resolved path of `"root"` + `"path"` from the `.start.json` file. See [documentation](https://code.visualstudio.com/updates/v1_10#_configurable-window-title).

## Development
PRs welcome.

Fork or Clone the repo `git clone https://github.com/RobertMcReed/starter.git`.

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

The `start` process will continue to run in the original tab until you press `ENTER`. Once you press `ENTER`, all processes will be terminated, the spawned window will be closed, and VSCode windows that were opened for the project will be closed.

Currently the following types of processes will be automatically closed, but this can easily be tweaked in the source:

```
node, python, mongod
```

## Changelog

### 1.0.0
- Initial Commit

### 1.1.0
- `"code"` argument changed to `"vscode"`
- `"cmd"` no longer defaults to `"npm start"`
- `"cmd"` is no longer required (can by used to open project folders in vscode)
- VS Code windows will be closed automatically (see [VSCode Integration](#vscode-integration))
