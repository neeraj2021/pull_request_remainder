const core = require("@actions/core");
const github = require("@actions/github");
const axios = require("axios");

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

    const pull_request_obj = {};

    for (const pull_request of pull_requests) {
      if (pull_request?.user.login.toLowerCase().includes("dependabot[bot]")) {
        continue;
      }

      if (pull_request?.title.toLowerCase().includes("wip")) {
        continue;
      }

      const author = pull_request?.user?.login;
      let reviewers = "Reviewers - ";

      for (const reviewer of pull_request.requested_reviewers) {
        reviewers += reviewer?.login + ", ";
      }

      if (pull_request_obj[author]) {
        pull_request_obj[author].push(
          pull_request?.html_url + " ( " + reviewers + ")"
        );
      } else {
        pull_request_obj[author] = [
          pull_request?.html_url + " ( " + reviewers + ")",
        ];
      }
    }

    const sendMessage = [];
    sendMessage.push(`⏰⏰ Pull request daily reminder`);
    sendMessage.push(repo);

    for (const item in pull_request_obj) {
      sendMessage.push("Author - " + item);
      sendMessage.push(...pull_request_obj[item]);
      sendMessage.push("");
    }

    // Send message to discord
    if (discord_webhook_url) {
      const discordText = sendMessage.join("\n");
      axios.post(
        discord_webhook_url,
        {
          username: "Iris",
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
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
