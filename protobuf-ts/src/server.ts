import { Server, ServerCredentials, handleUnaryCall } from "@grpc/grpc-js";

import { faker } from "@faker-js/faker";
import { MOCK_INPUT_SOURCES, MOCK_INPUT_TYPES, SERVICE_IP } from "./constants";
import {
  Input,
  TestServiceReadInputsRequest,
  TestServiceReadInputsResponse,
  TestServiceUpdateInputsRequest,
  TestServiceUpdateInputsResponse,
} from "./proto/test";
import { testServiceDefinition } from "./proto/test.grpc-server";

const readInputs: handleUnaryCall<
  TestServiceReadInputsRequest,
  TestServiceReadInputsResponse
> = (call, callback) => {
  const {
    // userId,
    // taxYear,
    // formName,
    inputNames,
  } = call.request;

  const inputs: Input[] = [];

  inputNames.forEach((inputName) => {
    inputs.push({
      inputName,
      value: faker.lorem.word(),
      type: faker.helpers.arrayElement(MOCK_INPUT_TYPES),
      source: faker.helpers.arrayElement(MOCK_INPUT_SOURCES),
    });
  });

  const response: TestServiceReadInputsResponse = {
    inputs,
  };

  callback(null, response);
};

const updateInputs: handleUnaryCall<
  TestServiceUpdateInputsRequest,
  TestServiceUpdateInputsResponse
> = (call, callback) => {
  const {
    // userId,
    // taxYear,
    // formName,
    inputs,
  } = call.request;

  inputs.forEach(() => {});

  const response: TestServiceUpdateInputsResponse = {};

  callback(null, response);
};

export function startServer(port: number) {
  const address = `${SERVICE_IP}:${port}`;

  const serverCredentials = ServerCredentials.createInsecure();
  const server = new Server();

  server.addService(testServiceDefinition, {
    readInputs,
    updateInputs,
  });

  return new Promise<Server>((resolve, reject) => {
    server.bindAsync(address, serverCredentials, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(server);
    });
  });
}
