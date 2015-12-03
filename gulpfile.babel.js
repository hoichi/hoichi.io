'use strict'

import mPage from './modules/page.js';
import mSite, {init as siteInit} from './modules/site.js';

var _           = require('lodash'),
    bSync       = require('browser-sync'),
    chalk       = require('chalk'),
    fMatter     = require('gulp-front-matter'),
    fs          = require('fs'),
    glob        = require('glob'),
    gulp        = require('gulp'),
    jade        = require('jade'),
    md          = require('markdown-it')(),
    newer       = require('gulp-newer'),
    path        = require('path'),
    prism       = require('prismjs'),
    rename      = require('gulp-rename'),
    sass        = require('gulp-sass'),
    sourcemaps  = require('gulp-sourcemaps'),
    through     = require('through2'),
    u           = require('./modules/utils.js'),
    watch       = require('gulp-watch'),
    yaml        = require('js-yaml');

const cfg = {
        layouts: {},    // fixme: that doesn't belong in config
        sources: {
            contents: {
                path: 'contents',
                encoding: 'UTF-8',
                extensions: 'md|mdown|markdown'
            },
            templates: 'theme/jade',
            styles: 'theme/sass'
        },
        rootDir: __dirname
    };

var site;

function playTheVinyl(file, fn, opts, cb) { // fixme: we never finish the task
    var err;
    try {
        if (file.isNull() || file.contents === null) {
            cb(null, file);
            return;
        } else if (file.isStream()) {
            err = new Error('Can\'t compile a stream. Please pass a regular file.');
            throw err;
        }

        fn.call(file, opts);    // todo: will we need a callback some day?
    } catch(e) {
        cb(e);
    }
}

gulp.task('loadCfg', function gt_loadCfg(cb) {
    // just start with loading global stuff
    var rootCfg = yaml.safeLoad(fs.readFileSync('config.yaml', 'utf8'));
    _.merge(cfg, rootCfg);
    cb();
});

gulp.task('loadJade', ['loadCfg'], function gt_loadJade(cb_t) {
    gulp.src([path.join(cfg.sources.templates, '*.jade'), '!_*.jade'])
        .on('data', function gtLoadJade_onData(file) {
            let key = path.basename(file.path, '.jade'),
                method  = jade.compile(file.contents.toString(), {
                    pretty: '\t',
                    filename: file.path
                });

            cfg.layouts[key] = method;
        })
        .on( 'end', function gtLoadJade_onEnd() {
            console.log('that would be all'); cb_t()
        })
    ;
});

gulp.task('gather', ['loadCfg'], function gtGather(cb_t) {
    var cc = cfg.sources.contents;

    site = siteInit();

    gulp.src( path.join(cc.path, `**/*.@(${cc.extensions})`), {base: cc.path})
        .on('data', function gtGather_onData(file) {
            var page = mPage.create()
                            .fromSource(file, null, {
                                extensions: 'md|mdown|markdown',
                                markup: s => md.render(s)
                            });

            site.addPost(page);
        })
        .on('end', cb_t);
});

gulp.task('scatter', [/*'loadCfg',*/ 'loadJade', 'gather'], function gtScatter(cb_t) {
    if (!site.posts) {
        throw new Error('What, no posts?');
    }

    site.posts.forEach(function gtScatter_forEachPost(post, idx) {
        const   tpl     = cfg.layouts['single'],
                data = {
                    'page':post
                },
                html = tpl(data);

        let fullPath = path.resolve(cfg.rootDir, `build`, post.path, post.slug, `index.html`);
        u.makePathSync(fullPath);
        fs.writeFileSync(fullPath, html, {flag: 'w+'});

        //$TODO: use post.layout (or should a ~~post~~ page type mean more than just layout?)

        //$TODO: pagination
    });

    const   forFeed = site.posts.slice(0, 10),
            feedTpl = cfg.layouts['blog'],
            feedHtml = feedTpl({posts: forFeed});
    let fullPath = path.resolve(cfg.rootDir, `build/blog/index.html`);
    fs.writeFileSync(fullPath, feedHtml, {flag: 'w+'});

    const   forRSS = site.posts.slice(0, 20),
            rssTpl = cfg.layouts['rss'],
            rssHtml = rssTpl({posts: forRSS, site});
    fullPath = path.resolve(cfg.rootDir, `build/feed/index.xml`);
    u.makePathSync(fullPath);
    fs.writeFileSync(fullPath, rssHtml, {flag: 'w+'});

    // $TODO: abstract the whole render-write cycle
});

gulp.task('renderArchives', ['loadCfg', 'loadJade', 'pages.parse'], function gt_pages_render(cb_t) {

});


gulp.task('sass', function gtSass () {
    gulp.src('./theme/sass/**/*.scss')
        .pipe(sourcemaps.init())
            .pipe(
                sass({outputStyle: 'compressed'})
                    .on('error', sass.logError)
            )
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('./build/css'));
});

gulp.task('sass:watch', function gtSassWatch () {
    gulp.watch('./theme/sass/**/*.scss', ['sass']);
});
