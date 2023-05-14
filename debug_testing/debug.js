import core from "@actions/core";
import { allPullRequests, getPullRequest } from "../functions/pull_request.js";
import { getAllCommit } from "../functions/commit.js";

export async function debugFun() {
  try {
    const owner = "FieldAssist";
    const repo = "fa_nuxtjs_dms_client";
    const github_api_key = "------------------------------";
    const discord_webhook_url =
      "https://discord.com/api/webhooks/1104692069383028777/6oibP5FzHH6w7qYgXyXuWtOWrUW_W4F0lOIJdxd98iYr9uSz6O2JOtB_y-X6uS8B5M4q";

    await allPullRequests(owner, repo, github_api_key, discord_webhook_url);

    await getPullRequest(owner, repo, github_api_key, discord_webhook_url, 358);

    await getAllCommit(owner, repo, github_api_key, discord_webhook_url);
  } catch (error) {
    core.setFailed(error.message);
  }
}
