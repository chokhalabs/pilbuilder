class EventManager {
  listeners = {};

  addEventListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event, payload) {
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

export type PropertyChange = {
  target: string;
  [k: string]: number | boolean | string;
}

export type ItemNode = {
  id: string;
  type: "Item";
  x: number;
  y: number;
  draw: boolean;
  width: number;
  height: number;
  images: Array<{
    x: number;
    y: number;
    id: string;
    visible: boolean;
    ref: ImageBitmap;
  }>;
  mouseArea: {
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
}

function assertNever(x: never) : never {
  throw new Error("Unexpected value: " + x);
}

export class AppBase {
  item = null;
  eventBus = new EventManager();
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  mount(canvas) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (context) {
      this.context = context;
    }
    
    this.downloadImages();
    this.setupMouseArea();

    const initialState = null;
    const donotPaint = true;
    this.activateState(initialState, donotPaint);

    return Promise.all(this.item.images.map(it => it.downloaded)).then(() => {
      this.paint(this.item);
      return this.renderChildren(this.item);
    })
  }

  downloadImages() {
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

  renderChildren(node) {
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
    // paint them
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

  activateState(state, nopaint?: boolean) {
    state = state || this.item.state;
    const stateConfig = this.item.states.find(stateConf => stateConf.name === state);
    for (let change of stateConfig.propertyChanges) {
      const targetImg = this.item.images.find(image => image.id === change.target);
      if (targetImg) {
        targetImg.visible = change.visible;
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
      context.drawImage(image.ref, x, y, node.width, node.height);
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
