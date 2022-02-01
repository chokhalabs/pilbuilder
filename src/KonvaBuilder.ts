import { createElement as h, useEffect, useState } from 'react';
import "./KonvaBuilder.css";
import Sidebar from "./Sidebar";
import DesignBoard from './DesignBoard';
import Menubar from "./Menubar";
import { RectangleConf, GroupConf, TextConf, LayoutExample, EditText, ChatBox, ScrollExample } from "./KonvaPrimitives";
import Detailsbar from './Detailsbar';
import { Config, ToolType, assertNever, findNodeById } from "./utils";

export default function() {
  const [ conf, setConf ] = useState([] as Config[]);
  const [ selectedConf, setSelectedConf ] = useState("");
  const [ leftsidebarWidth, setSidebarWidth ] = useState(250);
  const [ menubarHeight, setMuenubarHeight ] = useState(50);
  const [ components, setComponents ] = useState([ RectangleConf, TextConf, GroupConf, LayoutExample, EditText, ChatBox, ScrollExample ]);
  const [ selectedTool, setSelectedTool ] = useState("arrow" as ToolType);

  useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "k" && ev.ctrlKey && ev.altKey && selectedConf) {
        // Find the selected conf
        const node = findNodeById(selectedConf, conf);
        // Add it to components 
        if (node) {
          setComponents( [ ...components, { name: node.id, config: node } ])
        } else {
          console.error("Could not find the node to create component");
        }
      }  else if (ev.key === "p" && ev.ctrlKey && ev.altKey && selectedConf) {
        const node = findNodeById(selectedConf, conf);
        if (node) {
          fetch("http://localhost:3030/buildproject", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              conf: node
            })
          })
          .then(res => res.json())
          .then(data => {
            const id = data.generated_project;
            console.log(`http://localhost:3030/project/${id}`)
            // console.log("waiting for build to complete: ");
            // setTimeout(() => {
              // console.log("attempting download");
              // fetch(`http://localhost:3030/project/${id}`, {
              //   method: "GET"
              // })
              // .then()
            // }, 5000);
          })
          .catch(err => {
            console.error("Project generation failed: ", err);
          })
        } else {
          console.error("Could not find the node for download: ", selectedConf)
        }
      }
    }
    document.body.addEventListener("keydown", handleKeyDown);
    return () => document.body.removeEventListener("keydown", handleKeyDown);
  }, [ selectedConf, conf ]);

  function addNodeToStage(dropEv: { x: number; y: number; id: string | undefined; }) {
    // Find the node
    const component = components.find(cmp => cmp.name === dropEv.id);
    // Add it to existing confs to get new confs
    console.log("dropping: ", dropEv, component);
    if (component?.config && component.config.props) {
      component.config.props.x = dropEv.x;
      component.config.props.y = dropEv.y;
      const confToDrop = { ...component.config, id: Date.now().toString() + component.name };
      setConf([...conf, confToDrop]);
      setSelectedConf(confToDrop.id);
    }
    // The next render cycle will update the vdom to render both
  }

  function updateNode(id: string, key: string, value: any) {
    const newConf = JSON.parse(JSON.stringify(conf));
    const node = findNodeById(id, newConf);
    if (node) {
      node.props = node.props || {};
      node.props[key] = value;
      setConf(newConf);
    } else {
      console.error("Could not find the node: ", id);
    }
  }

  function pointerType(selectedTool: ToolType) {
    switch (selectedTool) {
      case "rect":
      case "group":
      case "layoutgroup":
        return "crosshair";
      case "text":
        return "text";
      case "arrow":
        return "default"
      default:
        assertNever(selectedTool);
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

  function addChildToNode(node: Config, cursor: Config, parent: string): boolean {
    if (cursor.id === parent && ["Group", "LayoutGroup"].includes(cursor.type)) {
      cursor.children.push(node); 
      return true;
    } else if (cursor.id === parent) {
      console.error("Found parent node that is not a group! ", node, parent, cursor);
      return true;
    } else {
      return cursor.children.map(child => addChildToNode(node, child, parent)).some(added => added);
    }
  }

  const designboard = h(
    DesignBoard, 
    {
      key: "designboard",
      leftsidebarWidth,
      menubarHeight,
      conf,
      components,
      selectedTool,
      selectedConf,
      cursor: pointerType(selectedTool),
      onDrop: (ev) => addNodeToStage(ev),
      onAddItem: (config: Config, parent: string | null) => {
        if (selectedConf) {
          parent = selectedConf;
        }
        let newconfig = [config];
        if (conf && !parent) {
          newconfig = [ ...conf, config ];
        } else if (conf && parent) {
          // Find the parent in the conf and add a child
          for (let i = 0; i < conf.length; i++) {
            const group = conf[i];
            const added = addChildToNode(config, group, parent);
            if (added) break;
          }
          newconfig = conf;
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

  const detailbar = h(
    Detailsbar,
    {
      key: "detailsbar",
      node: findNodeById(selectedConf, conf) || null,
      onNodeUpdate: (key: string, value: any) => updateNode(selectedConf, key, value)
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
        designboard,
        detailbar
      ]
    )
  );
}