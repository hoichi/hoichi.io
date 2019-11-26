open Jest;

describe("Strings", () =>
  describe("getFirstParagraph", () => {
    test("empty string yields none", () =>
      Expect.(expect(Utils.Strings.getFirstParagraph("")) |> toEqual(None))
    );

    test("one-liner yields a line", () =>
      Expect.(
        expect(Utils.Strings.getFirstParagraph("blah"))
        |> toEqual(Some("blah"))
      )
    );

    test("multi-liner yields first line", () =>
      Expect.(
        expect(
          Utils.Strings.getFirstParagraph({|

first

second

        |}),
        )
        |> toEqual(Some("first"))
      )
    );

    test("soft break doesn’t end the paragraph", () =>
      Expect.(
        expect(Utils.Strings.getFirstParagraph({|

first
second

        |}))
        |> toEqual(Some("first\nsecond"))
      )
    );
  })
);
