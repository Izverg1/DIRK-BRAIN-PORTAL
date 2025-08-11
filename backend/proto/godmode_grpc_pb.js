// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var proto_godmode_pb = require('../proto/godmode_pb.js');

function serialize_godmode_DecomposeTaskRequest(arg) {
  if (!(arg instanceof proto_godmode_pb.DecomposeTaskRequest)) {
    throw new Error('Expected argument of type godmode.DecomposeTaskRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_godmode_DecomposeTaskRequest(buffer_arg) {
  return proto_godmode_pb.DecomposeTaskRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_godmode_DecomposeTaskResponse(arg) {
  if (!(arg instanceof proto_godmode_pb.DecomposeTaskResponse)) {
    throw new Error('Expected argument of type godmode.DecomposeTaskResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_godmode_DecomposeTaskResponse(buffer_arg) {
  return proto_godmode_pb.DecomposeTaskResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var GodModeServiceService = exports.GodModeServiceService = {
  decomposeTask: {
    path: '/godmode.GodModeService/DecomposeTask',
    requestStream: false,
    responseStream: false,
    requestType: proto_godmode_pb.DecomposeTaskRequest,
    responseType: proto_godmode_pb.DecomposeTaskResponse,
    requestSerialize: serialize_godmode_DecomposeTaskRequest,
    requestDeserialize: deserialize_godmode_DecomposeTaskRequest,
    responseSerialize: serialize_godmode_DecomposeTaskResponse,
    responseDeserialize: deserialize_godmode_DecomposeTaskResponse,
  },
};

exports.GodModeServiceClient = grpc.makeGenericClientConstructor(GodModeServiceService, 'GodModeService');
