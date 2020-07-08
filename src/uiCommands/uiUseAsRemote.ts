import vscode, { window } from "vscode";
import { Repository } from "../Repository/Repository";
import { cloneRepo } from "../octokit/commands/cloneRepo";


// export async function uiUseAsRemote(repo: Repository) {

//   if (!vscode.workspace.workspaceFolders) {
//     window.showWarningMessage("Can't select a workspace folder, as there are no opened folders in the workspace.");
//     return;
//   }



//   const folder = await window.showWorkspaceFolderPick();

//   try {
//     cloneRepo(repo, folder.uri.fsPath);
//   }

//   catch (err) {
//     window.showErrorMessage(err.message);
//   }
// }


