/**
 * Created by hoichi on 07.11.15.
 */
'use strict';

var fs      = require('fs'),
    path    = require('path');

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
    var re = /\$\((\w+)\)/g;

    return template.replace(
        re,
        (_match, key) => meta[key]
    );
}

function makePathSync(sPath, options = {}) {
    const p = path.parse(sPath);
    let dir = options.baseDir || p.root;

    // $TODO:   throw on empty baseDir
    //          (or require full paths, for that matter)

    p.dir.split(path.sep).forEach((el, idx, arr) => {
        dir = path.resolve(dir, el);
        try {
            fs.accessSync(dir, fs.F_OK);
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

module.exports = {
    makePathSync,
    renderTemplate,
    slugify,
    tplToPath
};