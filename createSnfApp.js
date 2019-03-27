#!/usr/bin/env node

'use strict';

const chalk = require('chalk');
const commander = require('commander');
const packageJson = require('./package.json');
const fs = require('fs-extra');
const path = require('path');
const hyperquest = require('hyperquest');
const unpack = require('tar-pack').unpack;

let projectName;
let bootstrapURL = 'https://github.com/diogolmenezes/create-snf-app/blob/master/packages/snf.tar.gz?raw=true';

const program = new commander.Command(packageJson.name)
    .version(packageJson.version)
    .arguments('<project-directory>')
    .usage(`${chalk.green('<project-directory>')} [options]`)
    .action(name => {
        projectName = name;
    })
    .option('-p, --port <n>', 'Define the server port', parseInt)
    .option('-r, --release <value>', 'SNF bootstrap release number')
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

function getBootstrapFile(url, version) {
    let _url = url.replace(':version', `-${version}` || '');

    console.log(`Downloading the bootstrap from ${chalk.green(_url)}`);
    console.log('This might take a couple of minutes.');

    // if you want to download a file that its not hosted at github just use this
    // let stream = hyperquest(_url);
    // if you want to download github hosted files use this:
    const request = require('hyperdirect')(2);
    const stream = request(_url);

    return stream;
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

function createApp(name, url) {
    const root = path.resolve(name);
    const appName = path.basename(root);

    fs.ensureDirSync(name);

    console.log(`Creating a new simple-node-framework app in ${chalk.green(root)}.`);
    console.log();

    const stream = getBootstrapFile(bootstrapURL, program.release);

    extractStream(stream, root);

    // // substituir

    console.log(`${chalk.green('Success!')}`);
}