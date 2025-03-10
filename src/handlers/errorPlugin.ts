import {
    FastifyInstance,
    FastifyError,
    FastifyReply,
    FastifyRequest,
  } from 'fastify';
import { ERROR_CODES } from 'src/errors/errors.js';
  
  export function errorPlugin(
    fastify: FastifyInstance,
    options: any,
    done: () => void
  ) {
    fastify.setErrorHandler(
      (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
        if (error.code === ERROR_CODES.BAD_REQUEST) {
          return reply.code(400).send({ error: error.message, code: error.code });
        }
  
        if (error.code === ERROR_CODES.COULD_NOT_CREATE) {
          return reply.code(422).send({ error: error.message, code: error.code });
        }
  
        if (error.code === ERROR_CODES.INTERNAL_SERVER_ERROR) {
          return reply.code(500).send({ error: error.message, code: error.code });
        }
  
        if (error.code === ERROR_CODES.COULD_NOT_UPDATE) {
          return reply.code(422).send({ error: error.message, code: error.code });
        }
  
        console.error(error);
        return reply.code(500).send({ error: error.message, code: error.code });
      }
    );
  
    done();
  }
  