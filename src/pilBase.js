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

export class AppBase {
  item = null;
  eventBus = new EventManager();

  mount(canvas) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
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
          resolve();
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
            this.eventBus.emit("mousedown");
          }

          this.item.states.forEach(state => {
            if (state.when === "mousedown") {
              this.activateState(state.name)
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
            this.eventBus.emit("mouseup");
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

  activateState(state, nopaint) {
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

  paint(node, parentNode) {
    const context = this.context;
    if (node.draw) {
      context.strokeStyle = "#0000FF";
      let x = node.x, y = node.y;
      if (parentNode && parentNode.type === "Item") {
        x = parseFloat(parentNode.x) + parseFloat(node.x);
        y = parseFloat(parentNode.y) + parseFloat(node.y);
      }
      context.rect(x, y, node.width, node.height);
      context.stroke();
      context.strokeStyle = "#000000";
    }

    if (node.images) {
      const images = node.images.filter(image => image.visible);
      for (let image of images) {
        let x = parseFloat(node.x) + parseFloat(image.x);
        let y = parseFloat(node.y) + parseFloat(image.y);
        context.drawImage(image.ref, x, y, node.width, node.height);
      }
    }

    if (node.type === "Text") {
      const lineHeight = 10;
      context.fillStyle = node.color || "black";
      let x = 0, y = 0;
      if (parentNode) {
        x = x + parseFloat(parentNode.x);
        y = y + parseFloat(parentNode.y) + lineHeight;
      }
      context.fillText(node.text, x, y, node.width);
      context.fillStyle = "black";
    }

    let mouseArea = node.mouseArea;
    if (mouseArea && mouseArea.draw) {
      const x = parseFloat(node.x) + parseFloat(node.mouseArea).x;
      const y = parseFloat(node.y) + parseFloat(node.mouseArea).y;
      context.strokeStyle = "#FF0000";
      context.rect(x, y, mouseArea.width, mouseArea.height);
      context.stroke();
    }
  }
}
