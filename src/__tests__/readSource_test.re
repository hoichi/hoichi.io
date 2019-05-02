open Jest;

describe("readSource", () =>
  ReadSource.(
    Expect.(
      test("parsePath happy path", () => {
        let expectation = {
          dir: "a/b/c",
          name: "d",
          ext: ".e",
          dirs: ["a", "b", "c"],
          full: "a/b/c/d.e",
        };

        expect(parsePath("a/b/c/d.e")) |> toEqual(expectation);
      })
    )
  )
);
