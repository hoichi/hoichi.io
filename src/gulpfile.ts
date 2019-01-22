///<reference path="../node_modules/@types/node/index.d.ts" />
'use strict';

import { map, filter } from '@most/core';
import { pipe } from 'ramda';

import { observeSource } from './scripts/readSource';
import {parsePost, parseStaticPage} from './scripts/parsePage'
import { getTemplates, renderPage } from './scripts/templates';
import { write } from './scripts/writeToDest';
import { collect } from './scripts/collection';
import { SiteMeta } from './scripts/model';
import { withLog } from './scripts/helpers';

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

gulp.task('loadCfg', function gt_loadCfg(cb) {
  // just start with loading global stuff
  let rootCfg = yaml.safeLoad(fs.readFileSync('config.yaml', 'utf8'));
  _.merge(cfg, rootCfg);
  cb();
});

gulp.task('contents', async function gtContents(cb_t) {
  const tplCfg = {
    // todo: centralize config
    default: 'post',
    date_short: u.dateFormatter(
      // todo: use moment.js?
      // fixme: so hardcode
      'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' },
    ),
  };

  const siteMeta: SiteMeta = {
    title: 'Sergey Samokhov',
    domain: 'hoichi.io',
  };

  try {
    const tplDic = getTemplates();

    l(`Setting up posts`);
    const posts = pipe(
      filter(({ published }) => published !== false), // hack
      map(parsePost)
    )(
      observeSource(
        ['**/*', `!me.md`],
        { cwd: Path.join(__dirname, 'contents') }
    ));

    // collect, render & write pages
    pipe(
      collect({
        collectBy: ({ category }) => [category],
        filter: ({ category }) => category !== 'learning',
        template: 'blog',
        uniqueBy: ({ id }) => id,
        url: ({ index }) => index === 'blog' ? '' : index,
        // meta
        content: 'You won’t believe what this developer didn’t know',
        title: 'blog',
      }),
      collect({
        collectBy: ({ category }) => [category],
        filter: ({ category }) => category === 'blog',
        template: 'rss',
        uniqueBy: ({ id }) => id,
        url: 'feed.xml',
        limit: 10,
        // meta ?
      }),
      collect({
        collectBy: ({ tags }) => tags.map(({ slug }) => slug),
        // filter: ({ category }) => category === 'blog',
        template: 'tag',
        uniqueBy: ({ id }) => id,
        url: ({ index }) => `tag/${index}`,
        // meta ?
      }),
      map(renderPage(tplDic, tplCfg, siteMeta)),
      write('build'),
    )(posts);

    l(`Setting up pages`);
    const pages = map(
      parseStaticPage,
      observeSource('*.md', { cwd: Path.join(__dirname, 'contents') }),
    );

    pipe(
      map(renderPage(tplDic, tplCfg, siteMeta)),
      write('build'),
    )(pages);

    l(`Ready to roll`);
  } catch (err) {
    console.log(err);
    throw new Error(
      'Something went wrong while reading and compiling templates',
    );
  }
});

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
      baseDir: './build',
    },
    middleware: [
      modRw([
        '^/feed/??$ /feed.xml [L]', // see _redirects for production redirects (https://www.netlify.com/docs/redirects)
      ]),
    ],
  });
});

gulp.task('default', ['static', 'sass', 'contents']);
