open Jest;

module AnyOld = Mock.AnyOld;
module RawContent = Mock.RawContent;

describe("ParsedSource", () => {
  let expectToEqual = (expected, received: Post.ParsedSource.t) => {
    let Markup.Markdown(markup) = received.rawMarkup;
    let meta = received.rawMeta;

    Expect.(expect((meta->Js.Json.stringify, markup)) |> toEqual(expected));
  };

  test("fm with a couple of props", () =>
    Post.ParsedSource.(
      fromFile({path: AnyOld.source.path, rawContent: RawContent.coupleProps})
      |> expectToEqual((
           {|{"foo":"FOO","bar":"BAR"}|},
           "\nHere comes the content\n",
         ))
    )
  );

  test("no fm at all", () => {
    let SourceFile.RawContent(contentString) = RawContent.noFm;

    Post.ParsedSource.(
      fromFile({path: AnyOld.source.path, rawContent: RawContent.noFm})
      |> expectToEqual(("{}", contentString))
    );
  });
});

describe("Article.fromSource", () => {
  test("no fm", () =>
    Expect.(
      expect(() =>
        Post.fromSource({
          path: AnyOld.source.path,
          rawContent: RawContent.noFm,
        })
      )
      |> toThrow
    )
  );

  test("some random meta", () =>
    Expect.(
      expect(() =>
        Post.fromSource({
          path: AnyOld.source.path,
          rawContent: RawContent.noFm,
        })
      )
      |> toThrow
    )
  );

  test("full meta", () => {
    let id = AnyOld.source.path.full;

    Expect.(
      expect(
        Post.fromSource({
          path: AnyOld.source.path,
          rawContent: RawContent.fullMeta,
        }),
      )
      |> toEqual(
           Post.{
             id,
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
           },
         )
    );
  });
});
