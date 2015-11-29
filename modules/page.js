'use strict';

const   fm = require('front-matter'),
        fs = require('fs'),
        path = require('path'),
        u = require('./utils.js');


function pageFabric() {
    var _isReady = false,
        _category,      // post category
        _content,       // post content in HTML (HTML is lingua franca and we're agnostic
                            // of original markup as much as possible)
        _description,   // post description for meta, search engines and prob. TOCs and archive stuff
        _excerpt,       // before the fold
        _isStub = false,
        _title,
        _site,          // the object for the site that contains the page
        _slug,          // the part of the URL after the last slash
        _source,        // an object dealing with the MD source (do we need to expose it in API?)
        _style,         // looks specific to the page
        _tags,          // a bunch of post tags
        _time;          // a dateString, etc. '25 Dec 1995 13:30:00 +0430'

    return getApi();


    function getApi() {
        return {
            get category()      {return ifReady(_category)},
            get content()       {return ifReady(_content)},
            get description()   {return ifReady(_description)},
            get excerpt()       {return ifReady(_excerpt)},
            get title()         {return ifReady(_title)},
            get slug()          {return ifReady(_slug)},
            get style()         {return ifReady(_style)},
            get tags()          {return ifReady(_tags)},
            get time()          {return ifReady(_time)},

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
        const cfg = Object.assign({
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

        _source = source;

        try {
            ({attributes: meta, body} = fm(srcCont));
        } catch(Err) {
            throw new Error(`Reading front-matter failed (${Err.message})`);
        }

        try {
            _content = cfg.markup(body);
        } catch(Err) {
            throw new Error(`Markup conversion failed (${Err.message})`);
        }

        _site   = site;

        _category       = meta.category     || cfg.defCat;
        _excerpt        = meta.excerpt      || '';          // todo: first paragraph
        _description    = meta.description  || _excerpt;
        _time           = meta.time         || new Date();
        _title          = meta.title        || 'No title';
        _tags           = meta.tags         || [];

        _isStub = (meta.isStub || !_title || !_content);
        if (_isStub) {
            // not sure if it actually frees any memory immediately but let's try
            _content = _description = _excerpt = '';
        }

        _slug = meta.slug || u.slugify(_title);

        _isReady = true;

        return getApi();
    }

    function ifReadyCb(cb) {
        if (!_isReady) {
            throw new Error('Object Page should be properly filled before you can consume it\'s data. Use `fromSource` or something.');
        } else {
            return cb();
        }
    }

    function ifReady(val) {
        if (!_isReady) {
            throw new Error(`Object Page should be properly filled before you can consume it's data. Use \`fromSource\` or something.`);
        } else {
            return val;
        }
    }

    function ready(val) {
        if (typeof val !== 'undefined' &&
            (val !== null || typeofval !== 'object') )
        {
            _isReady = !!val;
        }

        return val;
    }
}


export default {
    create: pageFabric
}