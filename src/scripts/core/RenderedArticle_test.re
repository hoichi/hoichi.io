open Jest;
open Expect;
open ReactTestingLibrary;

module AnyOld = {
  let meta: Article.articleMeta = {
    date: Js.Date.fromString("2019-06-01T20:38:01.155Z"),
    published: true,
    tags: ["hello", "world"],
  };

  let source =
    SourceFile.{
      path: {
        dir: "",
        ext: "",
        name: "",
        dirs: [],
        full: "",
      },
      rawContent: SourceFile.RawContent("Who cares"),
    };
};

describe("Rendering code blocks", () =>
  test("", _ =>
    Article.{
      meta: AnyOld.meta,
      content:
        Markup.Markdown(
          {|
What do you mean, other languages?

```js
console.log(0.1 + 0.2);
```|},
        ),
      excerpt:
        Markup.Markdown("Are there other languages besides JavaScript?"),
      title: "Hello code!",
      source: AnyOld.source,
    }
    |> RenderedArticle.reactElementFromArticle(_, article =>
         <Mock__PostPage article />
       )
    |> render
    |> expect
    |> toMatchSnapshot
  )
);
