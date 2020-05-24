import vscode from 'vscode';
import { BaseTreeDataProvider } from '../base';
import { user } from '../../User/User';
import { getLoggedTreeData, activateLogged } from './accountLogged';
import { getNotLoggedTreeData, activateNotLogged } from './accountNotLogged';

export let accountTreeDataProvider: TreeDataProvider;

export function activateTreeViewAccount() {
  accountTreeDataProvider = new TreeDataProvider();
  vscode.window.registerTreeDataProvider('githubRepoMgr.views.account', accountTreeDataProvider);
  activateLogged();
  activateNotLogged();
}

// There is a TreeItem from vscode. Should I use it? But it would need a workaround to
// avoid using title in command.
class TreeDataProvider extends BaseTreeDataProvider {

  constructor() { super(); }

  protected makeData() {
    if (user.status === user.Status.logged)
      return getLoggedTreeData();
    else
      return getNotLoggedTreeData();
  }
}