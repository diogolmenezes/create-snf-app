#!/usr/bin/env node
'use strict';

let program;
const chalk = require('chalk');
const commander = require('commander');
const packageJson = require('./package.json');
const fs = require('fs-extra');
const path = require('path');
const unpack = require('tar-pack').unpack;
const replace = require('replace-in-file');
const execa = require('execa');
const bootstrapURL = 'https://github.com/diogolmenezes/create-snf-app/blob/master/packages/snf:version.tar.gz?raw=true';

// start create-nfs-app
init();

function init() {
    let projectName;

    program = new commander.Command(packageJson.name)
        .version(packageJson.version)
        .arguments('<project-directory>')
        .usage(`${chalk.green('<project-directory>')} [options]`)
        .action(name => {
            projectName = name;
        })
        .option('-p, --port <n>', 'Define the server port', parseInt)
        .option('-r, --release <value>', 'SNF bootstrap release number')
        .option('--disable-database', 'Whithout database support (you can turn it on later)')
        .option('--disable-redis', 'Whithout redis, cache and session support (you can turn it on later)')
        .option('--disable-cache', 'Whithout cache support (you can turn it on later)')
        .option('--disable-session', 'Whithout session support (you can turn it on later)')
        .option('--disable-install', 'Dont run npm install')
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
}

async function createApp(name, url) {
    const root = path.resolve(name);

    fs.ensureDirSync(name);

    console.log(`Creating a new simple-node-framework app in ${chalk.yellow(root)}.`);
    console.log();

    const stream = downloadBootstrapFile(bootstrapURL, program.release);

    await extractStream(stream, root);

    replaceParameters(root, name, program.port);

    if (!program.disableInstall)
        await npmInstall(root);

    success(root);
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

async function npmInstall(path) {
    process.chdir(path)
    console.log(`Running npm install...`);
    console.log('This might take a couple of minutes.');
    console.log();
    const {
        stdout
    } = await execa('npm', ['i']);
    console.log(stdout);
    console.log();
}

function downloadBootstrapFile(url, version) {
    let _url = url.replace(':version', (version) ? `${version}` : '');

    console.log(`Downloading the bootstrap from ${chalk.green(_url)}`);
    console.log('This might take a couple of minutes.');
    console.log();

    const request = require('request');
    const stream = request(_url);

    return stream;
}

function replaceParameters(path, name, port) {
    console.log(`Replacing default parameters ${chalk.green(path + '/**')}`);

    const changes = replace.sync({
        verbose: true,
        files: `${path}/**`,
        from: ['my-application', 8094],
        to: [name, port],
    });

    if (program.disableDatabase || program.disableRedis) {
        const configPath = `${path}/api/config/env/default.json`;
        const conf = require(configPath);

        if (program.disableDatabase) {
            delete conf.db;
        }

        if (program.disableRedis) {
            delete conf.redis;
            delete conf.cache;
            delete conf.session;
        }

        if (program.disableCache) {
            delete conf.cache;
        }

        if (program.disableSession) {
            delete conf.session;
        }

        fs.writeFileSync(configPath, JSON.stringify(conf, null, 4), 'utf8', function (err) {
            if (err) return console.log(err);
        });
    }

    changes.map(change => console.log(`File changed ${chalk.blue(change)}`));
    console.log();
}

function success(path) {
    const configPath = `${path}/api/config/env/default.js`;

    console.log(`${chalk.green('SUCCESS! Get started:')}`);
    console.log();
    console.log(`  1. Change configurarions at ${chalk.blue(configPath)}. Remove mongo and redis nodes if you dont need it`);
    console.log(`  2. Go to ${chalk.blue(path)} directory and run ${chalk.blue('npm start')} to start your app`);
    console.log();
    console.log('Documentation:');
    console.log();
    console.log(`  Simple node framework: ${chalk.rgb(219, 126, 54)('https://github.com/diogolmenezes/simple-node-framework')}`);
    console.log(`  Simple node bootstrap: ${chalk.rgb(219, 126, 54)('https://github.com/diogolmenezes/simple-node-bootstrap')}`);
    console.log(`  SNF create app: ${chalk.rgb(219, 126, 54)('https://github.com/diogolmenezes/create-snf-app')}`);
    console.log();
}