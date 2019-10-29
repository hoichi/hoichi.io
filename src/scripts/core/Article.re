open Tablecloth;

module ParsedSource = {
  type t = {
    rawMeta: Js.Json.t,
    rawMarkup: Markup.t, /* Not validated, hence raw, in theory
                            In practice, we don’t ever parse it so far */
    source: SourceFile.t,
  };

  let fromFile = (source: SourceFile.t) => {
    let SourceFile.RawContent(content) = source.rawContent;
    let parsed = FrontMatter.parse(content);

    {rawMarkup: Markdown(parsed##body), rawMeta: parsed##attributes, source};
  };
};

module Meta = {
  type t = {
    date: option(Js.Date.t),
    exerpt: option(Markup.t),
    published: option(bool),
    tags: option(list(string)),
    title: string,
  };

  let parse = json =>
    Json.Decode.{
      date:
        json
        |> field("date", string->optional)
        |> Option.map(~f=Js.Date.fromString),
      exerpt:
        json
        |> field("exerpt", string->optional)
        |> Option.map(~f=s => Markup.Markdown(s)),
      published: json |> field("published", bool->optional),
      tags: json |> field("tags", list(string)->optional),
      title: json |> field("title", string),
    };
};

type t = {
  meta: articleMeta,
  title: string,
  content: Markup.t,
  excerpt: Markup.t,
  source: SourceFile.t,
}
and articleMeta = {
  date: Js.Date.t,
  published: bool,
  tags: list(string),
};

let fromSource = (sourceFile: SourceFile.t): t => {
  let {rawMarkup, rawMeta, source}: ParsedSource.t =
    ParsedSource.fromFile(sourceFile);
  let meta = Meta.parse(rawMeta);
  let content = rawMarkup->Markup.map(~f=String.trim);

  {
    meta:
      Option.{
        date: meta.date->withDefault(~default=Js.Date.make()),
        published: meta.published->withDefault(~default=true),
        tags: meta.tags->withDefault(~default=[]),
      },
    title: meta.title,
    content,
    excerpt:
      meta.exerpt
      ->Option.withDefault(
          ~default=
            content->Markup.map(~f=s =>
              Utils.Strings.getFirstParagraph(s)
              ->Option.withDefault(~default="")
            ),
        ),
    source,
  };
};
