const core = require("@actions/core");
const getLatestTag = require("./getLatestTag");

async function run() {
  try {
    // -- Read Inputs --
    const repository = core.getInput("repository", { required: true });
    const repoParts = repository.split("/");
    if (repoParts.length !== 2) {
      throw `Invalid repository "${repository}" (needs to have one slash, i.e. 'owner/repo')`;
    }
    const [owner, repo] = repoParts;

    const token = core.getInput("token") || null;
    const prefix = core.getInput("prefix") || "";
    const regex = core.getInput("regex") || null;

    const releasesOnly = core.getBooleanInput("releases-only");

    // It's somewhat safe to assume that the most recenly created release is actually latest.
    const sortTagsDefault = releasesOnly ? "false" : "true";
    const sortTags =
      (core.getInput("sort-tags") || sortTagsDefault).toLowerCase() === "true";
    const excludes = (core.getInput("excludes") || "").split(",");

    // -- Perform Task --
    const tag = await getLatestTag(
      token,
      owner,
      repo,
      releasesOnly,
      prefix,
      regex,
      sortTags,
      excludes
    );

    // -- Write Outputs --
    core.setOutput("tag", tag);
  } catch (error) {
    core.setFailed(error);
  }
}

run();
