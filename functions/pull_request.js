import { getOctokit } from "@actions/github";
import moment from "moment";
import axios from "axios";
import fs from "fs";

export async function allPullRequests(
  owner,
  repo,
  github_api_key,
  discord_webhook_url,
  telegram_chat_id,
  telegram_bot_token
) {
  const octokit = new getOctokit(github_api_key);

  let { data: pull_requests } = await octokit.rest.pulls.list({
    owner,
    repo,
  });

  fs.writeFile("pull_request.json", JSON.stringify(pull_requests), (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Saved!!");
    }
  });

  for (const pull_request of pull_requests) {
    if (pull_request?.user.login.toLowerCase().includes("dependabot[bot]")) {
      continue;
    }

    if (pull_request?.title.toLowerCase().includes("wip")) {
      continue;
    }

    const sendMessage = [];
    sendMessage.push(`⏰⏰ Pull request daily remainder`);
    sendMessage.push(`Project - #${pull_request?.base?.repo?.name}`);

    sendMessage.push(`Title - ${pull_request?.title}`);
    sendMessage.push("");

    sendMessage.push(`Author - ${pull_request?.user?.login}`);

    sendMessage.push(
      `Created at - ${moment(pull_request?.created_at).format(
        "MMMM Do YYYY, h:mm:ss a"
      )}`
    );

    sendMessage.push(
      `Updated at - ${moment(pull_request?.updated_at).format(
        "MMMM Do YYYY, h:mm:ss a"
      )}`
    );

    sendMessage.push("");

    sendMessage.push(`Link - ${pull_request?.html_url}`);

    sendMessage.push("");

    let reviewers = "Reviewers - ";

    for (const reviewer of pull_request.requested_reviewers) {
      reviewers += "#" + reviewer?.login + ", ";
    }

    sendMessage.push(reviewers);

    // Send message to discord
    if (discord_webhook_url) {
      const discordText = sendMessage.join("\n");
      axios.post(
        discord_webhook_url,
        {
          username: "Neeraj",
          content: discordText,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Send message to telegram
    if (telegram_bot_token && telegram_chat_id) {
      const telegramText = sendMessage.join("\n");
      const telegramApiUrl = `https://api.telegram.org/bot${telegram_bot_token}/sendMessage?chat_id=${telegram_chat_id}&text=${encodeURIComponent(
        telegramText
      )}`;

      axios.get(telegramApiUrl);
    }
  }
}

export async function getPullRequest(
  owner,
  repo,
  github_api_key,
  discord_webhook_url,
  pull_number,
  telegram_chat_id,
  telegram_bot_token
) {
  const octokit = new getOctokit(github_api_key);

  let { data: pull_request } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number,
  });

  fs.writeFile(
    `pull_request_${pull_number}.json`,
    JSON.stringify(pull_request),
    (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Saved!!");
      }
    }
  );

  if (telegram_bot_token && telegram_chat_id) {
    console.log(telegram_bot_token, telegram_chat_id);
  }
}
