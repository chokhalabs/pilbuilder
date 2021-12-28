import { createElement as h, useEffect, useState } from 'react';
import "./KonvaBuilder.css";
import { Config } from "./utils";
import Sidebar from "./Sidebar";
import DesignBoard from './DesignBoard';
import Menubar from "./Menubar";
import { RectangleConf, GroupConf, TextConf } from "./KonvaPrimitives";
import { KonvaEventObject } from 'konva/lib/Node';

export type ToolType = "arrow" | "rect" | "text" | "group";

export default function() {
  const [ conf, setConf ] = useState([] as Config[]);
  const [ selectedConf, setSelectedConf ] = useState("");
  const [ leftsidebarWidth, setSidebarWidth ] = useState(250);
  const [ menubarHeight, setMuenubarHeight ] = useState(50);
  const [ components, setComponents ] = useState([ RectangleConf, TextConf, GroupConf ]);
  const [ selectedTool, setSelectedTool ] = useState("arrow" as ToolType);
  const [ mouseDownAt, setMouseDownAt ] = useState(null as { x: number; y: number; } | null);

  function addNodeToStage(dropEv: { x: number; y: number; id: string | undefined; }) {
    // Find the node
    const component = components.find(cmp => cmp.name === dropEv.id);
    // Add it to existing confs to get new confs
    console.log("dropping: ", dropEv, component);
    if (component?.config) {
      setConf([component.config]);
      setSelectedConf(component.config.id);
    }
    // The next render cycle will update the vdom to render both
  }

  function pointerType(selectedTool: string) {
    if (selectedTool === "rect" || selectedTool === "group") {
      return "crosshair";
    } else if (selectedTool === "text") {
      return "text";
    } else {
      return "default";
    }
  }

  function setMouseDown(ev: KonvaEventObject<MouseEvent> | null) {
    if (ev === null) {
      setMouseDownAt(null);
    } else {
      const coords = ev.target.getRelativePointerPosition();
      setMouseDownAt(coords);
    }
  }

  function handleMouseMove(ev: KonvaEventObject<MouseEvent>) {
    if (mouseDownAt && selectedTool === "rect") {
      const rect: Config = {
        type: "Rect",
        id: Date.now().toString(),
        children: [],
        props: {
          x: mouseDownAt.x,
          y: mouseDownAt.y,
          width: 100,
          height: 100,
          fill: "#c4c4c4"
        }
      }
      let newconfig = [rect];
      if (conf) {
        newconfig = [...conf, rect]
      } 
      setConf(newconfig);
      setMouseDownAt(null);
    }
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
      cursor: pointerType(selectedTool),
      onDrop: (ev) => addNodeToStage(ev),
      onAddItem: (config: Config) => {
        let newconfig = [config];
        if (conf) {
          newconfig = [ ...conf, config ];
        }
        setConf(newconfig);
      }
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