open Tablecloth;

type filePath = {
  dir: string,
  ext: string,
  name: string,
  dirs: list(string),
  full: string,
};

type rawContent =
  | RawContent(string);

type sourceFile = {
  path: filePath,
  rawContent,
};

exception FileNotFound(string);

let parsePath = path => {
  let pathObj = Node.Path.parse(path);
  {
    dir: pathObj##dir,
    ext: pathObj##ext,
    name: pathObj##name,
    dirs: pathObj##dir |> String.split(~on=Node.Path.sep),
    full: path,
  };
};

let readSourceFile = (~dir=".", path) => {
  // todo: move "utf-8" to some config
  let content =
    try (Node.Fs.readFileSync(path, `utf8)) {
    | _ =>
      raise(
        FileNotFound(
          "Error reading \"" ++ path ++ "\". Make sure the file exists.",
        ),
      )
    };

  {path: parsePath(path), rawContent: RawContent(content)};
};
