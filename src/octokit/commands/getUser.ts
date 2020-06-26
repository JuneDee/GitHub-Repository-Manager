import { getOctokitErrorMessage } from "./aux";
import { octokit } from "../octokit";
import { UserInterface } from "../../User/User";

export async function getUser(): Promise<UserInterface> {
  try {
    const userData = (await octokit.graphql(
      `query getUser {
        viewer {
          login
          url
        }
      }`) as any).viewer;

    return {
      login: userData.login,
      profileUri: userData.url
    };
  }
  // Octokit has a pattern for errors, which we display properly at octokitErrorDisplay().
  catch (err) {
    throw new Error(getOctokitErrorMessage(err));
  }
}