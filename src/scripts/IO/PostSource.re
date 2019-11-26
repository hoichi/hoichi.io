open Lib;

module Str = Js.String2;

module ParsedSource = {
  type t = {
    rawMeta: Js.Json.t,
    rawMarkup: string, /* Not validated, hence raw, in theory.
                            In practice, we don’t ever parse it so far.
                            Also, not like the type reflect any rawness. */
    source: SourceFile.t,
  };

  let fromFile = (source: SourceFile.t) => {
    let SourceFile.RawContent(content) = source.rawContent;
    let parsed = FrontMatter.parse(content);

    {rawMarkup: parsed##body, rawMeta: parsed##attributes, source};
  };
};

let toPost = (sourceFile: SourceFile.t): Post.t => {
  let {rawMarkup, rawMeta, source}: ParsedSource.t =
    ParsedSource.fromFile(sourceFile);
  let content = String.trim(rawMarkup);

  Decode.{
    id: source.path.full,
    meta: {
      date: rawMeta |> field("date", string) |> Js.Date.fromString,
      published: rawMeta |> (field("published", bool) |> withDefault(true)),
      tags: rawMeta |> field("tags", list(string)),
    },
    title: rawMeta |> field("title", string),
    content: Markup.Markdown(content),
    excerpt:
      rawMeta
      |> field("exerpt", optional(string))
      |> Option.or_(_, () => Utils.Strings.getFirstParagraph(content))
      |> Option.getExn
      |> (s => Markup.Markdown(s)),
  };
  /* todo: check the wild cases
         - the tags field is there but is empty
         - getFirstParagraph comes up with nothing (no content)
     */
};
