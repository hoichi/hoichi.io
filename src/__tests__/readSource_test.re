open Jest;

[@bs.module] external mockFs: Js.t('a) => unit = "mock-fs";
[@bs.module "mock-fs"] external mockFsRestore: unit => unit = "restore";

describe("readSource", () => {
  open ReadSource;
  open Expect;

  test("parsePath happy path", () => {
    let expectation = {
      dir: "a/b/c",
      name: "d",
      ext: ".e",
      dirs: ["a", "b", "c"],
      full: "a/b/c/d.e",
    };

    expect(parsePath("a/b/c/d.e")) |> toEqual(expectation);
  });

  test("readFile basics", () => {
    let content = "The file content";

    mockFs({"path/to/file.txt": content});

    expect(readSourceFile(~dir=".", "path/to/file.txt"))
    |> toEqual({
         path: {
           dir: "path/to",
           name: "file",
           ext: ".txt",
           dirs: ["path", "to"],
           full: "path/to/file.txt",
         },
         rawContent: RawContent(content),
       });
  });
});
