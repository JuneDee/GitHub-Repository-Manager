import vscode, { ThemeIcon } from 'vscode';
import { TreeItem } from "../base";
import { initOctokit, logoutAndForgetToken, retryLoggingIn } from "../../octokit/octokit";
import { openOAuthWebPage, copyOAuthLinkToClipboard, closeOAuthServer, oauthPort } from '../../octokit/oauth';
import { user } from '../../User/User';



export function activateNotLogged() {
  // Open OAuth web page
  vscode.commands.registerCommand('githubRepoMgr.commands.auth.openOAuthWebPage', () => {
    openOAuthWebPage();
  });

  // Copy OAuth link to clipboard
  vscode.commands.registerCommand('githubRepoMgr.commands.auth.copyOAuthLinkToClipboard', () => {
    copyOAuthLinkToClipboard();
  });

  // Close OAuth callback server
  vscode.commands.registerCommand('githubRepoMgr.commands.auth.closeOauthServer', () => {
    closeOAuthServer();
    user.setStatus(user.Status.notLogged);
  });

  // Enter token on input box
  vscode.commands.registerCommand('githubRepoMgr.commands.auth.enterToken', async () => {
    const token = await vscode.window.showInputBox();
    if (token) // If typed anything
      initOctokit(token);
  });


  // On Auth Error, try logging again using same credentials as before
  vscode.commands.registerCommand('githubRepoMgr.commands.authError.retry', () =>
    retryLoggingIn());

  // On Auth Error, cancel and forget token.
  vscode.commands.registerCommand('githubRepoMgr.commands.authError.cancelAndForgetToken', () =>
    logoutAndForgetToken());
}



export function getNotLoggedTreeData(): TreeItem | TreeItem[] {
  switch (user.status) {
    case user.Status.errorLogging:
      return errorLogging();

    case user.Status.logging:
      return logging();

    case user.Status.awaitingOAuth:
    case user.Status.notLogged:
      return notLogged();
  }
}



function errorLogging() {
  return new TreeItem({
    label: 'Authorization Error!',
    children: [
      new TreeItem({
        label: 'Retry',
        command: 'githubRepoMgr.commands.authError.retry'
      }),
      new TreeItem({
        label: 'Cancel and forget token',
        command: 'githubRepoMgr.commands.authError.cancelAndForgetToken'
      }),
    ]
  });
}



function logging() {
  return new TreeItem({
    label: 'Loading...',
    iconPath: new ThemeIcon('kebab-horizontal')
  });
}



function notLogged() {
  return new TreeItem({
    label: 'Login with',
    iconPath: new ThemeIcon('shield'),
    children: [
      // That space before the label improves readability (that the icon reduces, but they look cool!)
      new TreeItem({
        label: ' OAuth -> Open in browser',
        command: 'githubRepoMgr.commands.auth.openOAuthWebPage',
        iconPath: new ThemeIcon('globe')
      }),
      new TreeItem({
        label: ' OAuth -> Copy link to clipboard',
        command: 'githubRepoMgr.commands.auth.copyOAuthLinkToClipboard',
        iconPath: new ThemeIcon('link')
      }),

      //TODO: Add setting to enable this (default disabled)
      (user.status === user.Status.awaitingOAuth) && new TreeItem({
        label: ` Awaiting OAuth on port ${oauthPort}. Click to cancel`,
        command: 'githubRepoMgr.commands.auth.closeOauthServer',
        iconPath: new ThemeIcon('kebab-horizontal')
      }),
      new TreeItem({
        label: ' Personal access token',
        command: 'githubRepoMgr.commands.auth.enterToken',
        iconPath: new ThemeIcon('key')
      }),
    ]
  });
}