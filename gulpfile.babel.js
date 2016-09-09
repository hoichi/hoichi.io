'use strict';

import mPage from './modules/page.js';
import mSite, {init as siteInit} from './modules/site.js';

var _           = require('lodash'),
    bSync       = require('browser-sync').create(),
    fs          = require('fs'),
    gulp        = require('gulp'),
    jade        = require('jade'),
    md          = require('markdown-it')(),
    modRw       = require('connect-modrewrite'),
    path        = require('path'),
    sass        = require('gulp-sass'),
    sourcemaps  = require('gulp-sourcemaps'),
    u           = require('./modules/utils.js'),
    yaml        = require('js-yaml');

const cfg = {
        layouts: {},
        sources: {
            contents: {
                path: 'contents',
                encoding: 'UTF-8',
                extensions: 'md|mdown|markdown'
            },
            templates: 'theme/jade',
            styles: 'theme/sass'
        },
        rootDir: __dirname,
        date_short: u.dateFormatter('en-US', {year: 'numeric', month: 'short', day: 'numeric'})
    };

var site;

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
            console.log('that would be all');
            cb_t();
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
        u.renderTemplate(
            cfg.layouts[post.template],
            {page:post, site, cfg},
            [cfg.rootDir, `build`, post.path, post.slug, `index.html`]
        );
    });

    u.renderTemplate(
        cfg.layouts['blog'],
        {
            // $FIXME: de-hardcode, de-heuristicize
            // $TODO: blog pagination
            posts: _(site.posts).filter({'path': 'blog'}).slice(0, 10).value(),
            category: 'blog',
            cfg,
            short_desc: '',
            site
        },
        [cfg.rootDir, `build/blog/index.html`]
    );

    u.renderTemplate(
        cfg.layouts['blog'],
        {
            // $FIXME: de-hardcode, de-heuristicize
            // $TODO: blog pagination
            posts: _(site.posts).filter(({path, listed}) => path === '100' && listed).value(),
            category: '100 days of code',
            cfg,
            short_desc: 'I’m taking part in the <a href="https://medium.freecodecamp.com/join-the-100daysofcode-556ddb4579e4">100 days of code</a> flashmob (TL;DR: you have to code every day, outside of your dayjob). The twist I’ve added is I don’t have a twitter (which is <a href="http://calnewport.com/blog/2013/10/03/why-im-still-not-going-to-join-facebook-four-arguments-that-failed-to-convince-me/">by design</a>), hence I blog about it here.<br>Oh, and don’t read it yet, but <a href="https://github.com/hoichi/chops">here’s the repo</a>.',
            site
        },
        [cfg.rootDir, `build/100/index.html`]
    );

    u.renderTemplate(
        cfg.layouts['rss'],
        {
            posts: _(site.posts).filter({'path': 'blog'}).slice(0, 20).value(),
            site,
            cfg
        },
        [cfg.rootDir, `build/feed.xml`]
    );
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

gulp.task('static-js', function gtStaticJS () {
    gulp.src('./theme/js/lib/*.js')
        .pipe(gulp.dest('./build/js/'));
});

gulp.task('static-redirects', function gtStaticRw () {
    gulp.src('./theme/_redirects')
        .pipe(gulp.dest('./build/ z'));  // rewrite rules for netlify. for browserSync, see below.
});

gulp.task('static', ['static-js', 'static-redirects']);

gulp.task('sass:watch', function gtSassWatch () {
    gulp.watch('./theme/sass/**/*.scss', ['sass']);
});

gulp.task('watch', ['sass:watch']);

gulp.task('serve', ['watch'], function gtServe () {
    bSync.init({
        server: {
            baseDir: "./build/"
        },
        middleware: [
            modRw([
                '^/feed/??$ /feed.xml [L]'  // see _redirects for production redirects (https://www.netlify.com/docs/redirects)
            ])
        ]
    });
});

gulp.task('default', ['scatter', 'static', 'sass']);
