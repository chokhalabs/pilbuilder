class EventManager {
  listeners = {};

  addEventListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event, payload) {
    if (!this.listeners.event) {
      console.warn("No handlers bound for the event: ", event);
    } else {
      this.listeners.forEach(listener => {
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
    if (context) {
      this.context = context;
    }

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

    if (this.item.mouseArea && this.item.mouseArea.mousedown) {
      canvas.addEventListener("mousedown", (ev) => {
        if (ev.offsetX <= this.item.mouseArea.width && ev.offsetY <= this.item.mouseArea.height) {
          // this.onButtonPress();
          if (this.item.mouseArea.mousedown) {
            this.eventBus.emit("mousedown");
          }

          this.item.states.forEach(state => {
            if (state.when === "mousedown") {
              this.setState(state.name)
            }
          })
        }
      });
    }

    if (this.item.mouseArea && this.item.mouseArea.mouseup) {
      canvas.addEventListener("mouseup", (ev) => {
        if (ev.offsetX <= this.item.mouseArea.width && ev.offsetY <= this.item.mouseArea.height) {
          // this.onButtonRelease();
          if (this.item.mouseArea.mouseup) {
            this.eventBus.emit("mouseup");
          }

          this.item.states.forEach(state => {
            if (state.when === "mouseup") {
              this.setState(state.name)
            }
          })
        }
      });
    }

    this.setState(null, true);

    return Promise.all(this.item.images.map(it => it.downloaded));
  }

  setState(state, nopaint) {
    state = state || this.item.state;
    const stateConfig = this.item.states.find(stateConf => stateConf.name === state);
    for (let change of stateConfig.propertyChanges) {
      const targetImg = this.item.images.find(image => image.id === change.target);
      if (targetImg) {
        targetImg.visible = change.visible;
      }
    }
    if (!nopaint) {
      this.paint();
    } 
  }

  paint() {
    const item = this.item;
    const context = this.context;
    const images = item.images.filter(image => image.visible);

    for (let image of images) {
      context.drawImage(image.ref, image.x, image.y, item.width, item.height);
    }

    let mouseArea = this.item.mouseArea;
    if (mouseArea && mouseArea.draw) {
      context.strokeStyle = "#FF0000";
      context.rect(mouseArea.x, mouseArea.y, mouseArea.width, mouseArea.height);
      context.stroke();
    }
  }
}
