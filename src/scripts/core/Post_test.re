open Jest;

let anyOldPath =
  SourceFile.{
    dir: "a/b/c",
    name: "d",
    ext: ".e",
    dirs: ["a", "b", "c"],
    full: "a/b/c/d.e",
  };

module RawContent = {
  let noFm = "# H1\n\nWho needs the fm anyway.\n"->SourceFile.RawContent;

  let coupleProps =
    {|---
foo: FOO
bar: BAR
---

Here comes the content
|}
    ->SourceFile.RawContent;

  let fullMeta =
    {|---
date: '2019-06-01T20:38:01.155Z'
exerpt: Upon the sign the challengers with shrieks and cries rush forth
published: true
tags: [foo, bar]
title: The Sentinel
---

Along deserted avenues
The steam begins to rise
|}
    ->SourceFile.RawContent;
};

describe("ParsedSource", () => {
  let expectToEqual = (expected, received: Post.ParsedSource.t) => {
    let Markup.Markdown(markup) = received.rawMarkup;
    let meta = received.rawMeta;

    Expect.(expect((meta->Js.Json.stringify, markup)) |> toEqual(expected));
  };

  test("fm with a couple of props", () =>
    Post.ParsedSource.(
      fromFile({path: anyOldPath, rawContent: RawContent.coupleProps})
      |> expectToEqual((
           {|{"foo":"FOO","bar":"BAR"}|},
           "\nHere comes the content\n",
         ))
    )
  );

  test("no fm at all", () => {
    let SourceFile.RawContent(contentString) = RawContent.noFm;

    Post.ParsedSource.(
      fromFile({path: anyOldPath, rawContent: RawContent.noFm})
      |> expectToEqual(("{}", contentString))
    );
  });
});

describe("Article.fromSource", () => {
  test("no fm", () =>
    Expect.(
      expect(() =>
        Post.fromSource({path: anyOldPath, rawContent: RawContent.noFm})
      )
      |> toThrow
    )
  );

  test("some random meta", () =>
    Expect.(
      expect(() =>
        Post.fromSource({path: anyOldPath, rawContent: RawContent.noFm})
      )
      |> toThrow
    )
  );

  test("full meta", () => {
    let source =
      SourceFile.{path: anyOldPath, rawContent: RawContent.fullMeta};

    Expect.(
      expect(Post.fromSource(source))
      |> toEqual(
           Post.{
             meta: {
               date: Js.Date.fromString("2019-06-01T20:38:01.155Z"),
               published: true,
               tags: ["foo", "bar"],
             },
             title: "The Sentinel",
             content:
               Markup.Markdown(
                 "Along deserted avenues\nThe steam begins to rise",
               ),
             excerpt:
               Markup.Markdown(
                 "Upon the sign the challengers with shrieks and cries rush forth",
               ),
             source,
           },
         )
    );
  });
});
