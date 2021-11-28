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

export type PilNode = ItemNode | TextNode;

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
  states: Array<{
    name: string;
    when: string;
    propertyChanges: PropertyChange[];
  }>;
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

export class AppBase {
  item: ItemNode;
  eventBus = new EventManager();
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, item: ItemNode) {
    this.item = item;
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (context) {
      this.context = context;
    } else {
      throw new Error("Could not get rendering context on canvas");
    }
  }

  mount() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.downloadImages();
    this.setupMouseArea();

    const initialState = null;
    const donotPaint = true;
    this.activateState(initialState, donotPaint);

    return Promise.all(this.item.images.map(it => it.downloaded)).then(() => {
      if (this.item) {
        this.paint(this.item);
        return this.renderChildren(this.item);
      } else {
        return Promise.reject("No item found to render!");
      }
    })
  }

  downloadImages() {
    if (this.item) {
      this.item.images = this.item.images.map(image => {
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

  renderChildren(node: ItemNode): Promise<any> {
    if (node.children) {
      const rendered = Object.keys(node.children).map(child_id => {
        const child = node.children[child_id];
        if (child.type === "Text") {
          this.paint(child, node);
          return Promise.resolve();
        } else {
          return this.renderChildren(child);
        }
      });
      return Promise.all(rendered);
    } else {
      console.info("No children in : " + node.id);
      return Promise.resolve();
    }
  }

  setupMouseArea() {
    if (this.item.mouseArea && this.item.mouseArea.mousedown) {
      this.canvas.addEventListener("mousedown", (ev) => {
        if (ev.offsetX <= this.item.mouseArea.width && ev.offsetY <= this.item.mouseArea.height) {
          // this.onButtonPress();
          if (this.item.mouseArea.mousedown) {
            this.eventBus.emit("mousedown", ev);
          }

          this.item.states.forEach(state => {
            if (state.when === "mousedown") {
              this.activateState(state.name);
            }
          })
        }
      });
    }

    if (this.item.mouseArea && this.item.mouseArea.mouseup) {
      this.canvas.addEventListener("mouseup", (ev) => {
        if (ev.offsetX <= this.item.mouseArea.width && ev.offsetY <= this.item.mouseArea.height) {
          // this.onButtonRelease();
          if (this.item.mouseArea.mouseup) {
            this.eventBus.emit("mouseup", ev);
          }

          this.item.states.forEach(state => {
            if (state.when === "mouseup") {
              this.activateState(state.name);
            }
          })
        }
      });
    }
  }

  activateState(state: string|null, nopaint?: boolean) {
    state = state || this.item.state;
    const stateConfig = this.item.states.find(stateConf => stateConf.name === state);
    if (stateConfig) {
      for (let change of stateConfig.propertyChanges) {
        const targetImg = this.item.images.find(image => image.id === change.target);
        if (targetImg) {
          targetImg.visible = !!change.visible;
        }
      }
    }
    
    if (!nopaint) {
      this.paint(this.item);
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
      default:
        return assertNever(node);
    }
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
