import { Stage, Layer } from 'react-konva';
import { createElement as h, useEffect, useState } from 'react';

import "./KonvaBuilder.css";
import { Config } from "./utils";
import Sidebar from "./Sidebar";
import DesignBoard from './DesignBoard';

export default function() {
  const [ conf, setConf ] = useState(null as Config | null);
  const [ selectedConf, setSelectedConf ] = useState("");
  const [ leftsidebarWidth, setSidebarWidth ] = useState(250);
  const [ menubarHeight, setMuenubarHeight ] = useState(50);
  const [ components, setComponents ] = useState([] as Array<{ name: string; config: Config; }>);

  useEffect(() => {
    // @ts-ignore
    import("http://localhost:3000/button.js")
      .then(({ default: config }) => {
          // TODO: Add better validation
          if (config && config.type && config.children && config.id) {
            setConf(config);
            setComponents([{
              name: "Button",
              config
            }])
            setSelectedConf(config.id);
          } else {
            console.error("Invalid config");
          }
        })
        .catch(err => {
        console.error("error when downloading button: ", err);
      })
  }, []);

  function addNodeToStage(dropEv: { x: number; y: number; id: string | undefined; }) {
    // Find the node
    // Add it to existing confs to get new confs
    console.log("dropping: ", dropEv);
    // setDraggingAsset(null);
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
      onDrop: (ev) => addNodeToStage(ev)
    }
  );

  const menubar = h("div", { className: "menubar", key: "menubar" });

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