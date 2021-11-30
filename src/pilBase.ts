class EventManager {
  listeners: Record<string, Array<(payload: any) => void>> = {};

  addEventListener(event: string, callback: (payload?: any) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event: string, payload: any) {
    if (!this.listeners[event]) {
      console.warn("No handlers bound for the event: ", event);
    } else {
      (this.listeners[event] || []).forEach(listener => {
        listener.call(null, payload);
      })
    }
  }
}

export type PilNode = ItemNode | TextNode | TextEditNode;

export type IdObj = { id: string , [k: string]: any };

export type PropertyChange = {
  target: string;
  [k: string]: number | boolean | string;
}

export type ItemImage = {
  x: number;
  y: number;
  id: string;
  visible: boolean;
  ref: HTMLImageElement | null;
  source: string;
  downloaded: null | Promise<any>;
};

export type MouseArea = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  draw: boolean;
  hoverEnabled: boolean;
  mouseup: boolean;
  mousedown: boolean;
};

export type NodeState = {
  name: string;
  when: string;
  propertyChanges: PropertyChange[];
  callOnEnter: string[];
};

export type ItemNode = {
  id: string;
  type: "Item";
  x: number;
  y: number;
  draw: boolean;
  width: number;
  height: number;
  images: ItemImage[];
  mouseArea: MouseArea;
  children: Record<string, PilNode>;
  state: string;
  states: NodeState[]; 
}

export type TextEditNode = {
  id: string;
  type: "TextEdit";
  x: number;
  y: number;
  width: number;
  height: number;
  images: ItemImage[];
  children: null;
  state: string;
  states: NodeState[];
  mouseArea: MouseArea;
  props: {
    value: string;
  };
  events: {
    onChange: {
      when: string;
      payload: string;
    }
  };
  currentText: string;
}

export type TextNode = {
  id: string;
  type: "Text";
  color: string;
  text: string;
  width: number;
  children: null;
}

export function assertNever(x: never) : never {
  throw new Error("Unexpected value: " + x);
}

export function isStateFulNode(node: PilNode): node is (ItemNode | TextEditNode) {
  if ((node as ItemNode).state !== undefined) {
    return true;
  } else if ((node as TextEditNode).state !== undefined) {
    return true;
  } else {
    return false;
  }
}

export function isMouseareaNode(node: PilNode): node is ItemNode {
  if ((node as ItemNode).mouseArea !== undefined) {
    return true;
  } else {
    return false;
  }
}

export function findNodeById(node: IdObj, id: string): null | IdObj {
    if (node.id === id) {
      return node;
    } else if (node.children && node.children[id]) {
      return node.children[id];
    } else {
      const candidateNodes = Object.keys(node).filter(key => typeof node[key] === "object");
      for (let key of candidateNodes) {
        const child = node[key];
        const n = findNodeById(child, id);
        if (n) {
          return n;
        }     
      }
      return null;
    }
  }

export class AppBase {
  item: PilNode;
  eventBus = new EventManager();
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, item: PilNode) {
    this.item = item;
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (context) {
      this.context = context;
    } else {
      throw new Error("Could not get rendering context on canvas");
    }
  }

  mount(node?: PilNode, parent?: ItemNode) {
    if (!node) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      node = this.item;
    }
    
    this.downloadImages(node);
    this.setupMouseArea(node);

    if (isStateFulNode(node)) {
      const donotPaint = true;
      this.activateState(node.state, node, donotPaint);
    }

    let imageDownloads: Promise<any> = Promise.resolve();
    if (isStateFulNode(node)) {
      imageDownloads = Promise.all(node.images.map(it => it.downloaded));
    }

    return imageDownloads.then(() => {
      if (node) {
        this.paint(node, parent);
        if (node.children) {
          Object.values(node.children).forEach(child => {
            if (node) {
              switch (node.type) {
                case "Item":
                  this.mount(child, node);
                  break;
                case "Text":
                case "TextEdit":
                  break;
                default:
                  assertNever(node);
              }
            }
          });
        }
      }
    });
  }

  downloadImages(node: PilNode) {
    if (isStateFulNode(node)) {
      node.images = node.images.map(image => {
        let img = new Image();
        img.src = image.source;
        let downloaded = new Promise((resolve, reject) => {
          img.onload = () => { 
            console.log("Loaded");
            resolve({});
          };
          img.onerror = () => { 
            console.log("errored");
            reject();
          };
          img.onabort = () => { 
            console.log("aborted");
            reject();
          };
        });

        return {
          ...image,
          ref: img,
          downloaded 
        };
      });
    }
  }

  setupMouseArea(node: PilNode) {
    if (isMouseareaNode(node) && node.mouseArea && node.mouseArea.mousedown) {
      this.canvas.addEventListener("mousedown", (ev) => {
        if (isMouseareaNode(node)) {
          if (ev.offsetX <= node.mouseArea.width && ev.offsetY <= node.mouseArea.height) {
            // this.onButtonPress();
            if (node.mouseArea.mousedown) {
              this.eventBus.emit("mousedown", ev);
            }

            node.states.forEach(state => {
              if (state.when === "mousedown") {
                this.activateState(state.name, node);
              }
            })
          } else {
            console.error("Cannot run mousearea on this node")
          }
        }
      });
    }

    if (isMouseareaNode(node) && node.mouseArea && node.mouseArea.mouseup) {
      this.canvas.addEventListener("mouseup", (ev) => {
        if (isMouseareaNode(node)) {
          if (ev.offsetX <= node.mouseArea.width && ev.offsetY <= node.mouseArea.height) {
            // this.onButtonRelease();
            if (node.mouseArea.mouseup) {
              this.eventBus.emit("mouseup", ev);
            }

            node.states.forEach(state => {
              if (state.when === "mouseup") {
                this.activateState(state.name, node);
              }
            })
          }
        } else {
          console.error("Cannot run mousearea on this node")
        }
      });
    }
  }

  // onNodeUpdate(node: PilNode) {
  //   // Find the node and its parent in the item and replace it
  //   let parent = this.findNodeAndParent(node, this.item, null);
  //   if (parent) {
  //     parent.children[node.id] = node;
  //   } else if (this.item.id === node.id) {
  //     this.item = node;
  //   } else {
  //     throw new Error("Could not update node");
  //   }
  //   this.paint(node, parent);
  // }

  onNodePropertyUpdate(node: PilNode, key: string) {
    const parent = this.findNodeAndParent(node, this.item, null);
    let nodeRef: any;
    if (node.id === this.item.id) {
      nodeRef = this.item;
    } else if (parent) {
      nodeRef = parent.children[node.id];
    } else {
      throw new Error("Could not update node");
    }
    nodeRef[key] = (node as any)[key];
    this.paint(node, parent);
  }

  findNodeAndParent(node: PilNode, cursorNode: PilNode, parent: ItemNode | null): ItemNode | null {
    if (node.id === cursorNode.id) {
      return parent; 
    } else if (cursorNode.children && cursorNode.children[node.id]) {
      return cursorNode;
    } else if (cursorNode.children) {
      const parentCandidates = Object.values(cursorNode.children).map(child => {
        return this.findNodeAndParent(node, child, cursorNode);
      });
      const p = parentCandidates.find(it => !!it); 
      if (p) {
        return p;
      } else {
        return null;
      }
    } else {
      throw new Error("Looks like we couldn't find the parent of the node");
    }
  } 

  // Take in node whose state to activate
  // Expect changes other than visibility
  // Run the handlers for the state if any
  activateState(state: string, node: PilNode, nopaint?: boolean) {
    if (isStateFulNode(node)) {
      const stateConfig = node.states.find(stateConf => stateConf.name === state);
      if (stateConfig) {
        for (let cb of stateConfig.callOnEnter) {
          import(`./${node.type}`).then(fcns => {
            Reflect.apply(fcns[cb], null, [node, this.onNodePropertyUpdate.bind(this)]);
          })
        }

        for (let change of stateConfig.propertyChanges) {
          const target = findNodeById(node, change.target);
          const changekey = Object.keys(change).filter(key => key !== "target");
          if (target) {
            // @ts-ignore
            target[changekey] = change[changekey];
          } else {
            console.error("Could not apply property change: ", change);
          }
        }
      } else {
        console.error("No state config found for: ", node, state);
      }
      
      if (!nopaint) {
        this.paint(node);
      }
    } else {
      console.error("Cannot activate state on this node");
    }
  }

  paint(node: PilNode, parentNode?: undefined | null | PilNode) {
    switch (node.type) {
      case "Item":
        this.paintItem(node, parentNode);
        break;
      case "Text":
        if (parentNode && parentNode.type === "Item") {
          this.paintText(node, parentNode);
        } else {
          console.error("Cannot paint text node outside of an item node");
        }
        break;
      case "TextEdit":
        if ((parentNode && parentNode.type === "Item") || !parentNode) {
          this.paintTextEdit(node, parentNode);
        } else {
          console.error("Cannot paint a textEdit inside a ", parentNode);
        }
        break;
      default:
        return assertNever(node);
    }
  }

  paintTextEdit(node: TextEditNode, parentNode: ItemNode|undefined|null) {
    const context = this.context;
    context.beginPath();
    let x = node.x, y = node.y;
    if (parentNode && parentNode.type === "Item") {
      x = parentNode.x + node.x;
      y = parentNode.y + node.y;
    }

    context.clearRect(x, y, node.width, node.height);
    if (node.state === "active") {
      context.rect(x, y, node.width, node.height);
    }
    context.fillText(node.currentText, x, y + 10);
    context.stroke();
    context.closePath();
    
  }

  paintItem(node: ItemNode, parentNode?: undefined | null | PilNode) {
    const context = this.context;
    context.beginPath();  
    context.strokeStyle = "#0000FF";
    let x = node.x, y = node.y;
    if (parentNode && parentNode.type === "Item") {
      x = parentNode.x + node.x;
      y = parentNode.y + node.y;
    }
    if (node.draw) {
      context.rect(x, y, node.width, node.height);
      context.stroke();
      context.strokeStyle = "#000000";
    }
    

    const images = node.images.filter(image => image.visible);
    for (let image of images) {
      let x = node.x + image.x;
      let y = node.y + image.y;
      if (image.ref) {
        context.drawImage(image.ref, x, y, node.width, node.height);
      } else {
        console.error("Could not render image: ", image);
      }
    }

    let mouseArea = node.mouseArea;
    if (mouseArea && mouseArea.draw) {
      const x = node.x + node.mouseArea.x;
      const y = node.y + node.mouseArea.y;
      context.strokeStyle = "#FF0000";
      context.rect(x, y, mouseArea.width, mouseArea.height);
      context.stroke();
    }
    context.closePath();
  }

  paintText(node: TextNode, parentNode: ItemNode) {
    const context = this.context;
    context.beginPath();
    const lineHeight = 10;
    context.fillStyle = node.color || "black";
    let x = 0, y = 0;
    if (parentNode) {
      x = x + parentNode.x;
      y = y + parentNode.y + lineHeight;
    }
    context.fillText(node.text, x, y, node.width);
    context.closePath();
    context.fillStyle = "black";
  }
}
