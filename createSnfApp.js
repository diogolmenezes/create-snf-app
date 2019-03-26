'use strict';

const chalk = require('chalk');
const commander = require('commander');
const packageJson = require('./package.json');
const fs = require('fs-extra');
const path = require('path');
const hyperquest = require('hyperquest');
const unpack = require('tar-pack').unpack;

let projectName;
let bootstrapURL = 'https://github.com/diogolmenezes/create-snf-app/blob/master/snf.tar?raw=true';

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

createApp(projectName, bootstrapURL);

function createApp(name, url) {
    const root = path.resolve(name);
    const appName = path.basename(root);

    fs.ensureDirSync(name);

    console.log(`Creating a new simple-node-framework app in ${chalk.green(root)}.`);
    console.log();


    console.log('Installing packages. This might take a couple of minutes.');
    console.log(url);

    let stream = hyperquest(url);
    
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