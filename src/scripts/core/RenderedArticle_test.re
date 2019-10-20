open Jest;
open Expect;
open ReactTestingLibrary;

describe("Basic article, happy path", () =>
  test("", _ =>
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
    }
    |> RenderedArticle.reactElementFromArticle(_, article =>
         <Mock__PostPage article />
       )
    |> render
    |> expect
    |> toMatchSnapshot
  )
);
