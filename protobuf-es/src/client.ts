import { create } from "@bufbuild/protobuf";
import { faker } from "@faker-js/faker";
import {
  Client,
  Metadata,
  ServiceError,
  credentials,
  makeGenericClientConstructor,
} from "@grpc/grpc-js";
import {
  MOCK_FORM_NAMES,
  MOCK_INPUT_NAMES,
  MOCK_INPUT_SOURCES,
  MOCK_INPUT_TYPES,
  SERVICE_IP,
} from "./constants";
import { createServiceDefinition } from "./grpc-service-definition";
import {
  TestService,
  TestServiceReadInputsRequest,
  TestServiceReadInputsRequestSchema,
  TestServiceReadInputsResponse,
  TestServiceUpdateInputsRequest,
  TestServiceUpdateInputsRequestSchema,
  TestServiceUpdateInputsResponse,
} from "./proto/test_pb";

type UnaryCallback<Response> = (
  err: ServiceError | null,
  response: Response
) => void;

// The typed client the other directories get from their code generator.
export interface TestServiceClient extends Client {
  readInputs(
    request: TestServiceReadInputsRequest,
    metadata: Metadata,
    callback: UnaryCallback<TestServiceReadInputsResponse>
  ): void;
  updateInputs(
    request: TestServiceUpdateInputsRequest,
    metadata: Metadata,
    callback: UnaryCallback<TestServiceUpdateInputsResponse>
  ): void;
}

const TestServiceClient = makeGenericClientConstructor(
  createServiceDefinition(TestService),
  TestService.typeName
) as unknown as new (
  ...args: ConstructorParameters<typeof Client>
) => TestServiceClient;

export const readInputsCall = (client: TestServiceClient) => {
  const request = create(TestServiceReadInputsRequestSchema, {
    userId: faker.string.uuid(),
    taxYear: faker.number.int({ min: 2018, max: 2023 }).toString(),
    formName: faker.helpers.arrayElement(MOCK_FORM_NAMES),
    inputNames: MOCK_INPUT_NAMES,
  });

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
  const request = create(TestServiceUpdateInputsRequestSchema, {
    userId: faker.string.uuid(),
    taxYear: faker.number.int({ min: 2018, max: 2023 }).toString(),
    formName: faker.helpers.arrayElement(MOCK_FORM_NAMES),
    inputs: Array.from({ length: 32 }, () => ({
      inputName: faker.helpers.arrayElement(MOCK_INPUT_NAMES),
      value: faker.lorem.word(),
      type: faker.helpers.arrayElement(MOCK_INPUT_TYPES),
      source: faker.helpers.arrayElement(MOCK_INPUT_SOURCES),
    })),
  });

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
