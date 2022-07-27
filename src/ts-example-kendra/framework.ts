enum Settings {
  REQUIRED,
  OPTIONAL
};

type CSSProperty = {
  name: string; // validation here for "string that is a valid CSS property name"?
  value: string | Settings;
};

// Components
abstract class Component {
  subSelector?: string;
  protected defined: CSSProperty[] = [];

  addDefined(params: any): void {
    // parses params given as an object into CSSProperties and adds to `defined`
    let param_str: string = JSON.stringify(params);
    let keys: string[] | undefined = param_str.match(/"[\w]*":/g)?.map((val) => {
        return val.replaceAll('\"', '').replaceAll('_', '-').replace(':', '');
    });
    let vals: string[] | undefined = param_str.match(/:"[\w\s]*"/g)?.map((val) => { // TODO: allow hex colors thru, other data
        return val.replace(':', '').replaceAll('\"', '');
    });
    for (let i = 0; i < keys.length; i++) {
      this.defined.push({name: keys[i], value: vals[i]})
    }
  } // TODO: undefined checks; replaceAll

  toCSS(parentSelector: string): string {
    // TODO: validation
    return `${parentSelector}${this.subSelector} {
      ${this.defined[0].name}: ${this.defined[0].value};
    }` // TODO: put in all attributes from defined
  }
}

// Shapes
abstract class Shape {
  rootSelector: string;
  componentTree: any; // TODO: type this

  constructor(rootSelector: string) {
    this.rootSelector = rootSelector;
  }

  buildComponentTree() {
    // TODO: weave components (which are fields on the shape)
    // into a tree by setting parent & child attributes, and creating the full subselector (can be missing root)
  }

  toCSS() {
    // Traverses component tree
    // weaves subselectors & creates selector rule + params
    // calls buildComponentTree
  }
}
