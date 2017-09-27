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
    - [x] on more try to figure out `fromEvent`




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

## Modularity and publishing

Start by making some building blocks:

- [ ] config reader
- [ ] template compiler
- [ ] content parser
- [ ] html renderer

- [ ] maybe a console logger too

- [ ] abstract file walker
    - [ ] take a glob and lose Gulp
