export async function logPagePerformance(page, stepName) {
  const perf = await page.evaluate(() => JSON.stringify(window.performance.timing));
  const metrics = JSON.parse(perf);
  const total = metrics.loadEventEnd - metrics.navigationStart;
  console.log(`⏱️ ${stepName} took ${total} ms`);
}
