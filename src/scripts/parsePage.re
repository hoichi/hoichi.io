module FrontMatter = {
  type parseResult = {
    .
    "body": string,
    "attributes": Js.Json.t,
  };

  [@bs.module] external parse: string => parseResult = "front-matter";
};

[@bs.module] external slugify: string => string = "slugify";

type markup =
  | Markdown(string);

type articleSource = {
  rawMeta: Js.Json.t,
  rawMarkup: markup, // not validated, hence raw. then again, how do we validate it if we don’t parse it?
  source: ReadSource.sourceFile,
};

let parseSource = (source: ReadSource.sourceFile): articleSource => {
  let ReadSource.RawContent(content) = source.rawContent;
  let parsed = FrontMatter.parse(content);

  {rawMarkup: Markdown(parsed##body), rawMeta: parsed##attributes, source};
};

/*
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
   }
 }


 export { parsePost, parseStaticPage };
 */
