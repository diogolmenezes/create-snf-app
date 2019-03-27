#!/usr/bin/env node

'use strict';

const chalk = require('chalk');
const commander = require('commander');
const packageJson = require('./package.json');
const fs = require('fs-extra');
const path = require('path');
const unpack = require('tar-pack').unpack;
const replace = require('replace-in-file');

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
    console.log();

    const request = require('request');
    const stream  = request(_url);

    return stream;
}

async function extractStream(stream, dest) {
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

function replaceParameters(path, name, port) {
    console.log(`Replacing default parameters ${chalk.green(path + '/**')}`);

    const changes = replace.sync({
        verbose: true,
        files: `${path}/**`,
        from: ['my-application', 8094],
        to: [name, port],
    });

    changes.map(change => console.log(`File changed ${chalk.blue(change)}`));
    console.log();
}

async function createApp(name, url) {
    const root = path.resolve(name);

    fs.ensureDirSync(name);

    console.log(`Creating a new simple-node-framework app in ${chalk.yellow(root)}.`);
    console.log();

    const stream = getBootstrapFile(bootstrapURL, program.release);

    await extractStream(stream, root);

    replaceParameters(root, name, program.port);

    console.log(`${chalk.green('Success!')}`);
}