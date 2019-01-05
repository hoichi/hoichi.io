module RR = ReasonReact;

let component = RR.statelessComponent("PageFooter");

/* underscores before names indicate unused variables. We name them for clarity */
let make = _children => {
  ...component,
  render: _self =>
    <footer id="colophon" className="b-Colophon u-centered" role="contentinfo">
      <p> {RR.string("---")} </p>
    </footer>,
};
