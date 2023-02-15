const getLatestTag = require("./getLatestTag");

test("wait 500 ms", async () => {
  const start = new Date();
  await getLatestTag();
  const end = new Date();
  var delta = Math.abs(end - start);
  expect(delta).toBeGreaterThanOrEqual(500);
});
