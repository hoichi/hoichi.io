/**
 * Created by hoichi on 18.10.15.
 */

'use strict';

/*
 *  Takes a source object with a source path etc. And the options from the global config.
 *  TODO: proxies!  https://ponyfoo.com/articles/es6-proxies-in-depth
 *  TODO: an interface that _p should conform to
 */
function PageFactory(pageSource, options) {
    var _p = {
        index,
        category,       // post category
        content,        // post content in HTML (HTML is lingua franca and we're agnostic
                            // of original markup at this point)
        description,    // post description for meta, search engines and prob. TOCs and archive stuff
        excerpt,        // before the fold
        title,
        site,           // the object for the site that contains the page
        slug,           // the part of the URL after the last slash
        source,         // an object dealing with the MD source (do we need to expose it in API?)
        style,          // looks specific to the page
        tags            // a bunch of tags
    };

    options = Object.assign({
        markup: s => s  // do nufin' by default. agnostic, muthafucka!
    }, options);

    return init(pageSource, init)

    return {
        get index() {return _p.index},
        get category() {return _p.category},
        get content() {return _p.content},
        get description() {return _p.description},
        get excerpt() {return _p.excerpt},
        get title() {return _p.title},
        get slug() {return _p.slug},
        get tags() {return _p.tags},

        url() {return `${_p.category}/${_p.slug}`;    /*todo*/ },

        prev() {return _p.site.prev(_p.index)},

        next() {return _p.site.next(_p.index)}
    }
}
