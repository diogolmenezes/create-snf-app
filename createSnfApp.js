#!/usr/bin/env node

'use strict';

let program;
const chalk = require('chalk');
const commander = require('commander');
const packageJson = require('./package.json');
const fs = require('fs-extra');
const path = require('path');
const unzip = require('unzip-stream');
const replace = require('replace-in-file');
const execa = require('execa');
const bootstrapURL = 'https://github.com/diogolmenezes/create-snf-app/blob/master/packages/snf:version.zip?raw=true';

// start create-nfs-app
init();

function init() {
    let projectName = 'my-app';

    program = new commander.Command(packageJson.name)
        .version(packageJson.version)
        .arguments('<project-directory>')
        .usage(`${chalk.green('<project-directory>')} [options]`)
        .action(name => {
            projectName = name;
        })
        .option('-p, --port <n>', 'server port', parseInt)
        .option('-r, --release <value>', 'bootstrap release number')
        .option('--enable-database', 'enable mongodb support')
        .option('--enable-redis', 'enable redis support')
        .option('--enable-cache', 'enable cache support')
        .option('--enable-session', 'enable session support')
        .option('--enable-typescript', 'enable typescript support')
        .option('--disable-install', 'dont run npm install')
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

    success(root, name);
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
    const got = require('got');
    const stream = got.stream(_url);
    return stream;
}

async function extractStream(stream, dest) {
    return new Promise((resolve, reject) => {
        stream.pipe(unzip.Extract({ path: dest })).on('finish',() => {
            resolve();
        });
    });
}

function replaceParameters(path, name, port) {
    console.log(`Replacing default parameters ${chalk.green(path + '/**')}`);

    const changes = replace.sync({
        verbose: true,
        files: `${path}/**`,
        from: [/my-application/g, /8090/g],
        to: [name, port],
    });

    const environments = ['default', 'development', 'staging', 'production'];

    environments.map(env => {
        const configPath = `${path}/api/config/env/${env}.js`;
        const conf = require(configPath);

        if (!program.enableDatabase) {
            delete conf.db;
        }

        if (!program.enableRedis) {
            delete conf.redis;
            delete conf.cache;
            delete conf.session;
        }

        if (!program.enableCache) {
            delete conf.cache;
        }

        if (!program.enableSession) {
            delete conf.session;
        }

        if (program.enableTypescript) {
            fs.mkdirpSync(`${path}/dist`);
            const tsConfiguration =  {
                app: {
                    name
                },
                dir: '/dist'
            }
            fs.writeFileSync(`${path}/.snf`, JSON.stringify(tsConfiguration));
        }

        const content = `module.exports = ${JSON.stringify(conf, null, 4)}`

        fs.writeFileSync(configPath, content, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });

    changes.map(change => console.log(`File changed ${chalk.blue(change)}`));
    console.log();
}

function success(path, name) {
    const configPath = `${name}/api/config/env/default.js`;
    const install = (program.disableInstall) ? ' npm install &&' : '';

    console.log(`${chalk.green(`SUCCESS! Application installed at ${chalk.blue(path)}`)}`);
    console.log();
    console.log(`  1. Change configurations at ${chalk.blue(configPath)}.`);
    console.log(`  2. Start your app ${chalk.blue(`cd ${name} &&${install} npm start`)}`);
    console.log();
    console.log('Documentation:');
    console.log();
    console.log(`  Simple node framework: ${chalk.rgb(219, 126, 54)('https://github.com/diogolmenezes/simple-node-framework')}`);
    console.log(`  Simple node bootstrap: ${chalk.rgb(219, 126, 54)('https://github.com/diogolmenezes/simple-node-bootstrap')}`);
    console.log(`  SNF create app: ${chalk.rgb(219, 126, 54)('https://github.com/diogolmenezes/create-snf-app')}`);
    console.log();
}