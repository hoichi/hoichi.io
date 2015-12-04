- [x] make a working building script
    - [x] create dirs (make an util for nested dirs)
    - [x] shorter slugs (from filenames or yfm)
    - [x] <slug>/index.html
    - [x] compile sass (update node-sass)
    - [x] build _pages_ (as opposed to posts)
    - [x] build collections
        - [x] blog feed
            - [x] take the first 10 or so (no pagination so far)
            - [x] feed it to the template function
            - [x] fix jade
        - [x] rss feed
        - [x] exclude home page from feeds
    - [x] copy assets
    - [x] make an all-building task
- [ ] local server (with browser-sync) so we can check rss, for instance
    - [ ] check rss
- [ ] finish the site
    - [ ] layout
        - [ ] single posts
        - [ ] collections
        - [ ] pages
        - [ ] navigation
        - [ ] rss
    - [ ] style
        - [ ] copy
        - [ ] code (prism.js and stuff)
        - [ ] header
        - [ ] footer
        - [ ] nav
    - [ ] contents
        - [ ] front page
        - [ ] about
- [ ] modularize and improve
## Improvements

- [ ] remove obsolete files
        (either delete whole dirs or override the older and remove the nonexistent)
- [ ] async
- [ ] watch
- [ ] configurable dirs
    - [ ] theme dir (even if it's just one theme)
- [ ] tests
- [ ] greenkeeper

## Modularity and publishing

Start by making some building blocks:

- [ ] config reader
- [ ] template compiler
- [ ] content parser
- [ ] html renderer

- [ ] maybe a console logger too

- [ ] abstract file walker
    - [ ] take a glob and lose Gulp
