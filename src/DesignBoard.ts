import React, { createElement as h, useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { Config, transformToVDOM, ToolType, assertNever, findNodeById } from "./utils";
import { KonvaEventObject } from "konva/lib/Node";

type Props = { 
  leftsidebarWidth: number; 
  menubarHeight: number; 
  conf: Config[]; 
  onDrop: (arg: { x: number; y: number; id: string|undefined; }) => void;
  components: Array<{ name: string|null }>;
  cursor: string;
  onAddItem: (node: Config, parent: null | string) => void;
  selectedTool: ToolType;
  selectedConf: string;
}

export default function(props: Props) {
  const stageNode = useRef(null as any);
  const [ dropListener, setDropListener ] = useState(null as any);
  const [ mouseDownAt, setMouseDownAt] = useState(null as { x: number; y: number; } | null);
  const [ mouseAt, setMouseAt ] = useState(null as { x: number; y: number; } | null);
  const [ parentid, setParentId ] = useState(null as string | null);
  const [ parentrect, setParentRect ] = useState(null as null | { x: number; y: number; });
  const [ selectionBox, setSelectionBox ] = useState(null as null | { x: number; y: number; width: number; height: number; });

  const nodes: Array<ReturnType<typeof h>> = props.conf.map((config, i) => h(
    transformToVDOM(
      config, 
      { 
        key: props.selectedTool + "-" + i 
      }
    )
  ));
  
  useEffect(() => {
    if (stageNode.current) {
      const root: any = stageNode.current;
      const canvas: HTMLCanvasElement = root.children[0].canvas._canvas;
      // console.log("Adding event listener")
      if (!dropListener) {
        canvas.addEventListener("dragover", (ev) => {
          // console.log("Dragover: ", ev)
          ev.stopPropagation();
          ev.preventDefault();
        })
      }
      console.log("Adding eventlistener")
      canvas.removeEventListener("drop", dropListener?.listener);
      const newDropListener = (ev: any) => {
        const id = ev?.dataTransfer?.getData("text") ?? "event not found";
        props.onDrop({
          x: ev?.x ?? 10,
          y: ev?.y ?? 10,
          id: id
        });
      };
      setDropListener({ listener: newDropListener });
      canvas.addEventListener("drop", newDropListener);
    } else {
      console.error("Could not attach drop listener");
    }
  }, [stageNode, props.components, props.conf]);

  // Draw red box around the selected conf
  useEffect(() => {
    if (stageNode.current) {
      const [n] = stageNode.current.find(`#${props.selectedConf}`);
      if (n) {
        const clientRect = n.getClientRect();
        setSelectionBox(clientRect);
      } else {
        setSelectionBox(null);
      }
    }
  }, [props.selectedConf]);

  if (mouseAt && mouseDownAt) {
    let x = mouseDownAt.x;
    let y = mouseDownAt.y;

    if (parentid && parentrect) {
      x = x + parentrect.x;
      y = y + parentrect.y;
    } 

    // Drawingbox is the temporary box drawn on the screen when you are drawing a shape
    const drawingbox = h(Rect, {
      x,
      y,
      width: mouseAt.x - mouseDownAt.x,
      height: mouseAt.y - mouseDownAt.y,
      fill: "#c4c4c4"
    });
    nodes.push(drawingbox);
  } 

  if (selectionBox) {
    nodes.push(
      h(
        Rect,
        {
          x: selectionBox.x,
          y: selectionBox.y,
          width: selectionBox.width,
          height: selectionBox.height,
          stroke: "#FF0000",
          lineWidth: 1
        }
      )
    );
  }

  function handleMouseDown(ev: KonvaEventObject<MouseEvent>) {
    let parent = ev.target; 

    if (parent.attrs.id !== "stage") {
      let parentFound = false;
      while (!parentFound) {
        parent = parent.getParent();
        if (parent) {
          const className = parent.getClassName();
          if (props.selectedTool === "rect" || props.selectedTool === "group" || props.selectedTool === "layoutgroup") {
            parentFound = [ "Stage", "Group", "LayoutGroup" ].includes(className);
          } else if (props.selectedTool === "text") {
            parentFound = [ "Stage", "Group", "LayoutGroup", "Rect" ].includes(className)
          }
        } else {
          console.log("Parent not found!")
        }
      }
      setParentId(parent.attrs.id);
    } else {
      setParentId(null);
    }

    if (props.selectedTool !== "arrow") {
      // debugger
      const parentrect = parent.getClientRect();
      const mdownAt = parent.getRelativePointerPosition();
      setMouseDownAt(mdownAt);
      setParentRect(parentrect);
    }
  }

  function emitRect() {
    if (mouseAt && mouseDownAt) {
      const conf: Config = {
        name: null,
        id: Date.now().toString() + "-rect",
        type: "Rect",
        props: {
          x: mouseDownAt.x,
          y: mouseDownAt.y,
          width: mouseAt.x - mouseDownAt.x,
          height: mouseAt.y - mouseDownAt.y,
          fill: "#c4c4c4",
          stroke: "#c4c4c4",
          lineWidth: 1,
          onClick: {
            expr: "$props.onClick",
            evaluator: "pickSuppliedProp",
            default: () => alert("clicked!"),
            map: false
          }
        },
        children: []
      };
      props.onAddItem(conf, parentid);
    }
  }
  
  function emitGroup() {
    if (mouseAt && mouseDownAt) {
      const newid = Date.now().toString();
      const conf: Config = {
        name: null,
        id: newid + "-group",
        type: "Group",
        props: {
          x: mouseDownAt.x,
          y: mouseDownAt.y
        },
        children: [{
          name: null,
          id: newid + "-rect",
          type: "Rect",
          props: {
            x: 0,
            y: 0,
            width: mouseAt.x - mouseDownAt.x,
            height: mouseAt.y - mouseDownAt.y,
            fill: "white"
          },
          children: []
        }]
      };
      props.onAddItem(conf, parentid);
    }
  }

  function emitLayoutGroup() {
    if (mouseAt && mouseDownAt) {
      const newid = Date.now().toString();
      const conf: Config = {
        name: null,
        id: newid + "-layoutgroup",
        type: "LayoutGroup",
        props: {
          x: mouseDownAt.x,
          y: mouseDownAt.y,
          width: mouseAt.x - mouseDownAt.x,
          height: mouseAt.y - mouseDownAt.y,
          fill: "white"
        },
        children: []
      };
      props.onAddItem(conf, parentid);
    }
  }

  function emitText() {
    if (mouseAt && mouseDownAt) {
      const newid = Date.now().toString();
      const conf: Config = {
        name: null,
        id: newid + "-text",
        type: "Text",
        props: {
          x: mouseDownAt.x,
          y: mouseDownAt.y,
          text: "placeholder",
          fill: "black"
        },
        children: []
      };
      props.onAddItem(conf, parentid);
    }
  }

  function resetMouse() {
    setMouseAt(null);
    setMouseDownAt(null);
  }

  function handleMouseUp(ev: KonvaEventObject<MouseEvent>) {
    if (mouseDownAt && mouseAt) {
      switch(props.selectedTool) {
        case "rect":
          emitRect();
          break;
        case "group":
          emitGroup();
          break;
        case "text":
          emitText();
          break;
        case "layoutgroup":
          emitLayoutGroup();
          break;
        case "arrow":
          resetMouse();
          break;
        default:
          assertNever(props.selectedTool);
      }
    }
    setMouseDownAt(null);
    setMouseAt(null);
  }

  function handleMouseMove(ev: KonvaEventObject<MouseEvent>) {
    if (mouseDownAt) {
      const currentPos = ev.target.getRelativePointerPosition();
      setMouseAt(currentPos);
    }
  }

  return h(Stage, 
    {
      ref: stageNode,
      width: window.innerWidth - 2 * props.leftsidebarWidth,
      height: window.innerHeight - props.menubarHeight,
      className: "stage",
      key: "designboard",
      style: { cursor: props.cursor },
      id: "stage",
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onMouseMove: handleMouseMove
    },
    [
      h(
        Layer,
        {
          key: "layer1"
        },
        nodes
      )
    ]
  );
}
