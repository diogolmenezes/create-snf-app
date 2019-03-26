'use strict';

const chalk = require('chalk');
const commander = require('commander');
const packageJson = require('./package.json');
const fs = require('fs-extra');
const path = require('path');
const hyperquest = require('hyperquest');
const unpack = require('tar-pack').unpack;

let projectName;

const program = new commander.Command(packageJson.name)
    .version(packageJson.version)
    .arguments('<project-directory>')
    .usage(`${chalk.green('<project-directory>')} [options]`)
    .action(name => {
        projectName = name;
    })
    .option('-p, --port <n>', 'Define the server port', parseInt)
    .allowUnknownOption()
    .parse(process.argv);


if (typeof projectName === 'undefined') {
    console.error('Please specify the project directory:');
    console.log(
        `  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`
    );
    console.log();
    console.log('For example:');
    console.log(`  ${chalk.cyan(program.name())} ${chalk.green('my-snf-app')}`);
    console.log();
    console.log(
        `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
    );
    process.exit(1);
}


createApp(projectName);

function createApp(name) {
    const root = path.resolve(name);
    const appName = path.basename(root);

    fs.ensureDirSync(name);

    console.log(`Creating a new simple-node-framework app in ${chalk.green(root)}.`);
    console.log();


    console.log('Installing packages. This might take a couple of minutes.');

    let stream = hyperquest('https://github.com/facebook/create-react-app/blob/master/packages/create-react-app/createReactApp.js');


    extractStream(stream, root);

}

function extractStream(stream, dest) {
    return new Promise((resolve, reject) => {
      stream.pipe(
        unpack(dest, err => {
          if (err) {
            reject(err);
          } else {
            resolve(dest);
          }
        })
      );
    });
  }