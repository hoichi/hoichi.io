module RR = ReasonReact;

let component = RR.statelessComponent("PageContent");

/* underscores before names indicate unused variables. We name them for clarity */
let make = (~content, _children) => {
  ...component,
  render: _self => {
    let dangerouslySetInnerHTML = {"__html": content};

    <main id="content" className="Content u-centered" role="main">
      <article dangerouslySetInnerHTML />
    </main>;
  },
};
