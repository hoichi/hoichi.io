- [ ] REGROUP
    - [ ] cull dependencies
        - [ ] try [greenkeeper](http://greenkeeper.io/)
        - [ ] try lodash 4.0
    - [ ] try and lose Babel
    - [ ] npm module: Page/Site/Template compiler
        - [ ] Jekyll compatibility, more or less
        - [ ] Change `gulp.src` to glob (so the module can be used with or without gulp)
    - [ ] npm module: console output (log, messages, debug)
- [ ] IMPROVEMENTS
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
