export class AppBase {
  item = null;
  mount(canvas) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (context) {
      this.context = context;
    }

    this.item.images = this.item.images.map(image => {
      let img = new Image();
      img.src = image.source;
      return {
        ...image,
        ref: img,
        downloaded: new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
          image.onabort = reject;
        })
      }
    });

    if (this.item.mouseArea && this.item.mouseArea.mousedown) {
      canvas.addEventListener("mousedown", (ev) => {
        if (ev.x <= this.item.mouseArea.width && ev.y <= this.item.mouseArea.height && this.onButtonPress) {
          this.onButtonPress();
        }
      });
    }

    if (this.item.mouseArea && this.item.mouseArea.mouseup) {
      canvas.addEventListener("mouseup", (ev) => {
        if (ev.x <= this.item.mouseArea.width && ev.y <= this.item.mouseArea.height && this.onButtonRelease) {
          this.onButtonRelease();
        }
      });
    }

    this.setState(null, true);
    
    return Promise.all(this.item.states.map(it => it.downloaded)).then(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve();
        }, 100);
      });
    });
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
