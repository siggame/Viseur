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
2. Install [Webpack](https://www.npmjs.com/package/webpack): It is reccomended to install globally using: `npm install webpack -g`
3. Clone this repo using git: In whatever directoy you want to work out of do `git clone https://github.com/siggame/Viseur.git`
4. Install Viseur dependencies: navigate to the `Viseur` directoy you just cloned and then run `npm install`. This reads the package.json file and downloads all the modules it requires. If that file is ever changed, just re-run `npm install`.
5. Install the [Webpack Development Server]: `npm install webpack-dev-server -g` This is used to ease development. Instead of "compiling" you files on change, this server waits for a change and does that automatically for you.
6. Statup the Webpack dev server: `webpack-dev-server --progress --colors` This makes it look nicer.
7. In browser, go to `http://localhost:8080`. If you are getting problems resolving localhost add the `--host 0.0.0.0` argument to the above step.
