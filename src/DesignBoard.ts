import React, { createElement as h, useEffect, useRef, useState } from "react";
import { Config, tranformToVDOM } from "./utils";
import { Stage, Layer, Rect } from "react-konva";
import { ToolType } from "./KonvaBuilder";
import { KonvaEventObject } from "konva/lib/Node";

type Props = { 
  leftsidebarWidth: number; 
  menubarHeight: number; 
  conf: Config[]; 
  onDrop: (arg: { x: number; y: number; id: string|undefined; }) => void;
  components: Array<{ name: string }>;
  cursor: string;
  onAddItem: (node: Config, parent: null | string) => void;
  selectedTool: ToolType;
}

export default function(props: Props) {
  const stageNode = useRef(null);
  const [ dropListener, setDropListener ] = useState(null as any);
  const [ mouseDownAt, setMouseDownAt] = useState(null as { x: number; y: number; } | null);
  const [ mouseAt, setMouseAt ] = useState(null as { x: number; y: number; } | null);
  const [ parent, setParent ] = useState(null as string | null);

  const nodes: Array<ReturnType<typeof h>> = props.conf.map((config, i) => h(tranformToVDOM(config, 
    { 
      key: "rect-" + i, 
      // onDrawInGroup: (ev: KonvaEventObject<MouseEvent>) => {
      //   console.log("Drawing in group: ", ev);
      //   setGroupBeingDrawinIn(ev.target.id)
      //   const clientRect = ev.target.getClientRect();
      //   const mdownAt = ev.target.getRelativePointerPosition();
      //   mdownAt.x += clientRect.x;
      //   mdownAt.y += clientRect.y;
      //   setMouseDownAt(mdownAt);
      // } 
    })));
  
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
  }, [stageNode, props.components]);

  if (mouseAt && mouseDownAt) {
    const drawingbox = h(Rect, {
      x: mouseDownAt.x,
      y: mouseDownAt.y,
      width: mouseAt.x - mouseDownAt.x,
      height: mouseAt.y - mouseDownAt.y,
      fill: "#c4c4c4"
    });
    nodes.push(drawingbox);
  } 

  return h(Stage, 
    {
      ref: stageNode,
      width: window.innerWidth - props.leftsidebarWidth,
      height: window.innerHeight - props.menubarHeight,
      className: "stage",
      key: "designboard",
      style: { cursor: props.cursor },
      id: "stage",
      onMouseDown: ev => {
        if (ev.target.attrs.id !== "stage") {
          let parent = ev.target; 
          while (parent.attrs.id !== "stage" && !parent.attrs.id.endsWith("group")) {
            parent = parent.getParent();
          }
          setParent(parent.attrs.id);
        } else {
          setParent(null);
        }
        if (props.selectedTool === "rect" || props.selectedTool === "group") {
          // debugger
          const mdownAt = ev.target.getRelativePointerPosition();
          setMouseDownAt(mdownAt);
        }
      },
      onMouseUp: () => {
        if (mouseDownAt && mouseAt) {
          if (props.selectedTool === "rect") {
            const conf: Config = {
              id: Date.now().toString() + "-rect",
              type: "Rect",
              props: {
                x: mouseDownAt.x,
                y: mouseDownAt.y,
                width: mouseAt.x - mouseDownAt.x,
                height: mouseAt.y - mouseDownAt.y,
                fill: "#c4c4c4"
              },
              children: []
            };
            props.onAddItem(conf, parent);
          } else if (props.selectedTool === "group") {
            const newid = Date.now().toString();
            const conf: Config = {
              id: newid + "-group",
              type: "Group",
              props: {
                x: mouseDownAt.x,
                y: mouseDownAt.y,
                onMouseDown: {
                  expr: "$props.onDrawInGroup"
                }
              },
              children: [{
                id: newid + "-backgroud",
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
            props.onAddItem(conf, parent);
          }
          
        }
        setMouseDownAt(null);
        setMouseAt(null);
      },
      onMouseMove: ev => {
        if (mouseDownAt) {
          const currentPos = ev.target.getRelativePointerPosition();
          setMouseAt(currentPos);
        }
      }
    },
    [
      h(Layer,
        {
          key: "layer1"
        },
        nodes
      )
    ]
  );
}
