import { createElement as h } from "react";
import { Config, BindingExpression } from "./utils";

type DetailsProps = {
  node: Config | null,
  onNodeUpdate: (key: string, value: any) => void
};

function editNumber(props: { label: string; value: number; onChange: (key: string, value: number) => void, isProvided: boolean }) {
  return h(
    "div", 
    {
      className: "numberfield"
    },
    [
      h(
        "div",
        {},
        props.label
      ),
      h(
        "input",
        {
          value: props.value,
          type: "number",
          onChange: ev => props.onChange(props.label, parseFloat(ev.target.value))
        }
      )
    ] 
  );
}

function editColor(props: { label: string; value: string; onChange: (key: string, value: string) => void, isProvided: boolean }) {
  return h(
    "div", 
    {
      className: "colorfield"
    },
    [
      h(
        "div",
        {},
        props.label
      ),
      h(
        "input",
        {
          value: props.value,
          type: "color",
          onChange: ev => props.onChange( props.label, ev.target.value)
        }
      )
    ] 
  );
}

function editText(props: { label: string; value: string; defaultValue: string | string[], onChange: (key: string, value: string | BindingExpression) => void; isProvided: boolean} ) {
  const editor = h(
    "div", 
    {
      className: "boundfield"
    }, 
    h(
      "div",
      {},
      props.label
    ),
    h(
      "input",
      {
        value: props.isProvided ? props.value.substring("$props.".length) : props.value,
        type: "text",
        onChange: ev => props.onChange(
          props.label, 
          props.isProvided ? { 
            expr: "$props." + ev.target.value, 
            default: props.defaultValue, 
            map: false,
            evaluator: "pickSuppliedProp"
          } : ev.target.value
        )
      }
    ),
    h(
      "input", 
      { 
        type: "checkbox", 
        checked: props.isProvided, 
        onChange: ev => {
          if (ev.target.checked) {
            if (!props.defaultValue) {
              props.defaultValue = "default " + props.value.substring("$props.".length);
            }
            props.onChange(props.label, { 
              expr: "$props." + props.value, 
              default: props.defaultValue, 
              evaluator: "pickSuppliedProp",
              map: false 
            })
          } else {
            props.onChange(props.label, props.value)
          }
        } 
      }
    )
  );

  let inputs = h(
    "input",
    {
      placeholder: "Default value",
      value: props.defaultValue,
      onChange: ev => {
        props.onChange(props.label, { 
          expr: props.value, 
          default: ev.target.value, 
          map: false,
          evaluator: "pickSuppliedProp"
        })
      }
    }
  );

  if (Array.isArray(props.defaultValue)) {
    let arrayItems = props.defaultValue.map((val, i) => {
      return h(
        "input",
        {
          placeholder: "Default value",
          value: val,
          onChange: ev => {
            let newDefaults: string[] = [];
            if (Array.isArray(props.defaultValue)) {
              newDefaults = [...props.defaultValue]
              newDefaults.splice(i, 1, ev.target.value);
            }
            props.onChange(props.label, { 
              expr: props.value, 
              default: newDefaults, 
              map: true,
              evaluator: "pickSuppliedProp"
            })
          }
        }
      )
    });
    inputs = h(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column"
        }
      },
      arrayItems
    )
  }

  const defaultValue = h(
    "div",
    {},
    h(
      "div",
      {},
      "default"
    ),
    h(
      "div",
      {
        style: { display: "flex" }
      },
      inputs,
      h(
        "button",
        {
          onClick: () => {
            let defaultValues: string[] = [];
            if (Array.isArray(props.defaultValue)) {
              defaultValues = defaultValues.concat(props.defaultValue);
            } else {
              defaultValues.push(props.defaultValue);
            }
            defaultValues.push("new")
            props.onChange(props.label, { 
              expr: props.value, 
              default: defaultValues, 
              map: true,
              evaluator: "pickSuppliedProp"
            })
          }
        },
        "+"
      )
    )
  );

  return h(
    "div", 
    {
      className: "textfield"
    },
    editor,
    h("hr"),
    props.isProvided ? defaultValue : null 
  );
}

function makePropEditors(node: Config, propEditors: Array<ReturnType<typeof h>>, props: DetailsProps) {
  if (node.props) {
    Object.keys(node.props).forEach(propkey => {
      const propval = node.props && node.props[propkey];
      if (propkey === "fill") {
        propEditors.push(editColor({ 
          label: propkey, 
          value: propval as string, // fill is always string
          onChange: props.onNodeUpdate,
          isProvided: false
        }));
      } else if (typeof propval === "number") {
        propEditors.push(editNumber({
          label: propkey,
          value: propval,
          onChange: props.onNodeUpdate,
          isProvided: false
        }));
      } else if (typeof propval === "string") {
        propEditors.push(editText({
          label: propkey,
          value: propval,
          defaultValue: "", 
          onChange: props.onNodeUpdate,
          isProvided: false
        }));
      } else if (typeof propval === "object" && propval && propval.evaluator === "pickSuppliedProp") {
        let defaultValue: string|string[];
        if (typeof propval.default === "string") {
          defaultValue = propval.default;
        } else if (Array.isArray(propval.default)) {
          defaultValue = propval.default as string[];
        } else {
          defaultValue = (propval.default || "").toString();
        }
        propEditors.push(editText({
          label: propkey,
          value: propval.expr,
          defaultValue,
          onChange: props.onNodeUpdate,
          isProvided: true
        }));
      }
    });
  }
}

export default function (props: DetailsProps) {
  let body = h("div", {}, "Select a node to edit its properties!");
  if (props.node) {
    const node = props.node;
    let propEditors: Array<ReturnType<typeof h>> = [];

    makePropEditors(node, propEditors, props);
    // node.children.forEach(child => {
    //   makePropEditors(child, propEditors, props);
    // }) 

    body = h(
      "div",
      {},
      propEditors
    )
  }

  return h(
    "div",
    {
      className: "detailsbar"
    },
    body 
  );
}