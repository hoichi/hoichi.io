/**
 * Created by hoichi on 07.11.15.
 */
'use strict';

import * as path from 'path';

function dateFormatter(locale = 'en_US', options) {
	// $TODO: something more customizable? moments.js? or?
	let dtf = new Intl.DateTimeFormat(locale, options);
	return dtf.format.bind(dtf);
}

function extract1stHtmlParagraph(html) {
	// prettier-ignore
	let excerpt = (
    /<p>(.*)?<\/p>/.exec(html)
    || /<blockquote>(.*)?<\/blockquote>/.exec(html)
    || [ , '...' ]
  )[1];

	return excerpt.replace(/<(.|\n)*?>/g, '');
}

function l(val, desc) {
	if (desc) console.log(desc, val);
	else console.log(val);

	return val;
}

function constructPageUrl(page) {
	let url = page.url;

	if (!url) {
		let slug = page.slug;
		if (slug == null) {
			slug = ((name) => (name === 'index' ? '' : name))(page.path['name']);
		}

		// fixme: don’t render urls with `path` methods
		url = path.join(page.category || page.path['dir'], slug);
	}

	return url.replace(/\\/g, '/') || 'untitled/';
}

//noinspection SpellCheckingInspection
export { dateFormatter, extract1stHtmlParagraph, constructPageUrl, l };
