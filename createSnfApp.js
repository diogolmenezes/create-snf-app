'use strict';

const chalk = require('chalk');
const commander = require('commander');
const packageJson = require('./package.json');
const fs = require('fs-extra');
const path = require('path');

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


    const package = {
        name,
        version: '1.0.0',
        description: '',
        main: 'index.js',
        scripts: {
            test: 'clear;nyc --reporter=html --reporter=lcov --reporter=text-lcov --reporter=text --report-dir=test-reports ./node_modules/mocha/bin/mocha ./api/modules/*/test/unit/*.unit.js --timeout 12000',
            start: 'clear; rm -rf logs/*.log*; nodemon index.js;',
            'test:dev': 'clear;./node_modules/mocha/bin/mocha ./api/modules/*/test/unit/*.unit.js --timeout 12000',
            integration: 'clear;./node_modules/mocha/bin/mocha ./api/modules/*/test/integration/*.integration.js',
            lint: 'clear; ./node_modules/.bin/eslint api/*',
            'doc:edit': 'clear; swagger_swagger_fileName=doc/swagger.yaml swagger project edit',
            'doc:update': 'clear; js-yaml doc/swagger.yaml >> doc/swagger.json'
        },
        dependencies: {
            mongoose: '^5.4.19',
            'simple-node-framework': '^1.0.0',
        },
        devDependencies: {
            chai: "^4.2.0",
            'eslint': "^5.15.3",
            'eslint-config-airbnb-base': '^13.1.0',
            'eslint-plugin-chai-friendly': '^0.4.1',
            'eslint-plugin-import': '^2.16.0',
            istanbul: '^0.4.5',
            'js-yaml': '^3.13.0',
            mocha: '^6.0.2',
            nyc: '^13.3.0',
            sinon: '^7.3.0',
            supertest: '^4.0.2'
        }
    }


    fs.copy('./_bootstrap/sample.js', root + '/sample.js')
        .then(() => console.log('success!'))
        .catch(err => console.error(err))

}