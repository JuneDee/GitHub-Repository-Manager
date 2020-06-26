// It took me a long time to get into this simple solution. You may know how by reading previous
// versions of this file.
//
// Took me a more than a day to find how to input the password into the 'git clone'.
// We can't wait for the password request just using stdout or stderr, as after hours
// of search and failed tries, looks like git credentials request text isn't outputted
// to those pipes, but are written directly to the tty. Or something like that.
// https://stackoverflow.com/a/9788213/10247962 (but pty.js doesn't build in recent node versions)
// So there is the node-pty lib.

// TODO: after some time being stable, clean this code.

import { Repository } from "../../Repository/Repository";
import { spawn, spawnSync } from 'child_process';
import { token } from "../octokit";
import { user } from '../../User/User';
import fs from 'fs';

import path from 'path';


/**
 * @export
 * @param {Repository} repo
 * @param {string} cwd The path which will contain the new repository directory. If adding
 * only metadata ('git clone -n'), you should pass the project path.
 * @param {boolean} [ceckout=true] Set to false to only get the repository "metadata", without the contents.
 */
export async function cloneRepo(repo: Repository, cwd: string, checkout = true) {
  return new Promise((resolve, reject) => {

    try {

      // By using this url, we are sure that the user will be the one we entered, as
      // another user could be already credentialized. I haven't found a way to temporarilly
      // or locally forget the current credentials.

      // const tempDir = path.resolve('.git', '.tempGitHubRepositoryManager');
      // const tempPath = path.resolve(cwd, '.git', '.tempGitHubRepositoryManager');

      // const args = ['clone', `https://github.com/${repo.ownerLogin}/${repo.name}.git`];

      // // https://git-scm.com/docs/git-clone#Documentation/git-clone.txt--n
      // if (!checkout) {
      //   args.splice(1, 0, '-n');
      //   args.push(tempDir);
      //   if (fs.existsSync(tempPath))
      //     fs.rmdirSync(tempPath, { recursive: true });
      // }

      // const child = spawn('git', args, {
      //   cwd,
      // });


      // child.stdin.
      //   child.stderr.on('data', (data) => {
      //     console.log('stderr data' + data);
      //   });

      // child.stdout.on('data', (data) =>
      //   console.log('stdout data' + data));


      // child.on('exit', (code, signal) => {
      //   console.log('exited', code, signal);
      //   resolve();
      // });


      //   child.onData(e => {
      //     // We look for the string "Password for 'https://${username}@github.com':"
      //     // As I don't know it may have language diffs, we search for the last part that may be universal:
      //     if (e.includes("@github.com':")) {
      //       child.write(`${token}\r\n`);
      //     }
      //     // fatal errors have the "fatal: " on the start of the error.
      //     if (e.includes('fatal: '))
      //       throw new Error(e);
      //   });

      // child.onExit(async ({ exitCode, signal }) => {
      //   console.log(exitCode, signal);
      //   await exec(`git remote set-url origin ${repo.urlDotGit}`);
      // });

      // Just to make it prettier and more user friendly, using the usual remote url.
    }

    catch (err) {
      throw new Error(err);
    }
  }); // End of Promise
}









// Old. May fallback to this if our current system have problems.

//   if (fs.existsSync(repoPath))
//     throw new Error(`There is already a directory named ${repo.name} in ${parentPath}!`);

//   try {
//     await exec(`git init ${repo.name}`,
//       { cwd: parentPath });
//     // TODO: add -q ?
//     await exec(`git remote add origin https://github.com/${repo.ownerLogin}/${repo.name}.git`,
//       { cwd: repoPath });
//     await exec(`git pull https://${token}@github.com/${repo.ownerLogin}/${repo.name}.git master`,
//       { cwd: repoPath });

//     // I didn't find a way to automatically set the push destination.
//     // The usual way is by doing "git push -u origin master", however, it requires the user being
//     // logged, which isn't always true (and we actually didn't in previous steps)

//     fs.appendFileSync(path.resolve(repoPath, '.git', 'config'),
//       `[branch "master"]
// \tremote = origin
// \tmerge = refs/heads/master`);

//   }
//   catch (err) {
//     // This will happen if the repository never had a push. As we know it really exists, isn't a problem at all.
//     if ((err.message as string).includes("couldn't find remote ref master"))
//       return;

//     // Removes the repo dir if error. For some reason rimraf needs this empty callback.
//     rimraf(repoPath, () => { });

//     // Removes the token from the error message
//     const censoredMsg = (err.message as string).replace(token, '[tokenHidden]');
//     throw new Error(censoredMsg);
//   }
// }






