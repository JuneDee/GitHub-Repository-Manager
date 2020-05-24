import { accountTreeDataProvider } from '../treeView/account/account';
import { window } from 'vscode';
import { getUser } from '../octokit/commands/getUser';


/**
 * notLogged : The user is not logged.
 *
 * awaitingOAuth : When the users clicks a Login with OAuth option.
 *
 * logging : When the user authenticated and its data is being downloaded.
 *
 * errorLogging : For some reason, there was an error logging in.
 *
 * connectionError : Not currently used, but may be a good idea to use someday.
 *
 * logged : The user is successfully logged
 */
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
  private _status: Status = Status.notLogged;

  get status() { return this._status; }

  setStatus(status: Status, updateTreeView: boolean = true) {
    this._status = status;
    if (updateTreeView)
      accountTreeDataProvider.refresh();
  }

  async loadUser({ showError } = { showError: true }) {
    try {
      this.setStatus(this.Status.logging);
      Object.assign(this, await getUser());
      this.setStatus(this.Status.logged);
    }
    catch (err) {
      this.setStatus(this.Status.errorLogging);
      if (showError)
        window.showErrorMessage(err.message);
      throw new Error(err);
    }
  }
}

export const user = new User();