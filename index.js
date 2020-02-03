const path = require('path');
const readline = require('readline');

const sh = require('shelljs');
const ps = require('ps-node');
const fs = require('fs-extra');
const fp = require('find-process');

const DEFAULT_CMD = 'npm start';

const info = (...msg) => console.log(`[INFO]`, ...msg);
const err = (...msg) => console.log(`[ERROR]`, ...msg);

const wait = ms => (new Promise(resolve => setTimeout(resolve, ms)));

const resolvePath = (filePath) => {
  let _filePath = filePath;
  if (filePath[0] === '~') {
    _filePath = path.join(process.env.HOME, filePath.slice(1));
  }

  return path.resolve(_filePath);
}

const exec = (cmd, opts = {}) => {
  const { code, stdout } = sh.exec(cmd, { silent: true, ...opts });

  if (code) {
    const msg = `Command "${cmd}" failed with exit code ${code}.`;

    if (!opts.failSilent) {
      if (opts.ignoreErrors) {
        err(msg);
      } else {
        throw new Error(msg);
      }
    }
  }

  return stdout;
};

const getTerminalName = (projectName) => `__${projectName}__`;

const ttab = (projectName) => (filePath, cmd, opts = {}, first) =>
  exec(`ttab ${first ? '-w ' : ''}-t "${getTerminalName(projectName)}" -d "${filePath}" ${cmd};`, opts);

const verifyTtab = () => {
  try {
    exec('which ttab')
  } catch {
    err('Please install ttab before continuing.');
    console.log('\thttps://www.npmjs.com/package/ttab');
    process.exit(1);
  }
};

const processArgs = () => {
  const filePath = process.argv[2];
  const exists = fs.pathExists(path);

  if (!(filePath && exists)) {
    const msg = (filePath
      ? `File does not exist: "${filePath}"`
      : 'You must provide the path to a json starter file.'
    );

    err(msg);
    process.exit(1);
  }

  const parts = filePath.split('/');
  const name = (parts[parts.length - 1]).replace('.json', '');

  return { name, filePath };
}

const getJson = async (filePath) => {
  try {
    const data = await fs.readJSON(filePath);
    return data;
  } catch (e) {
    err(`Could not process file: "${filePath}"`);
    console.log(`\t${e.message}`);
    process.exit(1);
  }
};

const normalizeJson = (json) => {
  if (Array.isArray(json)) {
    return {
      root: '',
      projects: json,
    };
  }

  return json;
};

const handleProjects = async ({
  debug,
  projects,
  defaultCmd,
  projectName,
  root: rootPath = '',
}) => {
  const execTtab = ttab(projectName);
  let numErrors = 0;
  let first = true;

  for (const project of projects) {
    const {
      code,
      delay,
      cmd: _cmd,
      path: _filePath = '',
    } = project;
    const identifier = getTerminalName(projectName);
    const filePath = resolvePath(path.join(rootPath, _filePath));
    const cmd = `STARTER_ID=${identifier} ` + (_cmd || defaultCmd || DEFAULT_CMD);

    info(`Running command "${cmd}" in ${filePath}...`)
    
    try {
      execTtab(filePath, cmd, { silent: false }, first);
      info(`Success!${delay ? `\tPausing for ${delay}ms...` : ''}`);
      if (code) {
        exec(`code ${filePath}`);
      }

      if (delay) {
        await wait(delay);
      }
    } catch (error) {
      numErrors++;
      err(error);
    }
    first = false;
  }

  return numErrors;
};

const queuePause = async (projectName) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl
      .question(
        `\n Press ENTER to kill all processes associated with ${projectName}...`,
        () => {
          rl.close();
          resolve();
        }
      )
  );
};

const prom = f => (...args) => new Promise((resolve, reject) => {
  f(...args, (error, data) => error ? reject(error) : resolve(data));
});

const kill = prom(ps.kill);
const getProcesses = async (identifier) => {
  const uid = exec(`echo $UID`);

  const candidates = await fp('name', '')
    .then(_processes => _processes.
      filter(_process => (
        (_process.uid == uid)
        && (_process.ppid != 1)
        && (['node', 'python', 'mongod'].includes(_process.bin))
      ))
    );

  const processes = candidates.filter(_process => {
    const env = exec(`ps -Eww ${_process.pid}`);

    return env.includes(identifier);
  });

  return processes;
};
const killAll = (processes) => Promise.all(processes.map(p => kill(p.pid)));

const closeWindows = (identifier, debug) => {
  exec(`osascript -e 'tell application "Terminal" to close (every window whose name contains "${identifier}")' &`, { silent: !debug });
};

const killProject = async (projectName, debug) => {
  const identifier = getTerminalName(projectName);
  const processes = await getProcesses(identifier);
  await killAll(processes);
  closeWindows(identifier, debug);
};

const main = async () => {
  console.log();
  verifyTtab();
  const { name: projectName, filePath } = processArgs();
  const json = await getJson(filePath);
  const { persist = true, ...projectData } = normalizeJson(json);

  info(`Starting project: ${projectName}`);
  const numErrors = await handleProjects({ ...projectData, projectName });

  console.log();
  info(`${projectName} started ${numErrors ? `with ${numErrors} errors.` : 'successfully!'}`);

  if (persist) {
    await queuePause(projectName);

    try {
      await killProject(projectName, projectData.debug);

      console.log();
      info(`${projectName} closed successfully`);
    } catch (error) {
      err('An error occured while closing the project.');
      console.log(`\t${error}\n`);
    }
  }
};

main();
