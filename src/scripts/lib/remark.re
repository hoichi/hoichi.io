type processor('out);
type plugin('in_, 'out);
type syntaxTree;

[@bs.deriving {abstract: light}]
type reactOutput = {contents: React.element};

[@bs.module] external remark: unit => processor(string) = "remark";
[@bs.send]
external use: (processor('a), plugin('a, 'b)) => processor('b) = "use";
/*
   [@bs.send] external parse: (processor('a), string) => syntaxTree = "parse";
   [@bs.send]
   external stringify: (processor('a), syntaxTree) => string = "stringify";
 */
[@bs.send]
external processSync: (processor('a), string) => 'a = "processSync";

//  [@bs.module] external remarkHtml: plugin(string, string) = "remark-html";

[@bs.module]
external remarkReact: plugin(string, reactOutput) = "remark-react";

let processor = remark()->use(remarkReact);
