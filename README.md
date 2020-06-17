# Viseur
Visualizer for the [Cadre](https://github.com/siggame/Cadre) AI game framework.

Viseur is a single page application that is accessed via web browser. It is basically a glorified log file viewer, and parses gamelogs and makes pretty graphics showing to humans what happend in that log.

Note: A pre-built version of the master branch is hosted at http://vis.siggame.io/.

## Features

* Playback of gamelogs from local files, or remote sources
* Games rendered via WebGL
* A single Viseur instance can have multiple game "modules" to be able to parse and playback different games, much like all Cadre applications
* Supports spectator mode for all games out of the box
* Developers can code UIs for to make any Cadre game human playable
* Nifty transitions to look sweet
* All settings customizable to end users and settings persist between page reloads

## Technical Details

Viseur is a TypeScript application modeled off Node.js design paradigms, with CSS and HTML heavily utilized.

* TypeScript: wrapped up by [Webpack](https://www.npmjs.com/package/webpack) to allow a Node.js like runtime environment.
* CSS: SASS (Syntactically Awesome Style Sheets). It's all valid CSS3, but with the hotness SASS brings in.
* HTML: Still raw HTML (no Jade or something like that), but we use Handlebars to template the HTML.
* JSDoc documentation: All code documented using JSDoc style for proper documentation generation.

## Requirements

Before building, you must have [Node/NPM](https://nodejs.org/en/) installed. That is the only requirement to build, though we do have suggested IDEs below.

### Installation

1. Install Node.js: download and install [Node.js](https://nodejs.org/en/). Node comes with NPM (Node Package Manager) so that covers all the software you need to install normally, everything else from this point on is done via Node stuff.
2. Clone this repo using git: In whatever directory you want to work out of do `git clone https://github.com/siggame/Viseur.git`
3. Install Viseur dependencies: navigate to the `Viseur` directory you just cloned and then run `npm install`. This reads the package.json file and downloads all the modules it requires. If that file is ever changed, just re-run `npm install`.
4. Statup the development server using `npm start`
5. In browser, go to `http://localhost:8080`.

### Committing

1. Type: 'npm run lint' to run the linter
2. If you get CRLF and LF error run 'npm run fix' then repeat step 1
3. Fix errors and repeat step 1 on ward until format is correct before you commit
4. commit

### Deploying

The travis file is setup to automatically build and deploy the visualizer assets to the `gh-docs` branch so they can be served to http://vis.siggame.io/. _Generally_ this is the only way you should

Never deploy Viseur using `npm start`, as that starts up a webpack-dev-server, which listens for file changes and rebuilds webpack.

Instead, the whole point of webpack is to build all our sources into a few files so browsers do not need to make >100 HTTP Requests for all our files.

Run `npm run build`.

Grab all the files in the index of Viseur, and serve them via some simple HTTP file server. [http-server](https://www.npmjs.com/package/http-server) works well for this.

## Recommended Dev Environment

You are free to use whatever development environment you want to work in Viseur, but we do have a recommended one.

[Visual Studio Code](https://code.visualstudio.com/)

With the following extensions:

- [cSpell spell checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

Those tools will help analyze your code and catch errors early, before you find them in run time.

Open the root directory you cloned down (Viseur) in VSC, and it will know everything else to setup and run correctly.

With VSC installed you can use the integrated terminal to follow the above build steps, while the IDE analyzes your code for errors as you type!
