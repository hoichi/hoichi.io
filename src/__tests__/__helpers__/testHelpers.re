  let combineArray = (coll, el) => Js.Array.push(el, coll) |> ignore;
  let combineList = (collRef, el) =>
    (collRef := [el, ...collRef^]) |> ignore;
  let asyncExpectToEqual = (expected, actual) =>
    Js.Promise.resolve(Jest.Expect.(expect(actual) |> toEqual(expected)));
