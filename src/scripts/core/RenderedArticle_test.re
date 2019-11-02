open Jest;
open Expect;
open ReactTestingLibrary;

describe("Rendering code blocks", () =>
  test("", _ =>
    Post.{
      meta: Mock.AnyOld.meta,
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
      source: Mock.AnyOld.source,
    }
    |> RenderedArticle.reactElementFromArticle(_, article =>
         <Mock__PostPage article />
       )
    |> render
    |> expect
    |> toMatchSnapshot
  )
);
