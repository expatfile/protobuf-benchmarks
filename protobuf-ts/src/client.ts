import { Metadata, credentials } from "@grpc/grpc-js";

import { faker } from "@faker-js/faker";
import {
  MOCK_FORM_NAMES,
  MOCK_INPUT_NAMES,
  MOCK_INPUT_SOURCES,
  MOCK_INPUT_TYPES,
  SERVICE_IP,
} from "./constants";
import { TestServiceClient } from "./proto/test.grpc-client";
import {
  TestServiceReadInputsRequest,
  TestServiceUpdateInputsRequest,
} from "./proto/test";

export const readInputsCall = (client: TestServiceClient) => {
  const request: TestServiceReadInputsRequest = {
    userId: faker.string.uuid(),
    taxYear: faker.number.int({ min: 2018, max: 2023 }).toString(),
    formName: faker.helpers.arrayElement(MOCK_FORM_NAMES),
    inputNames: MOCK_INPUT_NAMES,
  };

  const metadata = new Metadata();

  return new Promise((resolve, reject) => {
    client.readInputs(request, metadata, (err, response) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(response);
    });
  });
};

export const updateInputsCall = (client: TestServiceClient) => {
  const request: TestServiceUpdateInputsRequest = {
    userId: faker.string.uuid(),
    taxYear: faker.number.int({ min: 2018, max: 2023 }).toString(),
    formName: faker.helpers.arrayElement(MOCK_FORM_NAMES),
    inputs: Array.from({ length: 32 }, () => ({
      inputName: faker.helpers.arrayElement(MOCK_INPUT_NAMES),
      value: faker.lorem.word(),
      type: faker.helpers.arrayElement(MOCK_INPUT_TYPES),
      source: faker.helpers.arrayElement(MOCK_INPUT_SOURCES),
    })),
  };

  const metadata = new Metadata();

  return new Promise((resolve, reject) => {
    client.updateInputs(request, metadata, (err, response) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(response);
    });
  });
};

export function createClient(port: number) {
  const address = `${SERVICE_IP}:${port}`;

  const clientCredentials = credentials.createInsecure();
  const client = new TestServiceClient(address, clientCredentials);

  return client;
}
