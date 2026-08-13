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

  // Keep these options identical across every benchmark directory —
  // the cross-library comparison is only meaningful if the ruler is the same.
  const bench = new Bench({
    time: 10000,
    warmup: true,
    warmupTime: 1000,
    throws: true, // a silently failing RPC would otherwise report a great score
  });

  bench.add(testName, async () => {
    await testFn(client);
  });

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
