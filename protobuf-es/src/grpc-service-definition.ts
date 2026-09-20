import { DescService, fromBinary, toBinary } from "@bufbuild/protobuf";
import { MethodDefinition, ServiceDefinition } from "@grpc/grpc-js";

// protobuf-es generates no grpc-js stubs, only a service descriptor. This builds
// the grpc-js ServiceDefinition from it, which is what the other directories get
// generated. Buffer.from() copies the bytes, the same copy ts-proto's stubs make.
export function createServiceDefinition(service: DescService) {
  const definition: Record<string, MethodDefinition<any, any>> = {};

  service.methods.forEach((method) => {
    definition[method.localName] = {
      path: `/${service.typeName}/${method.name}`,
      requestStream: false,
      responseStream: false,
      requestSerialize: (value) => Buffer.from(toBinary(method.input, value)),
      requestDeserialize: (bytes) => fromBinary(method.input, bytes),
      responseSerialize: (value) => Buffer.from(toBinary(method.output, value)),
      responseDeserialize: (bytes) => fromBinary(method.output, bytes),
    };
  });

  return definition as ServiceDefinition;
}
