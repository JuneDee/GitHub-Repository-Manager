// Thanks to Settings-Sync extension where I learned how they made the OAuth authorization
// (and to many other extensions where I learned lots of stuff to get this one done)
// Settings-Sync however exposes publicly the GitHub OAuth App clientId and clientSecret in the code.
// I decided to use Vercel, which handles the communication with GitHub api.

import { callbackPagePath } from '../consts';
import vscode, { window } from "vscode";
import express from 'express';
import { initOctokit } from './octokit';
import { configs } from '../configs';
import { user } from '../User/User';



let expressApp: express.Express | null = null;
export let oauthPort = 0;

function getOauthUri(port: number) {
  // return `https://micro-github.srbrahma.now.sh/api/login?redirectPort=${port}`;
  return `https://micro-github-5p0tv7hvx.now.sh/api/login?redirectPort=${port}`; // Dev
}


/**
 * Also starts the server.
 */
export async function openOAuthWebPage() {
  try {
    oauthPort = await openServer();
    user.status = user.Status.awaitingOAuth;
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
    user.status = user.Status.awaitingOAuth;
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
  if (expressApp) // Server already running
    return;

  try {
    expressApp = express();
    let portToBeUsed = configs.oauthPort;

    if (portToBeUsed < 0 || portToBeUsed > 65535 || !Number.isInteger(portToBeUsed)) // If invalid settings.
      portToBeUsed = 0; // 0 means express will generate a random port.

    const port = await asyncListen(portToBeUsed); // As we may have generated a random port.

    // Handles the callback from the server. It will always receive token, as errors are displayed in Vercel web page.
    expressApp.get('/', (req, res) => {
      const { token } = req.query as { token: string; };
      initOctokit(token);
      res.redirect(`http://localhost:${port}${callbackPagePath}`);
      closeOAuthServer();
    });

    // This may be removed after 15 jun. Just a "migration".
    expressApp.get('/oauthcallback', (req, res) => {
      res.redirect('/');
    });

    // Just to remove the URI with the token. This is a success page.
    expressApp.get(callbackPagePath, (req, res) => res.send(callbackHtmlPage));
    return port;
  }

  catch (err) {
    throw new Error(`Error opening the OAuth callback server. Maybe is a port problem, you should try changing it in the settings. Details: [${err.message}]`);
  }
}



/**
 * Returns the port of the new server
 * https://github.com/nodejs/node/issues/21482#issuecomment-626025579
 */
function asyncListen(port?: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const listener = expressApp.listen(port) as any; // .port wasn't appearing under address().
    listener
      .once('listening', () => resolve(listener.address().port))
      .once('error', reject);
  });
}

export function closeOAuthServer() {
  expressApp.removeAllListeners();
  expressApp = null;
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

