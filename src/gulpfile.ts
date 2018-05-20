///<reference path="../node_modules/@types/node/index.d.ts" />
'use strict';

import { Stream } from '@most/types';
import {
  chain,
  filter,
  map,
  merge,
  mergeArray,
  multicast,
  now,
  runEffects,
  scan,
  skip,
  take,
  tap,
} from '@most/core';
import { curry2 } from '@most/prelude';
import { newDefaultScheduler } from '@most/scheduler';
import { last } from 'most-last';
import { pipe } from 'ramda';

import { observeSource } from './scripts/readSource';
import { Page, SourceFile } from './scripts/model/page';
import { parsePage } from './scripts/parsePage';
import { compileTemplates, renderPage } from './scripts/templates';
import { write } from './scripts/writeToDest';
import { SortedList } from './scripts/sortedList';
import { slurpWith } from './scripts/helpers';
import { collect } from './scripts/collection';

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

const l = console.log;

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

const siteMeta = {
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
  'contents',
  async function gtContents(cb_t) {
    const tplCfg = {
      // todo: centralize config
      default: 'single',
      date_short: u.dateFormatter(
        // todo: use moment.js?
        // fixme: so hardcode
        'en-US',
        { year: 'numeric', month: 'short', day: 'numeric' },
      ),
    };

    const siteMeta: SiteMeta = {
      title: 'Code Churn',
      domain: 'hoichi.io',
    };

    try {
      l('Reading templates');
      const tplDic = await compileTemplates(
        observeSource('src/theme/jade/*.jade', { cwd: '.' }),
      );
      l(`Templates are successfully compiled`);

      l(`Setting up pages`);
      const pages = map(
        parsePage,
        observeSource('**/*', { cwd: Path.join(__dirname, 'contents') }),
      );

      // collect, render & write pages
      pipe(
        collect({
          filter: ({ category }) => category === 'blog',
          template: 'blog',
          uniqueBy: ({ id }) => id,
          url: '',
          // meta
          content: 'You won’t believe what this developer didn’t know',
          title: 'blog',
        }),
        collect({
          filter: ({ category }) => category === 'blog',
          template: 'rss',
          uniqueBy: ({ id }) => id,
          url: 'feed.xml',
          limit: 10,
          // meta ?
        }),
        collect({
          filter: ({ category }) => category === '100',
          template: 'blog',
          uniqueBy: ({ id }) => id,
          url: '100/',
          // limit: 10,
          // meta ?
          title: '100 days of code',
          content:
            'Never mind, I dropped that flashmob thingie. Not' +
            ' that it stopped me from coding.',
        }),
        map(renderPage(tplDic, tplCfg, siteMeta)),
        write('build/public'),
      )(pages);

      l(`Ready to roll`);
    } catch (err) {
      console.log(err);
      throw new Error(
        'Something went wrong while reading and compiling templates',
      );
    }
  },
);

gulp.task('sass', function gtSass() {
  gulp
    .src('./src/theme/sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./build/css'));
});

gulp.task('static-js', function gtStaticJS() {
  gulp.src('./src/theme/js/lib/*.js').pipe(gulp.dest('./build/js/'));
});

gulp.task('static-redirects', function gtStaticRw() {
  gulp.src('./src/theme/_redirects').pipe(gulp.dest('./build/ z')); // rewrite
  // rules for netlify. for browserSync, see below.
});

gulp.task('static-img', () => {
  gulp.src('./files/img/**/*').pipe(gulp.dest('./build/img/'));
});

gulp.task('static', ['static-js', 'static-redirects', 'static-img']);

gulp.task('sass:watch', function gtSassWatch() {
  gulp.watch('./src/theme/sass/**/*.scss', ['sass']);
});

gulp.task('watch', ['sass:watch']);

gulp.task('serve', ['watch'], function gtServe() {
  bSync.init({
    server: {
      baseDir: './build/public',
    },
    middleware: [
      modRw([
        '^/feed/??$ /feed.xml [L]', // see _redirects for production redirects (https://www.netlify.com/docs/redirects)
      ]),
    ],
  });
});

gulp.task('default', ['static', 'sass', 'contents']);
