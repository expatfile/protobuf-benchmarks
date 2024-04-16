import { Bench } from "tinybench";
import { startServer } from "./server";
import { createClient, readInputsCall, updateInputsCall } from "./client";
import { TestServiceClient } from "./proto/test.grpc-client";

async function runTestCalls(
  testName: string,
  testFn: (client: TestServiceClient) => Promise<unknown>
) {
  const port = 50051;

  const server = await startServer(port);
  const client = createClient(port);

  const bench = new Bench({
    time: 10000,
  });

  bench.add(testName, async () => {
    await testFn(client);
  });

  await bench.warmup();
  await bench.run();

  console.table(bench.table());
  // console.log(bench.results);

  client.close();
  server.forceShutdown();
}

async function main() {
  await runTestCalls("readInputs", readInputsCall);
  await runTestCalls("updateInputs", updateInputsCall);

  process.exit(0);
}

main();
