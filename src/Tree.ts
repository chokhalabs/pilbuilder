import { createElement as h } from 'react';

import { Config } from "./utils";

function makeVDom(config: Config, step: number): ReturnType<typeof h> {
  if (config && config.children) {
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
  } else {
    return h("div", null, "Nothing loaded yet!");
  }
}

export default function(config: Config) {
  return makeVDom(config, 0);
}
