type processor('out);
type plugin('in_, 'out, 'cfg);
type syntaxTree;

[@bs.deriving {abstract: light}]
type vFile('a) = {contents: 'a};

[@bs.module] external remark: unit => processor(string) = "remark";
[@bs.send]
external use: (processor('a), plugin('a, 'b, 'c)) => processor('b) = "use";
[@bs.send]
external use2: (processor('a), plugin('a, 'b, 'cfg), 'cfg) => processor('b) =
  "use";
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

module RemarkReact = {
  type sanitizingSchema;
  type codeHighlighter;

  type options = {
    .
    "sanitize": sanitizingSchema,
    "remarkReactComponents": {. "code": codeHighlighter},
  };

  [@bs.module]
  external plugin: plugin(string, React.element, options) = "remark-react";

  let schema: sanitizingSchema = [%raw
    {|
      (githubSchema => ({
        ...githubSchema,
        attributes: {...githubSchema.attributes,
          code: [
            ...(githubSchema.attributes.code || []),
            'className'
          ],
        }
      }))(require('hast-util-sanitize/lib/github.json'))
    |}
  ];
};

module Lowlight = {
  type langPlugin;

  // The fabric accepts an object, but numeric keys will probably work
  [@bs.module "remark-react-lowlight"]
  external lowlightFabric: array(langPlugin) => RemarkReact.codeHighlighter =
    "default";

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

// todo: move actual data out of the submodules?
// But then again, Lowlight should probably know about sanitizing schema

let processor =
  remark()
  ->use2(
      RemarkReact.plugin,
      {
        "sanitize": RemarkReact.schema,
        "remarkReactComponents": {
          "code": Lowlight.make(),
        },
      },
    );
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
