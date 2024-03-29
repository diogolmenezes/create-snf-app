# Create SNF (simple-node-framework) app

create-snf-app is an officially supported way to create [simple-node-framework](https://github.com/diogolmenezes/simple-node-framework) applications. It offers a modern build setup with no configuration.

## Quick Start

```shell
npx create-snf-app my-app -p 8091
cd my-app
npm start
```
With database and Redis enabled

```shell
npx create-snf-app my-app --enable-database --enable-redis -p 8091
cd my-app
npm start
```

With typescript enabled

```shell
npx create-snf-app my-app --enable-typescript -p 8091
cd my-app
npm start
```

>If you've previously installed create-snf-app globally via npm install -g create-snf-app, we recommend you uninstall the package using npm uninstall -g create-snf-app to ensure that npx always uses the latest version.`

npx comes with npm 5.2+ and higher if you use npm 5.1 or earlier, you can't use npx. Instead, install create-snf-app globally:

`npm install -g create-snf-app`

Now you can run:

`create-snf-app my-app`

## Usage

`npx create-snf-app <project-directory> [options]`

### Options

```shell

  -V, --version          output the version number
  -p, --port <n>         server port
  -r, --release <value>  bootstrap release number
  --enable-database     enable database support
  --enable-redis        enable redis, cache and session support
  --enable-cache        enable cache support
  --enable-session      enable session support
  --enable-typescript      enable typescript support
  --disable-install      dont run npm install
  -h, --help             output usage information
```

## Output

Running any of these commands will create a directory called my-app inside the current folder. Inside that directory, it will generate the initial simple-node-framework project structure and install the transitive dependencies.

Go to the [docs](https://github.com/diogolmenezes/simple-node-bootstrap) if do you need more details about the used *bootstrap*.

```shell
├── api
│   ├── config
│   │   ├── custom-server.js
│   │   └── env
│   │       ├── default.js
│   │       ├── production.js
│   │       ├── staging.js
│   │       └── testing.js
│   └── modules
│       └── sample-module
│           ├── controller.js
│           ├── model
│           │   └── customer.js
│           ├── repository
│           │   └── customer-repository.js
│           ├── route.js
│           ├── service
│           │   └── customer-service.js
│           └── test
│               ├── integration
│               │   └── controller.integration.js
│               └── unit
│                   └── controller.unit.js
├── doc
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── index.html
│   ├── oauth2-redirect.html
│   ├── README.md
│   ├── swagger.json
│   ├── swagger-ui-bundle.js
│   ├── swagger-ui.css
│   ├── swagger-ui-standalone-preset.js
│   └── swagger.yaml
├── index.js
├── logs
├── package.json
└── README.md
```