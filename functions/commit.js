import { getOctokit } from "@actions/github";
import moment from "moment";
import fs from "fs";

export async function getAllCommit(
  owner,
  repo,
  github_api_key,
  discord_webhook_url,
  telegram_chat_id,
  telegram_bot_token
) {
  const octokit = new getOctokit(github_api_key);

  const { data: commit_list } = await octokit.rest.repos.listCommits({
    owner,
    repo,
    since: moment().subtract(7, "d").toISOString(),
    per_page: 1000,
  });

  fs.writeFile(`commit_list.json`, JSON.stringify(commit_list), (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Saved!!");
    }
  });

  if (discord_webhook_url) {
    console.log("Discord web hook url = ", discord_webhook_url);
  }

  if (telegram_bot_token && telegram_chat_id) {
    console.log("Telegram = ", telegram_bot_token, telegram_chat_id);
  }
}
