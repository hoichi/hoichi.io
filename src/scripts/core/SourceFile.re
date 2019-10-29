type path = {
  dir: string,
  ext: string,
  name: string,
  dirs: list(string),
  full: string,
};

type rawContent =
  | RawContent(string);

type t = {
  path,
  rawContent,
};
