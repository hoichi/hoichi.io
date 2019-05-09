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
    dirs:
      pathObj##dir
      |> String.split(~on=Node.Path.sep)
      |> List.filter(~f=s => String.length(s) > 0),
    full: path,
  };
};

let readSourceFile = path => {
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

module Most = {
  include Most;

  type fsAddEvent('a) = (string, Js.t('a));

  [@bs.module "most"]
  external fromFsAddEvent:
    (string, Chokidar.watcher) => stream(fsAddEvent('a)) =
    "fromEvent";
};

let observeSource = (globs, ~cwd=?, ()) => {
  let watcher =
    Chokidar.watch(
      globs,
      Chokidar.watcherOptions(~persistent=false, ~cwd?, ()),
    );

  Most.(
    fromFsAddEvent("add", watcher)
    |> map(Tuple2.first >> readSourceFile)
    |> until(fromFsAddEvent("ready", watcher))
  );
};
