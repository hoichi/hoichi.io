- [ ] REGROUP
    - [ ] npm module: console output (log, messages, debug)
        - [ ] see specs here: https://www.npmjs.com/package/log (and maybe look at that thing in general. and at this thing: https://www.npmjs.com/package/debug. and its patch: https://www.npmjs.com/package/debug-reloadable)
        - [ ] Travis
        - [ ] Greenkeeper
    - [ ] npm module: Page/Site/Template compiler
        - [ ] Jekyll compatibility, more or less
        - [ ] Change `gulp.src` to glob (so the module can be used with or without gulp)
    - [ ] lose Babel for Gulp and use plain harmony
    - [ ] lose AVA from the site repo as well
- [ ] BUGS
    - [ ] RSS
        - [ ] not full articles
        - [ ] links to the naked domain
    - [ ] `gulp.serve` doesn't build anything and doesn't know when there's no build 
    - [ ] AVA errors @ `makePathSync(sPath, options = {})`
        Should it go through Babel before AVA?. AVA can [require Babel](https://github.com/sindresorhus/ava#configuration). Then again, we're trying to lose Babel. Then _again_, if we move the engine to separate module(s), we can babelify dem modules and use what ES6 is supported by node for the site itself.
        And not use AVA for the site itself either.
- [ ] IMPROVEMENTS
    - [ ] favicon (http://blog.iconfactory.com/2015/11/the-new-favicon/)
    - [ ] host Hack on Netlify
          [see](https://github.com/chrissimpkins/Hack#host-hack-font-files-on-your-server)
    - [ ] tests
        - [ ] write some tests (starting with them modules)
        - [ ] add nyc
    - [ ] watch
        - (md, templates)->(pages,collections)
        - scss->css
        - assets->assets
        - js?
        - in fact, start with that first one _and make it work in gulp_. or in any npm script
        - [ ] async
            - [ ] read on getify
                - [ ] [Part 1: Concurrency, Async, Parallelism](http://blog.getify.com/concurrently-javascript-1/)
                - [ ] [Part 2: Reactive Programming (Observables)](http://blog.getify.com/concurrently-javascript-2/)
                - [ ] [Part 3: CSP (Communicating Sequential Processes)](http://blog.getify.com/concurrently-javascript-3/)
            - [ ] see https://promisesaplus.com/implementations

- [ ] TECHNOLOGIES
    - [ ] Redux? (for state)
    
## Modularity and publishing

Start by making some building blocks:

- [ ] config reader
- [ ] template compiler
- [ ] content parser
- [ ] html renderer

- [ ] maybe a console logger too

- [ ] abstract file walker
    - [ ] take a glob and lose Gulp
