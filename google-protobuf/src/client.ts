import { Metadata, credentials } from "@grpc/grpc-js";
import { TestServiceClient } from "./proto/test_grpc_pb";
import {
  Input,
  TestServiceReadInputsRequest,
  TestServiceUpdateInputsRequest,
} from "./proto/test_pb";
import { faker } from "@faker-js/faker";
import {
  MOCK_FORM_NAMES,
  MOCK_INPUT_NAMES,
  MOCK_INPUT_SOURCES,
  MOCK_INPUT_TYPES,
  SERVICE_IP,
} from "./constants";

export const readInputsCall = (client: TestServiceClient) => {
  const request = new TestServiceReadInputsRequest();

  request.setUserId(faker.string.uuid());
  request.setTaxYear(faker.number.int({ min: 2018, max: 2023 }).toString());
  request.setFormName(faker.helpers.arrayElement(MOCK_FORM_NAMES));

  request.setInputNamesList(MOCK_INPUT_NAMES);

  const metadata = new Metadata();

  return new Promise((resolve, reject) => {
    client.readInputs(request, metadata, (err, response) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(response.toObject());
    });
  });
};

export const updateInputsCall = (client: TestServiceClient) => {
  const request = new TestServiceUpdateInputsRequest();

  request.setUserId(faker.string.uuid());
  request.setTaxYear(faker.number.int({ min: 2018, max: 2023 }).toString());
  request.setFormName(faker.helpers.arrayElement(MOCK_FORM_NAMES));

  request.setInputsList(
    Array.from({ length: 32 }, () => {
      const input = new Input();

      input.setInputName(faker.helpers.arrayElement(MOCK_INPUT_NAMES));
      input.setValue(faker.lorem.word());
      input.setType(faker.helpers.arrayElement(MOCK_INPUT_TYPES));
      input.setSource(faker.helpers.arrayElement(MOCK_INPUT_SOURCES));

      return input;
    })
  );

  const metadata = new Metadata();

  return new Promise((resolve, reject) => {
    client.updateInputs(request, metadata, (err, response) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(response.toObject());
    });
  });
};

export function createClient(port: number) {
  const address = `${SERVICE_IP}:${port}`;

  const clientCredentials = credentials.createInsecure();
  const client = new TestServiceClient(address, clientCredentials);

  return client;
}
