import * as fm from 'front-matter';
import * as markdownIt from 'markdown-it';
import * as prism from 'markdown-it-prism';

import { Page, Post, SourceFile, StaticPage } from './model';
import { extract1stHtmlParagraph, constructPageUrl } from './utils';
import slugify from 'slugify';

// init markdown-it
const md = markdownIt({
  breaks: true,
  html: true,
  typographer: true,
  quotes: '«»„“',
});
md.use(prism, () => void 0);

function parseSource(page: SourceFile) {
  const { path, rawContent } = page;

  const { body = rawContent, attributes = {} } = fm(rawContent);

  return {
    content: md.render(body),
    meta: attributes,
    path
  }

}

function parsePost(page: SourceFile): Post {
  const { path, content, meta } = parseSource(page);

  const result = {
    // id is crucial
    id: path.full,
    // here’s some defaults
    title: 'Untitled',
    date: new Date(),
    //
    published: true,
    category: path.dir || '',
    //
    content,
    excerpt: extract1stHtmlParagraph(content),

    // and here we override them with the yfm data
    // not too lazy, yes
    ...meta,

    tags: (meta['tags'] || []).map(tag => ({
      title: tag,
      slug: slugify(tag),
    })),
  };

  return {
    kind: 'post',
    ...result,
    // we need meta for constructPageUrl
    // fixme: it’s all hacky and brittle
    url: result['url'] || constructPageUrl({ ...page, ...result }),
  };
}

function parseStaticPage(page: SourceFile): StaticPage {
  const { path, content, meta } = parseSource(page);

  if (!meta['title']) throw Error(`No title found for ${path.full}`);

  return {
    kind: 'static',
    content,
    template: 'single',
    ...meta,
    url: constructPageUrl({ ...page, ...meta }),
  }
}


export { parsePost, parseStaticPage };
