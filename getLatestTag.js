const { Octokit } = require("@octokit/rest");
const { cmpTags } = require("tag-cmp");

/**
 * @param {string | null} authToken Authentication token used by the GitHub client
 * @param {string} owner Owner of the repository, e.g. octokit
 * @param {string} repo Name of the repository, e.g. rest.js
 * @param {boolean} releasesOnly Only consider release tags
 * @param {string} prefix  Only consider tags starting with this string
 * @param {RegExp | undefined} regex Only consider tags matching the regex
 * @param {boolean} sortTags
 * @param {string[]} excludes
 *
 * @returns {string} Latest tag
 */
async function getLatestTag(
  authToken,
  owner,
  repo,
  releasesOnly,
  prefix,
  regex,
  sortTags,
  excludes
) {
  const octokit = new Octokit({
    auth: authToken,
  });
  const endpoint = releasesOnly
    ? octokit.repos.listReleases
    : octokit.repos.listTags;
  const pages = endpoint.endpoint.merge({
    owner: owner,
    repo: repo,
    per_page: 100,
  });

  const tags = [];
  for await (const item of getItemsFromPages(octokit, pages)) {
    const tag = releasesOnly ? item["tag_name"] : item["name"];
    if (!tag.startsWith(prefix)) {
      continue;
    }
    if (regex && !new RegExp(regex).test(tag)) {
      continue;
    }
    if (excludes.indexOf(tag) >= 0) {
      continue;
    }
    if (!sortTags) {
      // Assume that the API returns the most recent tag(s) first.
      return tag;
    }
    tags.push(tag);
  }
  if (tags.length === 0) {
    let error = `The repository "${owner}/${repo}" has no `;
    error += releasesOnly ? "releases" : "tags";
    if (prefix) {
      error += ` matching "${prefix}*"`;
    }
    throw error;
  }
  tags.sort(cmpTags);
  const [latestTag] = tags.slice(-1);
  return latestTag;
}

async function* getItemsFromPages(octokit, pages) {
  for await (const page of octokit.paginate.iterator(pages)) {
    for (const item of page.data) {
      yield item;
    }
  }
}

module.exports = getLatestTag;
