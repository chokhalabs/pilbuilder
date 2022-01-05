// import { Rect, Text, Group } from 'react-konva';
import { createElement as h } from 'react';

export type BindingExpression = {
  expr: string;
  default: string | number | boolean | ((...args: any[]) => any)
};

type PropExprs = Record<string, number|boolean|string|((...args: any[]) => any)|BindingExpression>;

export interface Config {
  id: string;
  type: "Group" | "Rect" | "Text";
  props: PropExprs|null; 
  children: Config[];
}

export interface Component {
  name: string;
  config: Config;
}

function evaluateProps($props: Record<string, any>, propsExprs: PropExprs) {
  const evaluated = {...propsExprs};
  Object.keys(propsExprs).forEach(key => {
    const propval = propsExprs[key];
    if (typeof propval === "object") {
      if ($props[propval.expr.substring("$props.".length)]) {
        // evaluated[key] = eval(propval.expr);
        evaluated[key] = $props[propval.expr.substring("$props.".length)];
      } else {
        evaluated[key] = propval.default;
      }
    }
  });
  return evaluated;
}

export function tranformToVDOM(config: Config, $props: PropExprs): any {
  let props: PropExprs|null = null;
  if (config.props) {
    props = evaluateProps($props, config.props);
  }
  const children = config.children.map(child => h(tranformToVDOM(child, $props), { key: child.id }));
  return function() {
    return h(
      config.type,
      { 
        ...props,
        id: config.id
      },
      children
    );
  }
}
