import { createElement as h } from 'react';

import { Config } from "./utils";

function makeVDom(config: Config, step: number): ReturnType<typeof h> {
  const children = config.children.map(child => makeVDom(child, step + 1));
  return h(
    "div",
    {
      style: {
        paddingLeft: step * 10
      },
      className: "sidebar-tree-item"
    },
    [
      config.type,
      ...children
    ]
  );
}

export default function(config: Config) {
  // Check for null passed as props. React passes null props as an empty object.
  const isPropsNull = Object.keys(config).length === 0;
  if (isPropsNull) {
    return h("div", null, "Nothing loaded yet!");
  } else {
    return makeVDom(config, 0);
  }
}
