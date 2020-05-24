import vscode from 'vscode';



interface CommandWithoutTitle extends Omit<vscode.Command, 'title'> {
  title?: string;
}


export interface TreeItemConstructor extends Omit<vscode.TreeItem, 'command'> {
  label?: string,
  children?: TreeItem[] | TreeItem,

  // You can provide a vscode.Command like object, or the command directly, as a string.
  command?: CommandWithoutTitle | string;
}


export class TreeItem extends vscode.TreeItem {
  children?: TreeItem[];

  constructor({ label, children, command, ...rest }: TreeItemConstructor) {
    const collapsibleState = children === undefined ? vscode.TreeItemCollapsibleState.None :
      vscode.TreeItemCollapsibleState.Expanded;

    super(label, collapsibleState);
    this.children = Array.isArray(children) ? children : [children];

    if (typeof command === 'string')
      this.command = { command: command, title: '' };

    else if (command) { // If command was given (not undefined)
      this.command = { ...command, title: command.title || '' }; // Just a way to omit writing empty titles.
    }

    Object.assign(this, rest);
  }
}



// https://www.typescriptlang.org/docs/handbook/classes.html#abstract-classes
export abstract class BaseTreeDataProvider implements vscode.TreeDataProvider<TreeItem> {

  // idk yet what really are these two.
  // https://code.visualstudio.com/api/extension-guides/tree-view#updating-tree-view-content
  private _onDidChangeTreeData: vscode.EventEmitter<TreeItem> = new vscode.EventEmitter<TreeItem>();
  readonly onDidChangeTreeData: vscode.Event<TreeItem> = this._onDidChangeTreeData.event;

  protected data: TreeItem[] = [];

  constructor() {
    this.getData();
  }

  refresh() {
    this.getData();
    this._onDidChangeTreeData.fire();
  }

  // Just to get and set this.data from makeData().
  private getData() {
    let data = this.makeData();
    if (data) {
      if (!Array.isArray(data))
        data = [data];
      this.data = data;
    }
  }

  // If TreeItem is returned, will use it as this.data. It may change this.data directly without
  // returning anything (will probably remove this later)
  protected abstract makeData(): TreeItem | TreeItem[] | void;


  getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: TreeItem): vscode.ProviderResult<TreeItem[]> {
    if (element === undefined) {
      return this.data;
    }
    return element.children;
  }
}