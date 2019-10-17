open Jest;

describe("Basic article, happy path", () =>
  test("", _ =>
    Expect.(
      expect(
        RenderedArticle.htmlStringFromArticle(
          Article.{
            meta: {
              date: Js.Date.fromString("2019-06-01T20:38:01.155Z"),
              published: true,
              tags: ["hello", "world"],
            },
            content: Markup.Markdown("Good _day_, kind sir!"),
            excerpt:
              Markup.Markdown("Should we render excerpt on the post at all?"),
            title: "Hello world!",
            source: {
              path: {
                dir: "",
                ext: "",
                name: "",
                dirs: [],
                full: "",
              },
              rawContent: ReadSource.RawContent("Who cares"),
            },
          },
        ),
      )
      |> toBe("<p>Good <em>day</em>, kind sir!</p>\n")
    )
  )
);
