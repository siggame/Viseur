# Viseur
Visualizer for the [Cadre](https://github.com/siggame/Cadre) AI game framework.

Viseur is a single page application that is accessed via web browser. It is basically a glorified log file viewer, and parses gamelogs and makes pretty graphics showing to humans what happend in that log.

## Features

* Playback of gameslogs from local files, or remote sources
* Games rendered via WebGL
* A single Viseur instance can have multiple game "modules" to be able to parse and playback different games, much like all Cadre applications
* Supports spectator mode for all games out of the box
* Developers can code UIs for to make any Cadre game human playable
* Nifty transitions to look sweet
* All settings customizable to end users and settings persist between page reloads

## Technical Details

Viseur is a JavaScript application modeled off Node.js design paradigms, with CSS and HTML heavily utilized.

* JavaScript: wrapped up by [Webpack](https://www.npmjs.com/package/webpack) to allow a Node.js like runtime environment.
* CSS: SASS (Syntactically Awesome Style Sheets). It's all valid CSS3, but with the hotness SASS brings in.
* HTML: Still raw HTML (no Jade or something like that), but we use Handlebars to template the HTML.
* JSDoc doumentation: All code documented using JSDoc style for proper documentation generation.

## Requirements

Node.js and NPM are required to bundle up the files to be served to the browser. [Webpack](https://webpack.github.io/) is used to bundle the files, but that can be installed via NPM.

### Installation

1. Install Node.js: download and install [Node.js](https://nodejs.org/en/). Node comes with NPM (Node Package Manager) so that covers all the software you need to install normally, everything else from this point on is done via Node stuff.
2. Clone this repo using git: In whatever directoy you want to work out of do `git clone https://github.com/siggame/Viseur.git`
3. Install Viseur dependencies: navigate to the `Viseur` directoy you just cloned and then run `npm install`. This reads the package.json file and downloads all the modules it requires. If that file is ever changed, just re-run `npm install`.
4. Statup the development server using `npm run visualizer`
5. In browser, go to `http://localhost:8080`.

### Commiting

1. type: 'npm run lint' to run lint
2. if you get CRLF and LF error srun 'npm run lintfix' then repeat step 1
3. fix errors and repeat step 1 on ward until format is correct before you commit
4. commit

### Deploying

Never deploy Viseur using `npm run visualizer`, as that starts up a webpack-dev-server, which listens for file changes and rebuilds webpack.

Instead, the whole point of webpack is to build all our sources into a few files so browsers do not need to make >100 HTTP Requests for all our files.

Run `npm run bundle`.

Grab all the files in the index of Viseur, and serve them via some simple HTTP file server. [http-server](https://www.npmjs.com/package/http-server) works well for this.
