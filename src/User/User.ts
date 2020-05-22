// Used namespace to use it at least once in life and to have Status under user.

import { accountTreeDataProvider } from '../treeView/account/account';
import { window } from 'vscode';
import { getUser } from '../octokit/commands/getUser';


enum Status {
  notLogged, awaitingOAuth, logging, errorLogging, connectionError, logged
}

export interface UserInterface {
  readonly login: string;
  readonly profileUri: string;
}

interface User extends UserInterface { }
class User implements UserInterface {
  readonly Status = Status;
  status: Status = Status.errorLogging;

  async loadUser() {
    try {
      user.status = user.Status.logging;
      accountTreeDataProvider.refresh();
      Object.assign(this, await getUser());
      user.status = user.Status.logged;
      accountTreeDataProvider.refresh();
    }
    catch (err) {
      user.status = user.Status.errorLogging;
      window.showErrorMessage(err.message);
      accountTreeDataProvider.refresh();
      throw new Error(err);
    }
  }
}

export const user = new User();