// todo: import the bs.js
const { parsePost, parseStaticPage } = require(`../scripts/parsePage`);

describe('Pages parsing and conversion', () => {
	test('parsePost basics', () => {
		const path = {
			dir: 'contents/blog',
			dirs: ['contents', 'blog'],
			ext: 'md',
			name: 'pipes-are-fast',
			full: 'contents/blog/pipes-are-fast.md',
		};

		const rawContent = `---
permalink: false
title: "Pipes are Fast but We Are Faster"
date: 2018-11-15T11:53:00
slug: fast-and-faster
published: false
tags: [ Reason, twit-like, TIL ]
---

The horror! The drama!
`;

		expect(parsePost({ path, rawContent })).toEqual({
			category: 'contents/blog',
			content: '<p>The horror! The drama!</p>\n',
			date: new Date('2018-11-15T11:53:00.000Z'),
			excerpt: 'The horror! The drama!',
			id: 'contents/blog/pipes-are-fast.md',
			kind: 'post',
			permalink: false,
			published: false,
			slug: 'fast-and-faster',
			tags: [
				{ slug: "Reason", title: "Reason" },
				{ slug: "twit-like", title: "twit-like" },
				{ slug: "TIL", title: "TIL" },
			],
			title: "Pipes are Fast but We Are Faster",
			url: 'contents/blog/fast-and-faster',
		});
	});

	test('parseStaticPage basics', () => {
		const path = {
			dir: 'contents',
			dirs: ['contents'],
			ext: 'md',
			name: 'about',
			full: 'contents/about.md',
		};

		const rawContent = `---
title: About Me
template: about
---

In another life, I’d probably be a novelist.
`;

		expect(parseStaticPage({ path, rawContent })).toEqual({
			kind: 'static',
			content: '<p>In another life, I’d probably be a novelist.</p>\n',
			template: 'about',
			title: "About Me",
			url: 'contents/about',
		});
	});
});

