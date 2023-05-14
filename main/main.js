import core from "@actions/core";
import { allPullRequests } from "../functions/pull_request.js";
import { getAllCommit } from "../functions/commit.js";

export async function main() {
  try {
    const owner = core.getInput("owner", { required: true });

    const repo = core.getInput("repo", { required: true });

    const github_api_key = core.getInput("github_api_key", { required: true });

    const discord_webhook_url = core.getInput("discord_webhook_url", {
      required: false,
    });

    const telegram_chat_id = core.getInput("telegram_chat_id", {
      required: false,
    });

    const telegram_bot_token = core.getInput("telegram_bot_token", {
      required: telegram_chat_id ? true : false,
    });

    await allPullRequests(
      owner,
      repo,
      github_api_key,
      discord_webhook_url,
      telegram_chat_id,
      telegram_bot_token
    );

    await getAllCommit(
      owner,
      repo,
      github_api_key,
      discord_webhook_url,
      telegram_chat_id,
      telegram_bot_token
    );
  } catch (error) {
    core.setFailed(error.message);
  }
}
