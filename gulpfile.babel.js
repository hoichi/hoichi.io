'use strict';

var _       = require('lodash'),
    bSync   = require('browser-sync'),
    fMatter = require('gulp-front-matter'),
    fs      = require('fs'),
    glob    = require('glob'),
    gulp    = require('gulp'),
    jade    = require('jade'),
    mDown   = require('gulp-markdown-it'),
    newer   = require('gulp-newer'),
    path    = require('path'),
    prism   = require('prismjs'),
    rename  = require('gulp-rename'),
    sass    = require('node-sass'),
    through = require('through2'),
    watch   = require('gulp-watch'),
    yaml    = require('js-yaml');

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

function sleeve(vinyl) {
    var err;
    try {
        if (vinyl.isNull() || vinyl.contents === null) {
            cb(null, vinyl);
            return;
        } else if (vinyl.isStream()) {
            err = new Error('Can\'t compile a stream. Please pass a regular vinyl.');
            throw err;
        }

        fn.call(vinyl, opts);    // todo: will we need a callback some day?
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
        .pipe(
            through.obj( function tf_compileAJadeVinyl(file, enc, cb) {
                playTheVinyl(
                    file, (f, o) => {
                        let key = path.basename(file.path, '.jade'),
                            method  = jade.compile(file.contents.toString(), {
                                pretty: '\t',
                                filename: file.path
                            });

                        cfg.layouts[key] = method;
                    },
                    {encoding: enc},
                    cb
                );
            }).on( 'end', function tf_compileAJadeVinyl_end() {console.log('that would be all'); cb_t()} )
        );
});

gulp.task('gather', ['loadCfg'], function gtGather(cb_t) {
    var cc = cfg.sources.contents;

    gulp.src( path.join(cc.path, `**/*.@(${cc.extensions})`), {base: cc.path})
        .on('data', function gtGather_onData(file) {
            const baseParser = new RegExp(`(.*)\.(${cc.extensions})`);

            var rel = path.relative(cfg.rootDir, file.path),
                base = path.basename(rel).match( baseParser )[1],
                dir = path.dirname(rel),
                contents = file.contents.toString(cc.encoding);

            // todo: add a node to object.
            // - sort it chronologically. add first, then sort the array. it's faster to implement, and optimization can wait
            // - use yfm for date/time. we can add parsing date from a file name later
            // - add global/folder-level setting for date/time formatting (what do we use to actually format it?)
            // - no explicit `status:published` — it's a draft, so leave it
            // - no date, no content, no title — it's a draft (with a warning)
            // - settings to allow a post with no tag/category
            // - settings for post/page etc. override default settings
            // todo: read yfm. probably some defaults
            //          we could probably keep all the stuff we could need at any moment (down to excerpts)
            //              in the big objects but keep the contents in files to save the memory
            //          do the sorting on the fly?
            // todo: convert md to html contents
            //          do we need to remember links to that? or the dir structure is zero-config?
            //          or we could keep all the file data?
            //          or can we just put it into the object, for starters

        })
        .on('end', cb_t);
});

gulp.task('renderPages', ['loadCfg', 'loadJade', 'pages.parse'], function gt_pages_render(cb_t) {
//  $TODO: render pages with pre-compiled Jade functions
//          push a vinyl object?
//  $TODO: change extension, put to  dir — done, more or less
    //  where do we do navigation? we should add it to our single pages
});

gulp.task('renderArchives', ['loadCfg', 'loadJade', 'pages.parse'], function gt_pages_render(cb_t) {

});

gulp.task('posts', ['loadCfg', 'loadJade'], function gt_posts() {

/*
* Процесс
*   - ну, мета из yamlа — понятно
*       - заголовок
*       - тип поста
*           или это от папки зависит? или абстрагировать?
*           хотя если все будет в одном таске, абстрагировать можно и потом
*   - из той же меты (и маркдауна) собирать заголовки, тэги и тизеры для постов
*       - и кэшировать?
*       - или сразу стримить везде?
*       - наверно, с кэшированием проще. можно, типа, нахерачить модель, а потом уже дергать ее, как хочешь
*           - можно еще, конечно, сделать ленивую модель (не исключено, что со стримами оно примерно так и выйдет)
*           - но для начала сойдет и так. будут адские объемы — будем оптимизировать
*
*   очередь, видимо, такая:
*
*       1. читаем глобальный yaml, начинаем создавать модель
*       2. читаем все md. собираем в модель yfm [и первые параграфы]. возможно, перекладываем куда-то голый маркдаун
*       3. возможно, читаем весь наличный Jade
*       4. имея полную модель, конвертируем макрдаун в страницы. с шапками-подвалами, навигацией и перекрестными ссылками
*       5. (возможно, параллельно) сортируем и формируем оглавления
*
*   где, кстати, мы задаем всякую там навигацию?
*   а хотя бы и в Джейде. похуй, что не семантично. зато надежно и практично
*
*
*   ++ прикинуть, что в каких папках будет лежать? или пока кроме about и постов в blog у меня ничего нету
* */

    return  gulp.src('contents/**/*.md')
        .pipe(
            fMatter({
                property: 'yfmMeta',
                remove: true
            })
        ).pipe(
            mDown({
                preset: 'commonmark',
                options: {
                    breaks: true,
                    linkify: true
                }
            })
        ).pipe(
            jade({
                pretty: true,
                debug: true,
                compileDebug: true
            })
        ).pipe(
            rename(function gt_posts_rename(path) {
                var basename = path.basename;

                path.extname = '.html';

                if (basename !== 'index') {
                    path.dirname += '/' + basename;
                    path.basename = 'index';
                }
            })
        ).pipe(
            gulp.dest('build')
        );
});