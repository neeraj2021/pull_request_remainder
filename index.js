import core from "@actions/core";
import { debugFun } from "./debug_testing/debug.js";

async function run() {
  try {
    await debugFun();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
