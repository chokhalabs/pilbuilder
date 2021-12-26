import { createElement as h, useState } from 'react';

import { Config } from "./utils";

function traversePreOrder(config: Config, selectedNode: string): Array<{ step: number; label: string; children: Config[]; selected: boolean; id: string;}> {
  const traversal: ReturnType<typeof traversePreOrder> = [];
  const stack: typeof traversal = [{ step: 0, label: config.type, children: config.children, selected: config.id === selectedNode, id: config.id }];
 
  while(stack.length > 0) {
    // Pop item out
    const node = stack.pop();
    if (!node) {
      throw new Error("No idea what happened!");
    }
    // Put it in traversal
    traversal.push(node);
    // Push right child and then left child
    for (let i = node.children.length - 1; i >= 0; i --) {
      stack.push({
        step: node.step + 1,
        label: node.children[i].type,
        children: node.children[i].children,
        id: node.children[i].id,
        selected: node.children[i].id === selectedNode
      })
    }
  }

  return traversal;
}

function makeNodeTree(config: Config|null, selectedNode: string, onNodeSelect: (id: string) => void): ReturnType<typeof h> {
  if (config) {
    const nodes = traversePreOrder(config, selectedNode);
    return h(
      "div", 
      {
        key: "nodetree"
      }, 
      nodes.map(node => 
        h(
          "div", 
          { 
            key: node.id,
            className: node.selected ? "sidebar-tree-item selected" : "sidebar-tree-item", 
            style: { paddingLeft: node.step * 10 },
            onClick: () => onNodeSelect(node.id)
          }, 
          node.label
        )
      )
    );
  } else {
    return h("div", { key: "nodetree" }, "Nothing loaded yet!");
  }
}


function Tabs(props: { tabs: string[], selectedTab: string; onSelect: (p: string) => void }) {
  return h(
    "div",
    {
      className: "tabs"
    },
    props.tabs.map((tab, i) => h(
      "div",
      {
        key: "tab-" + i,
        className: props.selectedTab === tab ? "selected tab" : "tab",
        onClick: () => props.onSelect(tab)
      },
      tab
    ))
  )
}

function Assets(props: { onDragStart: (id: string) => void }) {
  const config = {
    type: "Group",
    id: "id1",
    props: null,
    children: [
      {
        type: "Rect",
        id: "id2",
        props: {
          x: 0,
          y: 0,
          width:  150,
          height: 50,
          fill: "cornflowerblue"
        },
        children: []
      },
      {
        type: "Text",
        id: "id3",
        props: {
          x: 20,
          y: 15,
          text: {
            expr: "$props.title"
          }
        },
        children: []
      }
    ]
  };
  return h(
    "div", 
    {
      draggable: true,
      onMouseDown: () => props.onDragStart(config.id),
      onMouseUp: () => props.onDragStart("")
    },
    config.id 
  );
}

type SidebarProps = { 
  tree: Config|null; 
  width: number; 
  height: number; 
  selectedNode: string; 
  onNodeSelect: (id: string) => void;
  onDragAsset: (id: string) => void;
};
export default function(props: SidebarProps) {

  const [tabs, setTabs] = useState([ "Layers", "Assets" ]);
  const [selectedTab, setSelectedTab] = useState("Layers");

  let tabBody: ReturnType<typeof h> = h(Assets, { onDragStart: props.onDragAsset, key: "tabbody" });
  if (selectedTab === "Layers") {
    tabBody = makeNodeTree(props.tree, props.selectedNode, props.onNodeSelect);
  }

  return h(
    "div", 
    { 
      className: "sidebar", 
      style: { width: props.width, height: props.height },
      key: "sidebar"
    },
    [
      h(Tabs, { tabs, selectedTab, onSelect: (tab: string) => setSelectedTab(tab), key: "tabs" }),
      tabBody
    ]
  );
}
