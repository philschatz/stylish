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

// Component example
interface note1Params {
  background_color: string | Settings;
  border_bottom: string | Settings;
  line_height?: string | Settings;
}

class Note1 extends Component {
  public constructor() {
    super()
    this.defined = [
      { name: 'color', value: 'green' },
      { name: 'font-family', value: 'monospace' },
      { name: 'background-color', value: Settings.REQUIRED },
      { name: 'border', value: Settings.OPTIONAL },
    ]
    this.subSelector = ''
  }

  addDefined(params: note1Params): void {
    super.addDefined(params);
  }
}

class NoteTitle extends Component {
  public constructor() {
    super()
    this.defined = [
      { name: 'color', value: 'red' }
    ];
    this.subSelector = '[data-type="title"]';
  }

  // no addDefined -- no params to define!
  // TODO: enforce this so that addDefined can't be called?
};


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

class NoteShape extends Shape {
  // Component list as params of the shape, so that autocomplete will work
  note1: Note1;
  noteTitle: NoteTitle;

  constructor(rootSelector: string) {
    super(rootSelector)
    // all components on the shape are class properties + instantiated in the tree
    // (lots of repetition...)
    this.componentTree = {
      'val': this.note1 = new Note1(),
      'children': [
        {'val': this.noteTitle = new NoteTitle()}
      ]
    };
  }
};

const noteShape = new NoteShape('[data-type="note"]');
// add optional and required params
noteShape.note1.addDefined({
  background_color: 'blue', 
  border_bottom: 'solid 1px red', 
  line_height: '2'
});
// gives compile-time error if required params are not present!
// noteShape.note1.addDefined({
//   background_color: 'blue',
// });

// Another one, different selector
const noteShape1 = new NoteShape('div[data-type="note"].different-class');
noteShape.note1.addDefined({
  background_color: 'green', 
  border_bottom: 'double 2px blue'
  // optional param not needed!
});

noteShape.toCSS(); // generates CSS from component tree, errors if settings are unset
