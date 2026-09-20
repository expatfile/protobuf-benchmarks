import assert from "node:assert/strict";
import { Server, ServerCredentials } from "@grpc/grpc-js";
import { createClient, readInputsCall, updateInputsCall } from "./client";
import {
  MOCK_FORM_NAMES,
  MOCK_INPUT_NAMES,
  MOCK_INPUT_SOURCES,
  MOCK_INPUT_TYPES,
  SERVICE_IP,
} from "./constants";
import {
  TestServiceReadInputsResponse,
  TestServiceUpdateInputsRequest,
} from "./proto/test";
import { testServiceDefinition } from "./proto/test.grpc-server";
import { startServer } from "./server";

// Starts a server on the benchmark's own service definition whose updateInputs
// handler hands the decoded request to the caller instead of discarding it.
function startRecordingServer(
  port: number,
  onUpdateInputs: (request: TestServiceUpdateInputsRequest) => void
) {
  const server = new Server();

  server.addService(testServiceDefinition, {
    updateInputs: (call: any, callback: any) => {
      onUpdateInputs(call.request);
      callback(null, {});
    },
  });

  return new Promise<Server>((resolve, reject) => {
    server.bindAsync(
      `${SERVICE_IP}:${port}`,
      ServerCredentials.createInsecure(),
      (error) => (error ? reject(error) : resolve(server))
    );
  });
}

// `throws: true` catches a call that fails, not one that succeeds and carries
// nothing. So before anything is timed, push the benchmark's own payloads through
// the benchmark's own client and check the data arrives on the other side.
// Keep the checks identical across every benchmark directory.
export async function verifyRoundTrip(port: number) {
  let server = await startServer(port);
  let client = createClient(port);

  const response = (await readInputsCall(
    client
  )) as TestServiceReadInputsResponse;
  const read = response.inputs;

  assert.deepEqual(
    read.map((input) => input.inputName),
    MOCK_INPUT_NAMES
  );
  read.forEach((input) => {
    assert.ok(input.value.length > 0);
    assert.ok(MOCK_INPUT_TYPES.includes(input.type));
    assert.ok(MOCK_INPUT_SOURCES.includes(input.source));
  });

  client.close();
  server.forceShutdown();

  let received: TestServiceUpdateInputsRequest | undefined;

  server = await startRecordingServer(port, (request) => {
    received = request;
  });
  client = createClient(port);

  await updateInputsCall(client);

  assert.ok(received);
  const { userId, taxYear, formName, inputs: updated } = received;

  assert.equal(userId.length, 36);
  assert.equal(taxYear.length, 4);
  assert.ok(MOCK_FORM_NAMES.includes(formName));
  assert.equal(updated.length, 32);
  updated.forEach((input) => {
    assert.ok(MOCK_INPUT_NAMES.includes(input.inputName));
    assert.ok(input.value.length > 0);
    assert.ok(MOCK_INPUT_TYPES.includes(input.type));
    assert.ok(MOCK_INPUT_SOURCES.includes(input.source));
  });

  client.close();
  server.forceShutdown();

  console.log(
    `Round trip verified: ${read.length} inputs read, ${updated.length} inputs updated`
  );
}
