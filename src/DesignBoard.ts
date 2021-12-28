import React, { createElement as h, useEffect, useRef, useState } from "react";
import { Config, tranformToVDOM } from "./utils";
import { Stage, Layer, Rect } from "react-konva";
import { ToolType } from "./KonvaBuilder";

type Props = { 
  leftsidebarWidth: number; 
  menubarHeight: number; 
  conf: Config[]; 
  onDrop: (arg: { x: number; y: number; id: string|undefined; }) => void;
  components: Array<{ name: string }>;
  cursor: string;
  onAddItem: (arg: Config) => void;
  selectedTool: ToolType;
}

export default function(props: Props) {
  const nodes: Array<ReturnType<typeof h>> = props.conf.map((config, i) => h(tranformToVDOM(config, { key: "rect-" + i })));

  const stageNode = useRef(null);
  const [ dropListener, setDropListener ] = useState(null as any);
  const [ mouseDownAt, setMouseDownAt] = useState(null as { x: number; y: number; } | null);
  const [ mouseAt, setMouseAt ] = useState(null as { x: number; y: number; } | null);
  
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
      onMouseDown: ev => {
        if (props.selectedTool === "rect" || props.selectedTool === "group") {
          const mdownAt = ev.target.getRelativePointerPosition();
          setMouseDownAt(mdownAt);
        }
      },
      onMouseUp: () => {
        if (mouseDownAt && mouseAt) {
          if (props.selectedTool === "rect") {
            const conf: Config = {
              id: Date.now().toString(),
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
            props.onAddItem(conf);
          } else if (props.selectedTool === "group") {
            const newid = Date.now().toString();
            const conf: Config = {
              id: newid + "-" + "group",
              type: "Group",
              props: {
                x: mouseDownAt.x,
                y: mouseDownAt.y
              },
              children: [{
                id: newid + "-" + "backgroud",
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
            props.onAddItem(conf);
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
