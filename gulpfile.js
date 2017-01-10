'use strict';

const   /*mPage = require('./modules/page.js'),
        mSite = require('./modules/site.js'),
        init = mSite.init,*/
        Chops = require('chops');

const _           = require('lodash'),
      bSync       = require('browser-sync').create(),
      fm          = require('front-matter'),
      fs          = require('fs'),
      gulp        = require('gulp'),
      jade        = require('jade'),
      md          = require('markdown-it')({
          breaks: true,
          html: true,
          typographer: true,
          quotes: '«»„“'
      }),
      modRw       = require('connect-modrewrite'),
      Path        = require('path'),
      sass        = require('gulp-sass'),
      sourcemaps  = require('gulp-sourcemaps'),
      u           = require('./modules/utils.js'),
      yaml        = require('js-yaml');

function l(val, desc) {
    if (desc)
        console.log(desc, val);
    else
        console.log(val);

    return val;
}

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

gulp.task('scatter', [/*'loadCfg',*/], function gtScatter(cb_t) {
    let templates = Chops
            .templates
            .src(   Path.join(cfg.sources.templates, '*.jade')
                ,   {ignored: '!_*.jade'})
            .convert( tpl =>    Object.assign({}, {
                id: tpl.path.name,
                render: jade.compile(tpl.content, {
                    pretty: '\t',
                    filename: tpl.path.path})
            }) )
        ;

    let collections = {
        'blog': Chops.collection({
                    by: p => (p.date || new Date())
                })
                .filter(page => page.path && (page.path.dir === 'blog'))
                .patchCollection(() => ({
                    url: 'blog/index.html',
                    category: 'blog'
                }))
                .render(templates, 'blog')
                .write(Path.join(cfg.rootDir, 'build')),
        '100': Chops.collection({
                    by: p => (p.date || new Date())
                })
                .filter(page => page.path && (page.path.dir === '100'))
                .patchCollection(() => ({
                    url: '100/index.html',
                    category: '100 days of code',
                    short_desc: 'I’m taking part in the <a href="https://medium.freecodecamp.com/join-the-100daysofcode-556ddb4579e4">100 days of code</a> flashmob (TL;DR: you have to code every day, outside of your dayjob). The twist I’ve added is I don’t have a twitter (which is <a href="http://calnewport.com/blog/2013/10/03/why-im-still-not-going-to-join-facebook-four-arguments-that-failed-to-convince-me/">by design</a>), hence I blog about it here.<br>Oh, and don’t read it yet, but <a href="https://github.com/hoichi/chops">here’s the repo</a>.'
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

    Chops.src('**/*', {cwd: Path.join(cfg.rootDir, cfg.sources.contents.path)})
        /* necessary defaults */
        .convert(page =>    Object.assign({
                                date: new Date(),
                                published: true,
                                title: 'Untitled'
                            }, page))
        /* category defaults to folder */
        .convert(page =>    Object.assign({}, page, {
            category:   page.category
                        || page.path && page.path.dir
                        || ''
        }))
        /* processing yfm */
        .convert(page =>    {
            const yfm = fm(page.content);
            return yfm.body
                ? Object.assign({}, page, yfm.attributes, {content: yfm.body})
                : page;
        })
        /* markdown conversion */
        .convert(page =>    Object.assign({}, page, {
            content: md.render(page.content)
        }))
        /* excerpts */
        .convert(page => Object.assign({}, page, {
            excerpt: page.excerpt || u.extract1stHtmlParagraph(page.content)
        }))
        /* destination url */
        .convert(page =>    Object.assign({}, page, {
            url: Path.join(
                page.url || Path.join(
                    page.category || page.path['dir'],
                    page.slug == null ? page.path['name'] : page.slug.toString()
                ),
                'index.html'
            ).replace(/\\/g, '/') || 'untitled/index.html'
        }))
        .collect(collections['blog'])
        .collect(collections['100'])
        .collect(collections['rss'])
        .render(templates, page => page.template || 'single')
        .write(Path.join(cfg.rootDir, 'build'))
    ;
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

gulp.task('default', [/*'scatter',*/ 'static', 'sass']);