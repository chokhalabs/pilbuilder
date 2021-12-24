import { createElement as h, useState } from 'react';

import { Config } from "./utils";

function makeVDom(config: Config|null, step: number): ReturnType<typeof h> {
  if (config) {
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

function Tabs(props: { tabs: string[], selectedTab: string; onSelect: (p: string) => void }) {
  return h(
    "div",
    {
      className: "tabs"
    },
    props.tabs.map(tab => h(
      "div",
      {
        className: props.selectedTab === tab ? "selected tab" : "tab",
        onClick: () => props.onSelect(tab)
      },
      tab
    ))
  )
}

export default function(props: { tree: Config|null; width: number; height: number; }) {

  const [tabs, setTabs] = useState([ "Layers", "Assets" ]);
  const [selectedTab, setSelectedTab] = useState("Layers");

  let tabBody: ReturnType<typeof h> = h("div", null, "No assets here yet!");
  if (selectedTab === "Layers") {
    tabBody = makeVDom(props.tree, 1);
  }

  return h(
    "div", 
    { 
      className: "sidebar", 
      style: { width: props.width, height: props.height } 
    },
    [
      h(Tabs, { tabs, selectedTab, onSelect: (tab: string) => setSelectedTab(tab) }),
      tabBody
    ]
  );
}
