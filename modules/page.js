'use strict';

const   fm =    require('front-matter'),
        fs =    require('fs'),
        _ =     require('lodash'),
        path =  require('path'),
        u =     require('./utils.js');


function pageFabric() {
    var _p = {
        isReady: false,
        category: '',       // post category
        content: '',        // post content in HTML (HTML is lingua franca and we're agnostic
                            // of original markup as much as possible)
        description: '',    // post description for meta, search engines and prob. TOCs and archive stuff
        excerpt: '',        // before the fold
        isStub: false,
        path: '',           // the part between the building dir and the slug
        site: null,         // the object for the site that contains the page
        slug: '',           // the part of the URL after the last slash
        style: {},          // looks specific to the page
        tags: [],           // a bunch of post tags
        time: new Date(),   // a dateString, etc. '25 Dec 1995 13:30:00 +0430'
        title: ''
    };

    return getApi();


    function getApi() {
        return {
            get category()      {return ifReady(_p.category)},
            get content()       {return ifReady(_p.content)},
            get date()          {return ifReady(_p.time)},
            get description()   {return ifReady(_p.description)},
            get excerpt()       {return ifReady(_p.excerpt)},
            get link()          {return ifReady( path.join(_p.path, _p.slug) )},
            get path()          {return ifReady(_p.path)},
            get slug()          {return ifReady(_p.slug)},
            get style()         {return ifReady(_p.style)},
            get tags()          {return ifReady(_p.tags)},
            get time()          {return ifReady(_p.time)},
            get title()         {return ifReady(_p.title)},

            url() {return `${_category}/${_slug}`; },   // todo

            prev() {return _site.prev(_index)},         // todo

            next() {return _site.next(_index)},         // todo

            ready,
            fromSource
        };
    }

    /*
     *  Takes a source object with a source path etc. And the options from the global config.
     */
    function fromSource(source, site, options) {
        // fixme: нужны ли дефолты здесь?
        const   cfg = Object.assign({
                    defCat: 'blog',
                    extensions: '*',
                    encoding: 'UTF-8',
                    markup: s => s,  /* do nufin' by default. agnostic, muthafucka! */
                    rootDir: __dirname
                }, options);

        const baseParser = new RegExp(`(.*)\.(${cfg.extensions})`);

        var rel = path.relative(cfg.rootDir, source.path),
            base = path.basename(rel).match(baseParser)[1],
            dir = path.dirname(rel),
            srcCont = source.contents.toString(cfg.encoding),
            meta,
            body;

        try {
            ({attributes: meta, body} = fm(srcCont));
        } catch(Err) {
            throw new Error(`Reading front-matter failed (${Err.message})`);
        }

        try {
            _p.content = cfg.markup(body);
        } catch(Err) {
            throw new Error(`Markup conversion failed (${Err.message})`);
        }

        const   pageDefaults = {
            category: cfg.defCat,
            path: cfg.defCat,
            /* $TODO: maybe parse default path from the relative path? Or maybe it should be a callback/template from cfg (or passed options) that can use relative path, category, default category, whatevs. */
            slug: u.slugify(meta.title),
            title: '* * *'
        };

        _.assign(
            _p,
            pageDefaults,
            meta,
            {
                site: site,
                isStub: meta.isStub || !meta.title || !body,

                isReady: true
            }
        );

        // some post-meta logic
        if (!_p.excerpt) {
            [, _p.excerpt] = /<p>(.*)?<\/p>/.exec(_p.content);
            // $TODO: take it from non-parsed markdown? maybe?
            // $TODO: look up all those excerpts, teasers and other page anatomy
        }

        if (_p.isStub) {
            // not sure if it actually frees any memory immediately but let's try
            _p.content = _p.description = _p.excerpt = '';
        }

        return getApi();
    }

    function ifReadyCb(cb) {
        if (!_p.isReady) {
            throw new Error('Object Page should be properly filled before you can consume it\'s data. Use `fromSource` or something.');
        } else {
            return cb();
        }
    }

    function ifReady(val) {
        if (!_p.isReady) {
            throw new Error(`Object Page should be properly filled before you can consume it's data. Use \`fromSource\` or something.`);
        } else {
            return val;
        }
    }

    function ready(val) {
        if (typeof val !== 'undefined' &&
            (val !== null || typeofval !== 'object') )
        {
            _p.isReady = !!val;
        }

        return val;
    }
}


export default {
    create: pageFabric
}