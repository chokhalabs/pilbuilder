import { assertNever } from "./pilBase";

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
    eventLocationChecker: (ev: MouseEvent) => boolean;
  }>>;
  customEvents: Record<string, {
    when: string; // name of a state
    payload: any;
  }>;
};

interface BaseNodeDef {
  id: string;
}

interface PositionedNodeDef {
  x: number;
  y: number;
  width: number;
  height: number;
  draw: boolean;
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
    source: string;
  }>;
}

interface StatefulNodeDef {
  state: string;
  states: Array<{
    name: string;
    when: string;
    onEnter: Array<{ module: ImportableModulePath; callback: string; }>;
    propertyChanges: Array<{
      target: string;
      [k: string]: string | number | boolean;
    }>;
  }>;
}

export type ItemNode = { type: "Item" } & BaseNodeDef & PositionedNodeDef & MouseEnabledNodeDef & ContainerNodeDef & StatefulNodeDef & ImagedNode;
export type TextNode = { type: "Text", text: string; color: string; font: string; fontsize: number; } & BaseNodeDef;
export type TextEditNode = { type: "TextEdit"; value: string; } & BaseNodeDef & PositionedNodeDef & MouseEnabledNodeDef & StatefulNodeDef;
export type ColumnNode = { type: "Column" } & BaseNodeDef & ContainerNodeDef & PositionedNodeDef;
export type RowNode = { type: "Row" } & BaseNodeDef & ContainerNodeDef & PositionedNodeDef;
export type VertScrollNode = { type: "VertScroll" } & BaseNodeDef & ContainerNodeDef & PositionedNodeDef;

export type PilNodeDef = ItemNode | TextNode | TextEditNode | ColumnNode | VertScrollNode | RowNode;

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
type activateState = (node: PilNodeInstance<PilNodeDef>, state: string) => PaintRequest<PilNodeDef>;

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
          // Paint children
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
      case "VertScroll":
        console.error("Don't know how to paint: ", instance.node.type);
        break;
      default:
        assertNever(instance.node);
    }
  }
  return Promise.resolve();
}

function paintItem(instance: MountedInstance<ItemNode>): Promise<void> {
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
  if (node.draw) {
    context.rect(node.x, node.y, node.width, node.height);
  }
  context.fillText(node.value, node.x + 10, node.y + 10, node.width);
  context.closePath();
  context.stroke();

  return Promise.resolve();
}

export function deliverMouseDown(inst: MountedInstance<PilNodeDef>, ev: MouseEvent) {
  switch (inst.node.type) {
    case "Item":
      const mousedowntargets = inst.node.mouseArea.listeners["mousedown"];
      mousedowntargets.forEach(listener => {
        if (listener.eventLocationChecker(ev)) {
          listener.handler(ev);
        } else {
          console.info(`Ignore mousedown on ${inst.node}`);
        }
      });
      if (inst.children) {
        for (let child in inst.children) {
          const mountedChild = {
            ...inst.children[child],
            renderingTarget: inst.renderingTarget
          };
          deliverMouseDown(mountedChild, ev);
        }
      }
      break;
    case "VertScroll":
    case "TextEdit":
    case "Text":
    case "Row":
    case "Column":
      console.info(`Cannot deliver mousedown event to ${inst.node}`);
      break;
    default:
      assertNever(inst.node);
  }
}

export function mount(inst: PilNodeInstance<PilNodeDef>, canvasid: string): Promise<PaintRequest<PilNodeDef>[]> {
  return new Promise((res, rej) => {
    const canvas: HTMLCanvasElement|null = document.querySelector(canvasid);
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        const mountedInst: MountedInstance<PilNodeDef> = {
          ...inst,
          renderingTarget: {
            canvas,
            context,
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height
          }
        }
        canvas.addEventListener("mousedown", ev => deliverMouseDown(mountedInst, ev));
        let paintRequest = bindProps(mountedInst);
        res([paintRequest]);
      } else {
        rej("Could not obtain context");
      }
    } else {
      rej("Could not get canvas");
    }
  })
}

function activateState<T extends TextEditNode|ItemNode>(inst: PilNodeInstance<T>, state: string) {
  const targetState = inst.node.states.find(st => st.name === state);
  if (targetState) {
    inst.node.state = state;
  } else {
    throw new Error(`Cannot activate ${state} on ${inst.node}`);
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

function setupMouseArea<T extends ItemNode|TextEditNode>(inst: PilNodeInstance<T>): PilNodeInstance<T> {
  inst.node.mouseArea.listeners = {
    mousedown: [
      {
        handler(ev) {
          // activate state if inst.node has a matching when clause
          const targetState = inst.node.states.find(state => state.when === "mousedown");
          if (targetState && inst.node.state !== targetState.name) {
            activateState(inst, targetState.name);
          }
          // emit event if mouseArea is supposed to emit custom events
          Object.keys(inst.node.mouseArea.customEvents).map(event => {
            if (inst.node.mouseArea.customEvents[event].when === "mousedown") {
              emit(inst.eventBus, event, inst.node);
            }
          })
        },
        eventLocationChecker(ev) {
          const mouseAreaRect = { 
            x: inst.node.mouseArea.x,
            y: inst.node.mouseArea.y, 
            width: inst.node.mouseArea.width, 
            height: inst.node.mouseArea.height 
          };

          return pointIsInRect(ev, mouseAreaRect);
        }
      }
    ]
  };
  return inst;
}

function pointIsInRect(point: {x: number; y: number;}, rect: { x: number; y: number; width: number; height: number; }): boolean {
  return point.x >= rect.x &&
    point.y >= rect.y &&
    point.x <= rect.x + rect.width,
    point.y <= rect.y + rect.height;
}

function setupEventEmitters<T extends ItemNode|TextEditNode>(inst: PilNodeInstance<T>, parent: PilNodeInstance<PilNodeDef>): PilNodeInstance<T> {
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
      console.error(`Not able to setup emitters for parent ${parent}`);
      break;
    default:
      assertNever(parent.node);
  }
  
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
    
    if (isItemNodeExpression(resolvedExpr) || isTextEditNodeExpression(resolvedExpr)) {
      if (isItemNodeInstance(instance)) {
        const itemNodeInstance = setupMouseArea(instance);
        if (parentInst) {
          instance = setupEventEmitters(itemNodeInstance , parentInst);
        }
      
        for (let child in itemNodeInstance.node.children) {
          const childExpr = itemNodeInstance.node.children[child];
          childInstancePromises.push(
            init(childExpr, instance).then(childInst => {
              children[child] = childInst;
            })
          );
        }
      } else if (isTextEditNodeInstance(instance)) {
        const textEditNodeInstance = setupMouseArea(instance);
        if (parentInst) {
          instance = setupEventEmitters(textEditNodeInstance, parentInst);
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
