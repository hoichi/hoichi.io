type processor('out);
type plugin('in_, 'out);
type syntaxTree;

// todo: group with other `use` options
type codeHighlighter;

[@bs.deriving {abstract: light}]
type vFile('a) = {contents: 'a};

[@bs.module] external remark: unit => processor(string) = "remark";
[@bs.send]
external use: (processor('a), plugin('a, 'b)) => processor('b) = "use";
/*
  todo: full sequence be like:
  - `parse` (remark)
  - `run` (html)
  - `render` (remark-react)
   [@bs.send] external parse: (processor('a), string) => syntaxTree = "parse";
   [@bs.send]
   external render: (processor('a), syntaxTree) => string = "stringify";
 */
[@bs.send]
external processSync: (processor('a), string) => vFile('a) = "processSync";

//  [@bs.module] external remarkHtml: plugin(string, string) = "remark-html";

[@bs.module]
external remarkReact: plugin(string, React.element) = "remark-react";

let processor = remark()->use(remarkReact);

module Lowlight = {
  type langPlugin;

  // The fabric accepts an object, but numeric keys will probably work
  [@bs.module]
  external lowlightFabric: array(langPlugin) => codeHighlighter =
    "remark-react-lowlight";

  [@bs.module]
  external langJs: langPlugin = "highlight.js/lib/languages/javascript";
  [@bs.module]
  external langOcaml: langPlugin = "highlight.js/lib/languages/ocaml";
  [@bs.module]
  external langReasonml: langPlugin = "highlight.js/lib/languages/reasonml";
  [@bs.module]
  external langTs: langPlugin = "highlight.js/lib/languages/typescript";

  let langAll = [|langJs, langOcaml, langReasonml, langTs|];

  let make = () => lowlightFabric(langAll);
};
/*

 import githubSchema from 'hast-util-sanitize/lib/github.json';

 const schema = Object.assign({}, githubSchema, {
   attributes: Object.assign({}, githubSchema.attributes, {
     code: [
       ...(githubSchema.attributes.code || []),
       'className'
     ]
   })
 });

 ...
 {remark().use(reactRenderer, {
   sanitize: schema,
   remarkReactComponents: {
     code: RemarkLowlight({
       js
     })
   }
 }).processSync(readme).contents}


 */
