open Jest;

let anyOldPath: ReadSource.filePath = {
  dir: "a/b/c",
  name: "d",
  ext: ".e",
  dirs: ["a", "b", "c"],
  full: "a/b/c/d.e",
};

let rawContentCoupleProps = {|---
foo: FOO
bar: BAR
---

Here comes the content
|};

describe("parseSource", () => {
  let expectToEqual = (expected, received: ParsePage.articleSource) => {
    let ParsePage.Markdown(markup) = received.rawMarkup;
    let meta = received.rawMeta;

    Expect.(expect((meta->Js.Json.stringify, markup)) |> toEqual(expected));
  };

  test("fm with a couple of props", () =>
    ParsePage.(
      parseSource({
        path: anyOldPath,
        rawContent: rawContentCoupleProps->ReadSource.RawContent,
      })
      |> expectToEqual((
           {|{"foo":"FOO","bar":"BAR"}|},
           "\nHere comes the content\n",
         ))
    )
  );

  test("no fm at all", () => {
    let noFmContent = "# H1\n\nWho needs the fm anyway.\n";
    ParsePage.(
      parseSource({
        path: anyOldPath,
        rawContent: noFmContent->ReadSource.RawContent,
      })
      |> expectToEqual(("{}", noFmContent))
    );
  });
});
