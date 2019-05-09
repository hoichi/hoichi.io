type watcher;

[@bs.deriving abstract]
type watcherOptions = {
  [@bs.optional]
  cwd: string,
  persistent: bool,
};

[@bs.module "chokidar"]
external watch: (array(string), watcherOptions) => watcher = "watch";
