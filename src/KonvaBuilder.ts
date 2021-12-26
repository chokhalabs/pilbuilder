import { createElement as h, useEffect, useState } from 'react';
import "./KonvaBuilder.css";
import { Config } from "./utils";
import Sidebar from "./Sidebar";
import DesignBoard from './DesignBoard';
import Menubar from "./Menubar";
import { RectangleConf, GroupConf, TextConf } from "./KonvaPrimitives";

export default function() {
  const [ conf, setConf ] = useState(null as Config | null);
  const [ selectedConf, setSelectedConf ] = useState("");
  const [ leftsidebarWidth, setSidebarWidth ] = useState(250);
  const [ menubarHeight, setMuenubarHeight ] = useState(50);
  const [ components, setComponents ] = useState([ RectangleConf, TextConf, GroupConf ]);
  const [ selectedTool, setSelectedTool ] = useState("arrow");

  function addNodeToStage(dropEv: { x: number; y: number; id: string | undefined; }) {
    // Find the node
    const component = components.find(cmp => cmp.name === dropEv.id);
    // Add it to existing confs to get new confs
    console.log("dropping: ", dropEv, component);
    if (component?.config) {
      setConf(component.config ?? null);
      setSelectedConf(component.config.id);
    }
    // The next render cycle will update the vdom to render both
  }

  const sidebar = h(
    Sidebar,
    { 
      key: "sidebar",
      tree: conf,
      selectedNode: selectedConf,
      onNodeSelect: (nodeid: string) => setSelectedConf(nodeid),
      width: leftsidebarWidth,
      height: window.innerHeight - menubarHeight,
      components
    } 
  );

  const designboard = h(
    DesignBoard, 
    {
      key: "designboard",
      leftsidebarWidth,
      menubarHeight,
      conf,
      components,
      onDrop: (ev) => addNodeToStage(ev)
    }
  );

  const menubar = h(
    Menubar, 
    {
      key: "menubar", 
      selectedTool, 
      onSelectTool: setSelectedTool 
    }
  );

  return (
    h(
      "div", 
      { 
        className: "konvaroot"
      }, 
      [
        menubar,
        sidebar,
        designboard
      ]
    )
  );
}