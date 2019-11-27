open Jest;

module AnyOld = Mock.AnyOld;
module RawContent = Mock.RawContent;

describe("PostSource.toPost", () => {
  test("no fm", () =>
    Expect.(
      expect(() =>
        PostSource.toPost({
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
        PostSource.toPost({
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
        PostSource.toPost({
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
               slug: "the-sentinel",
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
