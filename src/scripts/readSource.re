open Tablecloth;

type filePath = {
  dir: string,
  ext: string,
  name: string,
  dirs: list(string),
  full: string,
};

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
