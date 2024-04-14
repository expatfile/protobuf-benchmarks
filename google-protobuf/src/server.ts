import { Server, ServerCredentials, handleUnaryCall } from "@grpc/grpc-js";
import { TestServiceService } from "./proto/test_grpc_pb";
import {
  Input,
  TestServiceReadInputsRequest,
  TestServiceReadInputsResponse,
  TestServiceUpdateInputsRequest,
  TestServiceUpdateInputsResponse,
} from "./proto/test_pb";
import { faker } from "@faker-js/faker";
import { MOCK_INPUT_SOURCES, MOCK_INPUT_TYPES, SERVICE_IP } from "./constants";

const readInputs: handleUnaryCall<
  TestServiceReadInputsRequest,
  TestServiceReadInputsResponse
> = (call, callback) => {
  const {
    // userId,
    // taxYear,
    // formName,
    inputNamesList: inputNames,
  } = call.request.toObject();

  const response = new TestServiceReadInputsResponse();

  const inputs: Input[] = [];

  inputNames.forEach((inputName) => {
    const input = new Input();

    input.setInputName(inputName);
    input.setValue(faker.lorem.word());
    input.setType(faker.helpers.arrayElement(MOCK_INPUT_TYPES));
    input.setSource(faker.helpers.arrayElement(MOCK_INPUT_SOURCES));

    inputs.push(input);
  });

  response.setInputsList(inputs);

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
    inputsList: inputs,
  } = call.request.toObject();

  inputs.forEach(() => {});

  const response = new TestServiceUpdateInputsResponse();

  callback(null, response);
};

export function startServer(port: number) {
  const address = `${SERVICE_IP}:${port}`;

  const serverCredentials = ServerCredentials.createInsecure();
  const server = new Server();

  server.addService(TestServiceService, {
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
