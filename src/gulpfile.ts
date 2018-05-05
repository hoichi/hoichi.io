///<reference path="../node_modules/@types/node/index.d.ts" />
'use strict';

import { Stream } from '@most/types';
import { map, runEffects, scan, take, tap } from '@most/core';
import { newDefaultScheduler } from '@most/scheduler';
import { last } from 'most-last';
import { pipe } from 'ramda';

import { observeSource } from './scripts/readSource';
import { SourceFile } from './scripts/model/page';
import { parsePage } from './scripts/parsePage';
import { compileTemplates, renderPages } from './scripts/templates';

import { write } from './scripts/writeToDest';

const _ = require('lodash'),
  bSync = require('browser-sync').create(),
  fs = require('fs'),
  gulp = require('gulp'),
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
    /*'loadCfg'*/
  ],
  function gtScatter(cb_t) {
    const tplCfg = {
      default: 'single',
      date_short: u.dateFormatter(
        // fixme: so hardcode
        'en-US',
        { year: 'numeric', month: 'short', day: 'numeric' },
      ),
    };

    console.log('Reading templates');
    compileTemplates(observeSource('src/theme/jade/*.jade', { cwd: '.' }))
      .then(tplDic => {
        console.log(`Templates are successfully compiled`);

        const pages = map(
          // fixme: this `map` is the only whiff of most in the whole file
          pipe(parsePage, renderPages(tplDic, tplCfg)),
          observeSource('**/*', { cwd: Path.join(__dirname, 'contents') }),
        );

        write('build/public', pages);
      })
      .catch(err => {
        console.log(err);
        throw new Error(
          'Something went wrong while reading and compiling templates',
        );
      });

    /*
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
