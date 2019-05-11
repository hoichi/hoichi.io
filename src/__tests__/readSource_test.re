open Jest;

/*
 [@bs.module] external mockFs: Js.t('a) => unit = "mock-fs";
 [@bs.module "mock-fs"] external mockFsRestore: unit => unit = "restore";
 */

describe("readSource", () => {
  open ReadSource;
  open Expect;

  let prevCwd = Node.Process.cwd();

  // let’s use the real fs, because mock-fs, jest, and chokidar don’t mix well
  // see https://github.com/paulmillr/chokidar/issues/845
  beforeEach(() => Node.Process.process##chdir("./src/__tests__/__fs__"));
  afterEach(() => Node.Process.process##chdir(prevCwd));

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

  test("parsePath short path", () => {
    let expectation = {
      dir: "",
      name: "about",
      ext: ".md",
      dirs: Belt.List.make(0, ""),
      full: "about.md",
    };

    expect(parsePath("about.md")) |> toEqual(expectation);
  });

  test("readFile basics", () =>
    expect(readSourceFile("path/to/file.txt"))
    |> toEqual({
         path: {
           dir: "path/to",
           name: "file",
           ext: ".txt",
           dirs: ["path", "to"],
           full: "path/to/file.txt",
         },
         rawContent: RawContent("The file content\n"),
       })
  );

  test("readFile a root file", () =>
    expect(readSourceFile("about.md"))
    |> toEqual({
         path: {
           dir: "",
           name: "about",
           ext: ".md",
           dirs: [],
           full: "about.md",
         },
         rawContent: RawContent("# About\n"),
       })
  );

  testPromise("observeSource", () => {
    let result = [||];
    let combine = TestHelpers.combineArray(result);

    observeSource([|"."|], ())
    |> Most.observe(combine)
    |> Js.Promise.then_(() =>
         TestHelpers.asyncExpectToEqual(
           // todo: use a set and don’t depend on the order
           [|
             {
               path: {
                 dir: "",
                 name: "about",
                 ext: ".md",
                 dirs: [],
                 full: "about.md",
               },
               rawContent: RawContent("# About\n"),
             },
             {
               path: {
                 dir: "path/to",
                 name: "file",
                 ext: ".txt",
                 dirs: ["path", "to"],
                 full: "path/to/file.txt",
               },
               rawContent: RawContent("The file content\n"),
             },
           |],
           result,
         )
       );
  });
});
