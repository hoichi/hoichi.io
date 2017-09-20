## Build

- [x] Build the builder
    - [x] Folder structure
        - build ←
            - scripts
            - public
        - contents →
        - src →
            - docs
            - scripts
            - theme
    - [x] install TS
    - [x] clean up (babel &c)
    - [x] TS task (in package.json)
        - [x] write tsconfig
    - [x] ssh git origin
    - [x] move gulp helpers outta gulpfile
- [ ] Write a file watcher
    - [x] install graceful-chokidar
    - [ ] start writing a test
        - [x] install mock-fs
        - [ ] write a test that at least runs `fsSrc`
        - [ ] see what fromSource sees
- [ ] Test a file watcher (mock fs with simple texts — maybe even with fuzzy stuff — and check those are the texts that are emitted)




## Improve

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

## Modularity and publishing

Start by making some building blocks:

- [ ] config reader
- [ ] template compiler
- [ ] content parser
- [ ] html renderer

- [ ] maybe a console logger too

- [ ] abstract file walker
    - [ ] take a glob and lose Gulp
