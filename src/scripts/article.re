open Tablecloth;

module ParsedSource = {
  type t = {
    rawMeta: Js.Json.t,
    rawMarkup: Markup.t, // not validated, hence raw. then again, how do we validate it if we don’t parse it?
    source: ReadSource.sourceFile,
  };

  let fromFile = (source: ReadSource.sourceFile) => {
    let ReadSource.RawContent(content) = source.rawContent;
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
        |> field("date", optional @@ string)
        |> Option.map(~f=Js.Date.fromString),
      exerpt:
        json
        |> field("exerpt", optional @@ string)
        |> Option.map(~f=s => Markup.Markdown(s)),
      published: json |> field("published", optional @@ bool),
      tags: json |> field("tags", optional @@ list(string)),
      title: json |> field("title", string),
    };
};

type articleMeta = {
  date: Js.Date.t,
  published: bool,
  tags: list(string),
};

type article = {
  meta: articleMeta,
  title: string,
  content: Markup.t,
  excerpt: Markup.t,
  source: ReadSource.sourceFile,
};

let fromSource = (sourceFile: ReadSource.sourceFile): article => {
  let {rawMarkup, rawMeta, source}: ParsedSource.t =
    ParsedSource.fromFile(sourceFile);
  let meta = Meta.parse(rawMeta);

  {
    meta:
      Option.{
        date: meta.date->withDefault(~default=Js.Date.make()),
        published: meta.published->withDefault(~default=true),
        tags: meta.tags->withDefault(~default=[]),
      },
    title: meta.title,
    content: rawMarkup,
    excerpt:
      meta.exerpt
      ->Option.withDefault(
          ~default=
            Markup.map(rawMarkup, ~f=s =>
              Utils.Strings.getFirstParagraph(s)
              ->Option.withDefault(~default="")
            ),
        ),
    source,
  };
};
