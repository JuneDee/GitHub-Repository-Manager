import { Octokit } from "@octokit/rest";
import { repositories } from "../Repository/Repository";
import { repositoriesTreeDataProvider } from "../treeView/repositories/repositories";
import { user } from "../User/User";
import { accountTreeDataProvider } from "../treeView/account/account";
import { storage } from '../main/storage';
import { configs } from '../main/configs';
import { activateOAuth } from "./oauth";
import vscode from 'vscode';


export let octokit: Octokit | null = null;
export let token = '';



/**
 * Automatically enters the token, if .env or stored token.
 *
 * @export
 */
export function activateOctokit(): void {
  activateOAuth();

  let token = '';
  if (process.env.USE_ENV_TOKEN === 'true')
    token = process.env.TOKEN;
  else if (configs.saveToken)
    token = storage.loadToken();

  if (token)
    initOctokit(token);
}


export async function retryLoggingIn(): Promise<void> {
  await initOctokit(token);
}


// export
export async function initOctokit(tokenArg: string): Promise<void> {
  token = tokenArg;

  octokit = new Octokit({
    auth: tokenArg,
  });

  try {
    await Promise.all([
      user.loadUser({ showError: false }),
      repositories.loadRepos({ showError: false })
    ]);
  }
  catch (err) {
    octokit = null;
    vscode.window.showErrorMessage(err.message);
    return;
  }

  if (configs.saveToken) // 'If setting', store the token.
    storage.storeToken(tokenArg);

}

export function logoutAndForgetToken(): void {
  storage.removeToken();
  user.setStatus(user.Status.notLogged);
  repositories.clearRepositories();
}