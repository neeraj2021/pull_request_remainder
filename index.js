const core = require("@actions/core");
const github = require("@actions/github");
const axios = require("axios");
const moment = require("moment");

async function run() {
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

    const octokit = new github.getOctokit(github_api_key);

    let { data: pull_requests } = await octokit.rest.pulls.list({
      owner,
      repo,
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
      const telegramText = sendMessage.join("\n");
      const telegramApiUrl = `https://api.telegram.org/bot${telegram_bot_token}/sendMessage?chat_id=${telegram_chat_id}&text=${encodeURIComponent(
        telegramText
      )}`;

      axios.get(telegramApiUrl);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
