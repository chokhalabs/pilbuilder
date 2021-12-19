import { assertNever, IdObj } from "./pilBase";

type Expression<T> = { def: string; context: string; value: T; };
type ImportableModulePath = string;

type evaluate<T> = (ex: Expression<T>) => T;

declare global {
  interface Window {
    $parent: null | PilNodeDef;
  }
}

type MouseArea = {
  x: number;
  y: number;
  width: number;
  height: number;
  listeners: Record<string, Array<{
    handler: (ev: MouseEvent) => void;
  }>>;
  customEvents: Record<string, {
    when: string; // name of a state
    payload: any;
  }>;
};

interface BaseNodeDef {
  id: string;
}

interface UnsizedNodeDef {
  x: number;
  y: number;
  draw: boolean;
}

interface PositionedNodeDef extends UnsizedNodeDef {
  width: number;
  height: number;
}

interface MouseEnabledNodeDef {
  mouseArea: MouseArea;
}

interface ContainerNodeDef {
  children: Record<string, PilNodeExpression<PilNodeDef>>;
}

function isContainerNode(node: Partial<PilNodeDef>): node is ContainerNodeDef {
  if (node.type === "Item") {
    return !!node.children;
  } else {
    return false;
  }
}

interface ImagedNode {
  images: Array<{
    id: string;
    source: string;
    visible: boolean;
    ref?: HTMLImageElement;
    downloaded: Promise<any> | null;
  }>;
}

interface NodeState {
  name: string;
  when: string;
  onEnter: Array<{ module: ImportableModulePath; callback: string; }>;
  propertyChanges: Array<{
    target: string;
    [k: string]: string | number | boolean;
  }>;
}

interface StatefulNodeDef {
  state: string;
  states: NodeState[];
}

interface AnimatedNodeDef {
  animations: Array<Animation>;
}

interface Animation {
  propertyName: string;
  start: any;
  end: any;
  duration: number;
  loop: boolean;
}

export type ItemNode = { type: "Item" } & BaseNodeDef & PositionedNodeDef & MouseEnabledNodeDef & ContainerNodeDef & StatefulNodeDef & ImagedNode & AnimatedNodeDef;
export type TextNode = { type: "Text", text: string; color: string; font: string; fontsize: number; } & BaseNodeDef & UnsizedNodeDef;
export type TextEditNode = { type: "TextEdit"; value: string; currentEditedText: string; cursorPosition: number; } & BaseNodeDef & PositionedNodeDef & MouseEnabledNodeDef & StatefulNodeDef & ContainerNodeDef;
export type ColumnNode = { type: "Column" } & BaseNodeDef & ContainerNodeDef & PositionedNodeDef;
export type RowNode = { type: "Row" } & BaseNodeDef & ContainerNodeDef & PositionedNodeDef;
export type VertScrollNode = { type: "VertScroll" } & BaseNodeDef & ContainerNodeDef & PositionedNodeDef;
export type ListNode = { type: "List"; childModel: any[]; childComponent: PilNodeDef; } & BaseNodeDef & UnsizedNodeDef;

export type PilNodeDef = ItemNode | TextNode | TextEditNode | ColumnNode | VertScrollNode | RowNode | ListNode;

// Used when making new PilNodeDefs
export interface PilNodeExpression<T extends PilNodeDef> {
  definition: T | string;
  props: Record<string, Expression<any>>;
  eventHandlers: Record<string, {
    emitName: string;
    payloadTransformer: {
      module: ImportableModulePath;
      callback: string;
    }
  }>;
}

export interface ResolvedPilNodeExpression<T extends PilNodeDef> extends PilNodeExpression<T> {
  definition: T;
}

function resolveExpression(expr: PilNodeExpression<PilNodeDef>): Promise<ResolvedPilNodeExpression<PilNodeDef>> {
  if (typeof expr.definition === "string") { 
    return import(expr.definition).then(({default: def}) => {
      // TODO: Add better validation for the imported def
      expr.definition = def;
      return expr as ResolvedPilNodeExpression<PilNodeDef>;
    });
  } else {
    const def = expr.definition;
    return Promise.resolve({ ...expr, definition: def });
  }
}

interface EventBus {
  listeners: Record<string, Array<(payload: any) => void>>;
};

export function emit(bus: EventBus, eventname: string, payload: any) {
  if (bus.listeners[eventname]) {
    bus.listeners[eventname].forEach(cb => {
      cb.call(null, [payload]);
    });
  } else {
    console.error(`No eventlisteners for ${eventname} on the bus`);
  }
}

interface PilNodeInstance<T extends PilNodeDef> {
  node: T;
  expr: PilNodeExpression<T>;
  eventBus: EventBus;
  children: T extends ItemNode ? Record<string, PilNodeInstance<PilNodeDef>> : 
            T extends ColumnNode ? Record<string, PilNodeInstance<PilNodeDef>> :
            null;
}

interface MountedInstance<T extends PilNodeDef> extends PilNodeInstance<T> {
  renderingTarget: PilRenderingContext;
}

interface PilRenderingContext {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PaintRequest<T extends PilNodeDef> {
  inst: MountedInstance<T>;
  timestamp: number;
}

// type initPil<T extends PilNodeDef> = (nodeDef: T) => PilNodeInstance<T>;
type paint<T extends PilNodeDef> = (reqs: PaintRequest<T>[]) => Promise<void>;

function isMountedItemInstance(inst: MountedInstance<PilNodeDef>): inst is MountedInstance<ItemNode> {
  if (inst.node.type === "Item") {
    return true;
  } else {
    return false;
  }
}

function isMountedColumnInstance(inst: MountedInstance<PilNodeDef>): inst is MountedInstance<ColumnNode> {
  if (inst.node.type === "Column") {
    return true;
  } else {
    return false;
  }
}

function isMountedTexteditInstance(inst: MountedInstance<PilNodeDef>): inst is MountedInstance<TextEditNode> {
  return inst.node.type === "TextEdit";
}

function isMountedTextInstance(inst: MountedInstance<PilNodeDef>): inst is MountedInstance<TextNode> {
  return inst.node.type === "Text";
}


function isMountedRowInstance(inst: MountedInstance<PilNodeDef>): inst is MountedInstance<ColumnNode> {
  return inst.node.type === "Row";
}

export function paint(reqs: PaintRequest<PilNodeDef>[]) {
  for (let req of reqs) {
    const instance = req.inst;
    // The switch is required for exhaustiveness checking
    switch(instance.node.type) {
      case "Item":
        // Required for safely narrowing instance type
        if (isMountedItemInstance(instance)) {
          paintItem(instance);
          const childPaintReqs: PaintRequest<PilNodeDef>[] = Object.values(instance.children).map(inst => {
            return {
              inst: {
                ...inst,
                renderingTarget: instance.renderingTarget
              },
              timestamp: Date.now() 
            }
          })
          paint(childPaintReqs);
        }
        break;
      case "Row":
      case "Column":
        if (isMountedColumnInstance(instance) || isMountedRowInstance(instance)) {
          paintColumn(instance);
          const childPaintReqs: PaintRequest<PilNodeDef>[] = Object.values(instance.children).map(inst => {
            return {
              inst: {
                ...inst,
                renderingTarget: instance.renderingTarget
              },
              timestamp: Date.now() 
            }
          })
          paint(childPaintReqs);
        }
        break;
      case "TextEdit":
        if (isMountedTexteditInstance(instance)) {
          paintTextEdit(instance);
        }
        break;
      case "Text":
        if (isMountedTextInstance(instance)) {
          paintText(instance);
        }
        break;
      case "VertScroll":
      case "List":
        console.error("Don't know how to paint: ", instance.node.type);
        break;
      default:
        assertNever(instance.node);
    }
  }
  return Promise.resolve();
}

function paintText(instance: MountedInstance<TextNode>): Promise<void> {
  const node = instance.node;
  const { context }  = instance.renderingTarget;
  context.beginPath();
  context.font = node.font;
  context.fillStyle = node.color;
  context.fillText(node.text, node.x, node.y + (node.fontsize * 0.5));
  context.closePath();
  context.stroke();
  context.fillStyle = "black";

  return Promise.resolve();
}

function paintItem(instance: MountedInstance<ItemNode>): Promise<void> {
  const node = instance.node;
  const { context, x: minx, y: miny, width: maxwidth, height: maxheight } = instance.renderingTarget;

  context.beginPath();
  if (node.draw) {
    context.rect(node.x, node.y, node.width, node.height);
  }
  const imagesPainted = node.images.map(image => {
    if (image.downloaded) {
      return image.downloaded
      .then(() => {
        if (image.ref && image.visible) {
          context.drawImage(image.ref, 0, 0, image.ref.width, image.ref.height, node.x, node.y, node.width, node.height);
        } 
      })
      .catch(err => {
        console.error("Image download has failed!", instance.node, err);
      })
    } else {
      console.error("Image has not been downloaded: ", instance.node);
      throw new Error("Image not downloaded!");
    }
  })
  return Promise.all(imagesPainted).then(() => {
    context.closePath();
    context.stroke();
  });
}

function paintColumn(instance: MountedInstance<ColumnNode>): Promise<void> {
  const node = instance.node;
  const { context, x: minx, y: miny, width: maxwidth, height: maxheight } = instance.renderingTarget;

  context.beginPath();
  if (node.draw) {
    context.rect(node.x, node.y, node.width, node.height);
  }
  context.closePath();
  context.stroke();

  return Promise.resolve();
}

function paintTextEdit(instance: MountedInstance<TextEditNode>): Promise<void> {
  const node = instance.node;
  const context = instance.renderingTarget.context;

  context.beginPath();
  context.clearRect(node.x, node.y, node.width, node.height);
  if (node.draw) {
    context.rect(node.x, node.y, node.width, node.height);
  }
  if (node.state === "inactive") {
    context.fillText(node.value, node.x + 10, node.y + 10, node.width);
  } else if (node.state === "active") {
    context.fillText(node.currentEditedText, node.x + 10, node.y + 10, node.width);
  }
  context.closePath();
  context.stroke();

  return Promise.resolve();
}

function deliverEventToChildren(inst: PilNodeInstance<PilNodeDef>, ev: MouseEvent, eventname: string, renderingTarget: PilRenderingContext) {
  if (inst.children) {
    Object.values(inst.children).forEach(child => {
      deliverMouseEvent({
        ...child,
        renderingTarget
      }, ev, eventname);
    })
  }
}

export function deliverMouseEvent(inst: MountedInstance<PilNodeDef>, ev: MouseEvent, eventname: string) {
  switch (inst.node.type) {
    case "TextEdit":
    case "Item":
      const mousedowntargets = inst.node.mouseArea.listeners[eventname];
      if (mousedowntargets) {
        mousedowntargets.forEach(listener => {
          listener.handler(ev);
        });
      }
      deliverEventToChildren(inst, ev, eventname, inst.renderingTarget);
      break;
    case "Row":
    case "Column":
      deliverEventToChildren(inst, ev, eventname, inst.renderingTarget);
      break;
    case "VertScroll":
    case "Text":
    case "List":
      console.error(`Cannot deliver mousedown event to ${inst.node}`);
      break;
    default:
      assertNever(inst.node);
  }
}

function getRenderingTarget(canvasid: string): PilRenderingContext {
  const canvas: HTMLCanvasElement|null = document.querySelector(canvasid);
  const context = canvas?.getContext("2d");
  if (canvas && context) {
    return {
      canvas,
      context,
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height
    }
  } else {
    throw new Error("Could not get rendering context");
  }
}

export function mount(inst: PilNodeInstance<PilNodeDef>, renderingTarget: PilRenderingContext|string): Promise<PaintRequest<PilNodeDef>[]> {
  return new Promise((res, rej) => {
    let mountingAChild = false;
    if (typeof renderingTarget === "string") {
      renderingTarget = getRenderingTarget(renderingTarget);
    } else {
      mountingAChild = true;
    }
    if (renderingTarget) {
      let mountedInst: MountedInstance<PilNodeDef> = {
        ...inst,
        renderingTarget
      }

      mountedInst = setupMouseArea(mountedInst);
    
      if (!mountingAChild) {
        renderingTarget.canvas.addEventListener("mousedown", ev => deliverMouseEvent(mountedInst, ev, "mousedown"));
        renderingTarget.canvas.addEventListener("mouseup", ev => deliverMouseEvent(mountedInst, ev, "mouseup"));
      }

      if (isMountedItemInstance(mountedInst)) {
        wireUpStateListeners(mountedInst);
        Object.values(mountedInst.children).forEach(child => {
          mount(child, renderingTarget);
        })
      } else if (isMountedTexteditInstance(mountedInst)) {
        wireUpStateListeners(mountedInst);
      } else if (isMountedRowInstance(mountedInst)) {
        Object.values(mountedInst.children).forEach(child => {
          mount(child, renderingTarget);
        })
      } else if (isMountedColumnInstance(mountedInst)) {
        Object.values(mountedInst.children).forEach(child => {
          mount(child, renderingTarget);
        })
      } else if (isMountedTextInstance(mountedInst)) {
        // Nothing to do
      } else {
        console.error("Cannot recognize node: ", mountedInst);
      }

      let paintRequest = bindProps(mountedInst);
      res([paintRequest]);
    } else {
      rej("Could not get canvas");
    }
  })
}

function activateState(inst: MountedInstance<PilNodeDef>, state: string): PaintRequest<PilNodeDef>[] {
  if (isMountedTexteditInstance(inst) || isMountedItemInstance(inst)) {
    const targetState = inst.node.states.find(st => st.name === state);
    if (targetState) {
      inst.node.state = state;
      inst = applyPropertyChanges(inst, targetState);
      targetState.onEnter.forEach(handler => {
        import(handler.module).then(mod => {
          const onNodePropertyUpdate = (function (this: MountedInstance<PilNodeDef>, prop: string, value: string | boolean | number) {
            (this.node as any)[prop] = value;
            paint([{
              inst,
              timestamp: Date.now()
            }])
          }).bind(inst);
          (mod)[handler.callback].call(null, inst.node, onNodePropertyUpdate)
        })
        .catch(err => {
          console.error("Could not execute onEnter for", state, inst, err);
        })
      });
      return [{
        inst,
        timestamp: Date.now()
      }];
    } else {
      throw new Error(`Cannot activate ${state} on ${inst.node}`);
    }
  } else  {
    console.error("Cannot activate state on ", inst);
    return [];
  } 
}

function applyPropertyChanges(inst: MountedInstance<PilNodeDef>, state: NodeState) {
  state.propertyChanges.forEach(change => {
    // Find the target
    const target: any = findTargetById(inst.node, change.target);
    // Apply changes
    if (target) {
      Object.keys(change)
        .filter(it => it !== "target")
        .forEach(key => {
          target[key] = change[key];
        });
    } else {
      console.error("Could not find target to apply");
    }
    
  });
  return inst;
}

function findTargetById(cursor: IdObj, id: string): IdObj | null {
  if (cursor.id === id) {
    return cursor;
  } else {
    const target = null;
    if (!Array.isArray(cursor) && typeof cursor === "object") {
      const findings = Object.keys(cursor)
        .filter(it => typeof cursor[it] === "object")
        .map(key => {
          return findTargetById(cursor[key], id);
        })
        .filter(it => !!it);
      if (findings.length > 0) {
        return findings[0];
      }
    } else if (typeof cursor === "object") {
      const findings = cursor
        .map(child => {
          return findTargetById(child, id);
        })
        .flat(Infinity)
        .filter(it => !!it);
      if (findings.length > 0) {
        return findings[0];
      }
    }
    return target; 
  }
}

function isItemNodeExpression(expr: PilNodeExpression<PilNodeDef>): expr is PilNodeExpression<ItemNode> {
  if (typeof expr.definition === "string") {
    return false;
  } else {
    return expr.definition.type === "Item";
  }
}

function isTextEditNodeExpression(expr: PilNodeExpression<PilNodeDef>): expr is PilNodeExpression<TextEditNode> {
  if (typeof expr.definition === "string") {
    return false;
  } else {
    return expr.definition.type === "TextEdit";
  }
}

function isTextNodeExpression(expr: PilNodeExpression<PilNodeDef>): expr is PilNodeExpression<TextNode> {
  if (typeof expr.definition === "string") {
    return false;
  } else {
    return expr.definition.type === "Text";
  }
}

function isColumnNodeExpression(expr: PilNodeExpression<PilNodeDef>): expr is PilNodeExpression<ColumnNode> {
  if (typeof expr.definition === "string") {
    return false;
  } else {
    return expr.definition.type === "Column";
  }
}

function isRowNodeExpression(expr: PilNodeExpression<PilNodeDef>): expr is PilNodeExpression<RowNode> {
  if (typeof expr.definition === "string") {
    return false;
  } else {
    return expr.definition.type === "Row";
  }
}

function isItemNodeInstance(inst: PilNodeInstance<PilNodeDef>): inst is PilNodeInstance<ItemNode> {
  if (inst.node.type === "Item") {
    return true;
  } else {
    return false;
  }
}

function isTextEditNodeInstance(inst: PilNodeInstance<PilNodeDef>): inst is PilNodeInstance<TextEditNode> {
  return inst.node.type === "TextEdit";
}

function isTextNodeInstance(inst: PilNodeInstance<PilNodeDef>): inst is PilNodeInstance<TextNode> {
  return inst.node.type === "Text";
}

function isColumnNodeInstance(inst: PilNodeInstance<PilNodeDef>): inst is PilNodeInstance<ColumnNode> {
  if (inst.node.type === "Column") {
    return true;
  } else {
    return false;
  }
}

function isRowNodeInstance(inst: PilNodeInstance<PilNodeDef>): inst is PilNodeInstance<RowNode> {
  return inst.node.type === "Row";
}

function setupMouseArea(inst: MountedInstance<PilNodeDef>): MountedInstance<PilNodeDef> {
  if (isMountedItemInstance(inst) || isMountedTexteditInstance(inst)) {
    inst.node.mouseArea.listeners = {
      mousedown: [
        {
          handler(ev) {
            const mouseAreaRect = { 
              x: inst.node.mouseArea.x + inst.node.x,
              y: inst.node.mouseArea.y + inst.node.y, 
              width: inst.node.mouseArea.width + inst.node.width, 
              height: inst.node.mouseArea.height + inst.node.height 
            };

            // emit event if mouseArea is supposed to emit custom events
            Object.keys(inst.node.mouseArea.customEvents).map(event => {
              if (pointIsInRect(ev, mouseAreaRect)) {
                if (inst.node.mouseArea.customEvents[event].when === "mousedown") {
                  emit(inst.eventBus, event, inst.node);
                }
              } else {
                if (inst.node.mouseArea.customEvents[event].when === "mousedown:outside") {
                  emit(inst.eventBus, event, inst.node);
                }
              }
            })
          }
        }
      ],
      mouseup: [
        {
          handler(ev) {
            const mouseAreaRect = { 
              x: inst.node.mouseArea.x + inst.node.x,
              y: inst.node.mouseArea.y + inst.node.y, 
              width: inst.node.mouseArea.width + inst.node.width, 
              height: inst.node.mouseArea.height + inst.node.height 
            };

            // emit event if mouseArea is supposed to emit custom events
            Object.keys(inst.node.mouseArea.customEvents).map(event => {
              if (pointIsInRect(ev, mouseAreaRect)) {
                if (inst.node.mouseArea.customEvents[event].when === "mouseup") {
                  emit(inst.eventBus, event, inst.node);
                }
              } else {
                if (inst.node.mouseArea.customEvents[event].when === "mouseup:outside") {
                  emit(inst.eventBus, event, inst.node);
                }
              }
            })
          }
        }
      ]
    };
  }
  
  return inst;
}

function pointIsInRect(point: {x: number; y: number;}, rect: { x: number; y: number; width: number; height: number; }): boolean {
  return point.x >= rect.x &&
    point.y >= rect.y &&
    point.x <= rect.x + rect.width &&
    point.y <= rect.y + rect.height;
}

function setupEventEmitters<T extends PilNodeDef>(inst: PilNodeInstance<T>, parent: PilNodeInstance<PilNodeDef>): PilNodeInstance<T> {
  // Wire the eventbus of the instance to deliver the event to its parent's bus
  switch (parent.node.type) {
    case "TextEdit":
    case "Item":
      Object.keys(inst.expr.eventHandlers).forEach(event => {
        const parentBus = parent.eventBus;
        if (parentBus.listeners[event]) {
          emit(parentBus, event, "No facility to send payload implemented yet");
        } else {
          console.error(`Parent ${parent} cannot listen to the ${event} on child ${inst}`);
        }
      })
      break;
    case "Text":
    case "Column":
    case "Row":
    case "VertScroll":
    case "List":
      console.error(`Not able to setup emitters for parent ${parent}`);
      break;
    default:
      assertNever(parent.node);
  }
  
  return inst;
}

function wireUpStateListeners<T extends ItemNode|TextEditNode>(inst: MountedInstance<T>): MountedInstance<T> {
  const node = inst.node;
  node.states.forEach(state => {
    if (!inst.eventBus.listeners[state.when]) {
      inst.eventBus.listeners[state.when] = [];
    }
    inst.eventBus.listeners[state.when].push(
      () => {
        if (inst.node.state !== state.name) {
          const paintRequests = activateState(inst, state.name);
          paint(paintRequests);
        }
      }
    )
  })
  return inst;
}

function bindProps<T extends PilNodeDef>(inst: MountedInstance<T>, parent?: MountedInstance<T>): PaintRequest<T> {
  Object.keys(inst.expr.props).forEach(prop => {
    const expr = inst.expr.props[prop];

    if (expr.context === "$parent" &&  parent) {
      window.$parent = parent.node;
      (inst.node as any)[prop] = eval(expr.def);
      window.$parent = null;
    } else {
      (inst.node as any)[prop] = expr.value;
    }
  });

  Object.keys(inst.children || []).forEach(childkey => {
    if (inst.children) {
      const child = inst.children[childkey];
      let childPaintReq = bindProps({
        ...child,
        renderingTarget: inst.renderingTarget
      }, inst);

      inst.children[childkey] = {
        ...childPaintReq.inst
      }
    }
  });

  return {
    inst,
    timestamp: Date.now()
  };
}

function downloadImages(instance: PilNodeInstance<ItemNode>): PilNodeInstance<ItemNode> {
  instance.node.images = instance.node.images.map(image => {
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
  return instance;
}

export function init<T extends PilNodeDef>(expr: PilNodeExpression<T>, parentInst?: PilNodeInstance<T>): Promise<PilNodeInstance<PilNodeDef>> {
  return resolveExpression(expr).then(resolvedExpr => {
    const children: Record<string, PilNodeInstance<PilNodeDef>> = {};
    let instance: PilNodeInstance<PilNodeDef> = {
      node: JSON.parse(JSON.stringify(resolvedExpr.definition)),
      expr,
      eventBus: {
        listeners: {}
      },
      children 
    };
    
    const childInstancePromises = [];
    
    if (isItemNodeExpression(resolvedExpr) || isTextEditNodeExpression(resolvedExpr) || isTextNodeExpression(resolvedExpr)) {
      if (isItemNodeInstance(instance)) {
        if (parentInst) {
          // Assigning ItemNodeInstance<ItemNode> is converting it back to ItemNodeInstance<PilNodeDef> for some reason I don't understand
          const i = setupEventEmitters(instance , parentInst);
          instance = i;
        } 
        if (isItemNodeInstance(instance)) {
          const j = downloadImages(instance);
          instance = j;
        }

        // This check is required again because of the assignment above changing the type back to ItemNodeInstance<PilNodeDef>
        if (isItemNodeInstance(instance)) {
          for (let child in instance.node.children) {
            const childExpr = instance.node.children[child];
            childInstancePromises.push(
              init(childExpr, instance).then(childInst => {
                children[child] = childInst;
              })
            );
          }
        } 
        
      } else if (isTextEditNodeInstance(instance)) {
        // const textEditNodeInstance = setupMouseArea(instance);
        if (parentInst) {
          instance = setupEventEmitters(instance, parentInst);
        }
      } else if (isTextNodeInstance(instance)) {
        if (parentInst) {
          instance = setupEventEmitters(instance, parentInst);
        }
      }

      return Promise.all(childInstancePromises).then(() => instance);
    } else if (isColumnNodeExpression(resolvedExpr) || isRowNodeExpression(resolvedExpr)) {
      if (isColumnNodeInstance(instance) || isRowNodeInstance(instance)) {
        for (let child in instance.node.children) {
          const childExpr = instance.node.children[child];
          childInstancePromises.push(
            init(childExpr, instance).then(childInst => {
              children[child] = childInst;
            })
          );
        }
      }
      return Promise.all(childInstancePromises).then(() => instance);
    } else {
      return Promise.reject("Cannot instantiate expression because node not recognized: " + JSON.stringify(expr, null, 4)); 
    }
  })
}
