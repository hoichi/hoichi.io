///<reference path="../node_modules/@types/node/index.d.ts" />
'use strict';

import { map, runEffects } from '@most/core';
import { newDefaultScheduler } from '@most/scheduler';
import { pipe } from 'ramda';

import { observeSource } from './scripts/readSource';
import { SourceFile } from './scripts/model/page';
import { Stream } from '@most/types';

const _ = require('lodash'),
  bSync = require('browser-sync').create(),
  fm = require('front-matter'),
  fs = require('fs'),
  gulp = require('gulp'),
  jade = require('jade'),
  md = require('markdown-it')({
    breaks: true,
    html: true,
    typographer: true,
    quotes: '«»„“',
  }),
  modRw = require('connect-modrewrite'),
  Path = require('path'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  u = require('./scripts/utils.js'),
  yaml = require('js-yaml');

const cfg = {
  layouts: {},
  sources: {
    contents: {
      path: 'contents',
      encoding: 'UTF-8',
      extensions: 'md|mdown|markdown',
    },
    templates: 'theme/jade',
    styles: 'theme/sass',
  },
  rootDir: __dirname,
  date_short: u.dateFormatter('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }),
};

const site = {
  title: 'Behind The Frontend',
  domain: 'hoichi.io',
};

gulp.task('loadCfg', function gt_loadCfg(cb) {
  // just start with loading global stuff
  let rootCfg = yaml.safeLoad(fs.readFileSync('config.yaml', 'utf8'));
  _.merge(cfg, rootCfg);
  cb();
});

gulp.task(
  'scatter',
  [
    /*'loadCfg',*/
  ],
  function gtScatter(cb_t) {
    console.log('observing source');
    const { fromAdd } = observeSource('contents/', { cwd: '.' });

    const pages = pipe (
      map((page: SourceFile) => ({
        /* defaults */
        date: new Date(),
        published: true,
        title: 'Untitled',
        /* category defaults to folder */
        category: (page.path && page.path.dir) || '',
        ...page,
      })),
      map(page => {
        // yaml front matter
        const { body: content, attributes } = fm(page.content);

        return content
          ? {
            ...page,
            ...attributes,
            content
          }
          : page;
      }),
      map(page => ({
        ...page,
        // markdown
        content: md.render(page.content)
      })),
      patch(({excerpt, content}) => ({
        // excerpts
        excerpt: excerpt || u.extract1stHtmlParagraph(content)
      })),
      // todo: either pass types to patch
      // or separate those things into properly typed functions
      // either way we need more types
      patch(page => ({
        url: u.constructPageUrl(page)
      })),
/*
      map(page => ({
        ...page,
        // excerpts
        excerpt: page.excerpt || u.extract1stHtmlParagraph(page.content)
      })),
      map(page => ({
        ...page,
        url: u.constructPageUrl(page)
      })),
*/
      map(page => (console.log(`${page.url}: ${page.title}`), page)),
    )(fromAdd);


    function patch<A extends {}, B extends A>(f: (a: A) => Partial<B>): (s: Stream<A>) => Stream<B> {
      return map( (obj: A) => Object.assign({}, obj, f(obj)) );
    }

    runEffects(pages, newDefaultScheduler())
      .then(() => console.log('My job here is всё'))
      .catch(err => console.log(err));

    /*
        const sortedList$ = pages$
            .loop((coll, page) => {
                const sortedList = coll.concat(page);   // todo: actually sort

                return {
                    seed: sortedList,
                    value: {
                        sortedList,
                        page // todo: mutate the page
                    }
                };
            }, [])
            .until(fromReady$)  // todo: move it someplace better
            .multicast()        // todo: and maybe multicast earlier
        ;
*/

    /*
        const collectedPages$ = sortedList$
            .map(val => val.page)
            // todo:
            //  - (blocked) [ ] render
            //  - [ ] output path
            //  - [ ] write
            .map(page => page.title) // fixme when done debugging
            // .observe(console.log)
            // .then(() => console.log('BAM!'))
        ;
*/

    /*
        const feed$ = sortedList$
            .map(val => val.sortedList)
            .reduce((_, list) => list, undefined)
            // todo:
            //  - [ ] wait for `ready` or stream close
            //  - [ ] slice & dice
            //  - (blocked) [ ] render
            //
            //  - [ ] output path
            //  - [ ] write
            .then((list) => {
                console.log('\n\n=== DONE! ===\n');
                console.log(list.map(p => p.title));
                console.log('\n=== /DONE ===\n');
            })
        ;
*/

    // todo: observeSource
    // todo: map (compile)
    /*
        const templates$ =
            observeSource('src/theme/jade/!*.jade', {cwd: '.'}).fromAdd$
            .map(tpl => ({
                id: tpl.path.name,
                render: jade.compile(tpl.content,
                    {
                        pretty: '\t',
                        filename: tpl.path.path
                    }
                )
            }))
*/
    // .scan(
    //     (hash, tpl) => ({...hash, [tpl.id]: tpl.render}),
    //     [],
    // )
    // .forEach(console.log)
    /*
        let templates = Chops
                .templates
                .src( Path.join(cfg.sources.templates, '*.jade')
                    , {ignored: '!_*.jade'} )
                .convert( tpl => ({
                    id: tpl.path.name,
                    render: jade.compile(tpl.content,
                        {
                            pretty: '\t',
                            filename: tpl.path.path
                        }
                    )
                }) )
            ;

        let collections = {
            'blog': Chops.collection({
                        sortBy: p => - (p.date || Date.now()),
                        indexBy: p => p.id
                    })
                    .filter(page => page.path && (page.path.dir === 'blog'))
                    .patchCollection(() => ({
                        url: '',
                        category: 'blog'
                    }))
                    .render(templates, 'home')
                    .write(Path.join(cfg.rootDir, 'build')),

            '100': Chops.collection({
                        sortBy: p => (p.date || new Date())
                    })
                    .filter(page => page.path && (page.path.dir === '100'))
                    .patchCollection(() => ({
                        url: '100/',
                        category: '100 days of code',
                        short_desc: 'I’m taking part in the <a href="https://medium.freecodecamp.com/join-the-100daysofcode-556ddb4579e4">100 days of code</a> flashmob (TL;DR: you have to code every day, outside of your day job). The twist I’ve added is I don’t have a twitter (which is <a href="http://calnewport.com/blog/2013/10/03/why-im-still-not-going-to-join-facebook-four-arguments-that-failed-to-convince-me/">by design</a>), hence I blog about it here.<br>Oh, and don’t read it yet, but <a href="https://github.com/hoichi/chops">here’s the repo</a>.'
                    }))
                    .render(templates, 'blog')
                    .write(Path.join(cfg.rootDir, 'build')),

            'rss': Chops.collection({
                        by: p => (p.date || new Date())
                    })
                    .filter(page => page.path && (page.path.dir === 'blog'))
                    .patchCollection(() => ({
                        url: 'feed.xml',
                    }))
                    .render(templates, 'rss', {site})
                    .write(Path.join(cfg.rootDir, 'build')),
        };

        Chops.src('**!/!*', {cwd: Path.join(cfg.rootDir, cfg.sources.contents.path)})
            .collect(collections['blog'])
            .collect(collections['100'])
            .collect(collections['rss'])
            .render(templates, page => page.template || 'post')
            .write(Path.join(cfg.rootDir, 'build'))
        ;
    */
  },
);

gulp.task('sass', function gtSass() {
  gulp
    .src('./theme/sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./build/css'));
});

gulp.task('static-js', function gtStaticJS() {
  gulp.src('./theme/js/lib/*.js').pipe(gulp.dest('./build/js/'));
});

gulp.task('static-redirects', function gtStaticRw() {
  gulp.src('./theme/_redirects').pipe(gulp.dest('./build/ z')); // rewrite rules for netlify. for browserSync, see below.
});

gulp.task('static-img', () => {
  gulp.src('./files/img/**/*').pipe(gulp.dest('./build/img/'));
});

gulp.task('static', ['static-js', 'static-redirects', 'static-img']);

gulp.task('sass:watch', function gtSassWatch() {
  gulp.watch('./theme/sass/**/*.scss', ['sass']);
});

gulp.task('watch', ['sass:watch']);

gulp.task('serve', ['watch'], function gtServe() {
  bSync.init({
    server: {
      baseDir: './build/',
    },
    middleware: [
      modRw([
        '^/feed/??$ /feed.xml [L]', // see _redirects for production redirects (https://www.netlify.com/docs/redirects)
      ]),
    ],
  });
});

gulp.task('default', [/*'scatter',*/ 'static', 'sass']);
