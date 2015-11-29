- [ ] make a working building script
    - [x] create dirs (make an util for nested dirs)
    - [x] shorter slugs (from filenames or yfm)
    - [x] <slug>/index.html
    - [x] compile sass (update node-sass)
    - [ ] build _pages_ (as opposed to posts)
    - [ ] compile rss
    - [ ] make an all-building task
- [ ] local server (with browser-sync) so we can check css, for instance
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

## Improvements

- [ ] remove obsolete files
        (either delete whole dirs or override the older and remove the nonexistent)

## Modularity and publishing

Start by making some building blocks:

- [ ] config reader
- [ ] template compiler
- [ ] content parser
- [ ] html renderer

- [ ] maybe a console logger too

- [ ] abstract file walker
    - [ ] take a glob and lose Gulp
