import { create } from "@bufbuild/protobuf";
import { faker } from "@faker-js/faker";
import { Server, ServerCredentials, handleUnaryCall } from "@grpc/grpc-js";
import { MOCK_INPUT_SOURCES, MOCK_INPUT_TYPES, SERVICE_IP } from "./constants";
import { createServiceDefinition } from "./grpc-service-definition";
import {
  Input,
  InputSchema,
  TestService,
  TestServiceReadInputsRequest,
  TestServiceReadInputsResponse,
  TestServiceReadInputsResponseSchema,
  TestServiceUpdateInputsRequest,
  TestServiceUpdateInputsResponse,
  TestServiceUpdateInputsResponseSchema,
} from "./proto/test_pb";

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
    inputs.push(
      create(InputSchema, {
        inputName,
        value: faker.lorem.word(),
        type: faker.helpers.arrayElement(MOCK_INPUT_TYPES),
        source: faker.helpers.arrayElement(MOCK_INPUT_SOURCES),
      })
    );
  });

  const response = create(TestServiceReadInputsResponseSchema, {
    inputs,
  });

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

  const response = create(TestServiceUpdateInputsResponseSchema);

  callback(null, response);
};

export function startServer(port: number) {
  const address = `${SERVICE_IP}:${port}`;

  const serverCredentials = ServerCredentials.createInsecure();
  const server = new Server();

  server.addService(createServiceDefinition(TestService), {
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
