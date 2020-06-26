// Thanks to Settings-Sync extension where I learned how they made the OAuth authorization
// (and to many other extensions where I learned lots of stuff to get this one done)
// Settings-Sync however exposes publicly the GitHub OAuth App clientId and clientSecret in the code.
// I decided to use Vercel, which handles the communication with GitHub api.

import vscode, { window } from "vscode";
import express from 'express';
import { initOctokit } from './octokit';
import { configs } from '../main/configs';
import { user } from '../User/User';
import { Server } from 'http';


export const callbackPagePath = '/oauthHtml';


let expressApp: express.Express;
let server: Server | null = null;
export let oauthPort = 0;



export function activateOAuth() {
  expressApp = express();

  // Get the callback from the server. It always receives a token, as errors are displayed in Vercel web page.
  expressApp.get('/', (req, res) => {
    initOctokit((req.query as any).token); // Will also set user.Status as logged.
    res.redirect(`http://localhost:${oauthPort}${callbackPagePath}`);
    closeOAuthServer();
  });

  // This may be removed after 15 jun. Just a "migration".
  expressApp.get('/oauthCallback', (req, res) => res.redirect(`/?token=${req.query.token}`));

  // Just to remove the URI with the token. This is a success page.
  expressApp.get(callbackPagePath, (req, res) => res.send(callbackHtmlPage));
}



function getOauthUri(port: number) {
  return `https://micro-github.srbrahma.now.sh/api/login?redirectPort=${port}`;
  // return `https://micro-github-5p0tv7hvx.now.sh/api/login?redirectPort=${port}`; // Dev
}



/**
 * Also starts the server.
 */
export async function openOAuthWebPage() {
  try {
    oauthPort = await openServer();
    user.setStatus(user.Status.awaitingOAuth);
    await vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(getOauthUri(oauthPort)));
  }
  catch (err) {
    window.showErrorMessage(err.message);
  }
}



/**
 * Also starts the server.
 */
export async function copyOAuthLinkToClipboard() {
  try {
    oauthPort = await openServer();
    user.setStatus(user.Status.awaitingOAuth);
    vscode.env.clipboard.writeText(getOauthUri(oauthPort));
    window.showInformationMessage('Link copied to clipboard! Access it on a browser!');
  }
  catch (err) {
    window.showErrorMessage(err.message);
  }
}



/**
 * Returns the server port.
 */
async function openServer(): Promise<number> {
  if (server) // Server already running
    return oauthPort;

  try {
    let portToBeUsed = configs.oauthPort;

    if (portToBeUsed < 0 || portToBeUsed > 65535 || !Number.isInteger(portToBeUsed)) // If invalid settings.
      portToBeUsed = 0; // 0 means express will generate a random port.

    server = await asyncListen(portToBeUsed); // As we may have generated a random port.
    return (server as any).address().port; // .port wasn't appearing under address().
  }

  catch (err) {
    throw new Error(`Error opening the OAuth callback server. Maybe is a port problem, you should try changing it in the settings. Details: [${err.message}]`);
  }
}



/**
 * https://github.com/nodejs/node/issues/21482#issuecomment-626025579
 */
function asyncListen(port?: number): Promise<Server> {
  return new Promise((resolve, reject) => {
    const listener = expressApp.listen(port);
    listener
      .once('listening', () => resolve(listener))
      .once('error', reject);
  });
}



export function closeOAuthServer() {
  if (server) {
    server.close();
    server = null;
  }
}



const callbackHtmlPage = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Auth Success!</title>
  </head>

  <body>
    <div>
      <h2>GitHub Repository Manager</h2>
      <h1>Authorization Succeeded!</h1>
      <h3>You can close this page.</h3>
    </div>

    <style>
      html,
      body {
        background-color: #e6dcdc;
        color: #495c6b;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 95%;
      }
      div {
        display: flex;
        flex-direction: column;
        text-align: center;
      }
    </style>
  </body>
</html>
`;

