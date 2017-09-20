/**
 * Created by hoichi on 07.11.15.
 */
'use strict';

import * as fs from 'fs';
import * as path from 'path';

function slugify(s) {
    if (typeof s !== 'string') {
        throw new Error('You cannot slugify it if it\'s not a string.');
    }
    else if (!s) {
        throw new Error('What\'s your business passing an empty string? No such thing as an empty slug.');
    }
    else {
        return encodeURI( s.toLowerCase().replace(/\s|\W/g, '-') );
    }
}

function tplToPath(meta, template) {
    const re = /\$\((\w+)\)/g;

    return template.replace(
        re,
        (_match, key) => meta[key]
    );
}

function makePathSync(sPath, {baseDir = null} = {}) {
    const p = path.parse(sPath);
    let dir = baseDir || p.root;

    // $TODO:   throw on empty baseDir
    //          (or require full paths, for that matter)

    p.dir.split(path.sep).forEach((el, idx, arr) => {
        dir = path.resolve(dir, el);
        try {
            fs.accessSync(dir, fs.constants.F_OK);
        }
        catch (err) {
            if (err.code !== 'ENOENT') {
                throw err;
            }

            fs.mkdirSync(dir);
        }
    });
}

function renderTemplate(tpl, data, dirs) {
    const   html = tpl(data),
            sPath = Array.isArray(dirs) ? path.join(...dirs) : dirs;

    makePathSync(sPath);
    fs.writeFileSync(sPath, html, {flag: 'w+'});
}

function dateFormatter(locale = 'en_US', options) {
    // $TODO: something more customizable? moments.js? or?
    let dtf = new Intl.DateTimeFormat(locale, options);
    return dtf.format.bind(dtf);
}

function extract1stHtmlParagraph(html) {
    let excerpt = /<p>(.*)?<\/p>/.exec(html)[1];
    return excerpt.replace(/<(.|\n)*?>/g, '');
}

function l(val, desc) {
    if (desc)
        console.log(desc, val);
    else
        console.log(val);

    return val;
}

function constructPageUrl(page) {
    let url = page.url;

    if (!url) {
        let slug = page.slug;
        if (slug == null) {
            slug = (name => name === 'index' ? '' : name)(page.path['name']);
        }

        url = Path.join(
            page.category || page.path['dir'],
            slug
        );
    }

    return  url.replace(/\\/g, '/')
        || 'untitled/'
}

//noinspection SpellCheckingInspection
module.exports = {
    dateFormatter,
    extract1stHtmlParagraph,
    makePathSync,
    renderTemplate,
    slugify,
    tplToPath,
    constructPageUrl,
    l,
};