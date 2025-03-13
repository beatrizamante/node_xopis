import 'tests/setup';
import server from '../../../src/server';
import User from '../../../src/models/User';
import { LightMyRequestResponse } from 'fastify';

describe('CREATE action', () => {
  describe('when the input is valid', () => {
    const input = { name: 'John Doe', email: 'john.doe@email.com' };

    it('is successful', async () => {
      const response = await makeRequest(input);

      expect(response.statusCode).toBe(201);
    });

    it('creates a new record', async () => {
      await assertCount(input, { changedBy: 1 });
    });

    it('returns the created user', async () => {
      const response = await makeRequest(input);

      const jsonResponse = response.json<User>();
      expect(jsonResponse).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: input.name,
          email: input.email,
        })
      );
    });
  });

  describe('when the name is missing', () => {
    const input = { email: 'john.doe@email.com' };

    it('does not create a new record', async () => {
      await assertCount(input, { changedBy: 0 });
    });

    it('returns a bad request response', async () => {
      const response = await makeRequest(input);

      await assertBadRequest(response, /must have required property 'name'/);
    });
  });

  describe('when the email is missing', () => {
    const input = { name: 'John Doe' };

    it('does not create a new record', async () => {
      await assertCount(input, { changedBy: 0 });
    });

    it('returns a bad request response', async () => {
      const response = await makeRequest(input);

      await assertBadRequest(response, /must have required property 'email'/);
    });
  });

  describe('when the email is invalid', () => {
    const input = { name: 'John Doe', email: 'invalid-email' };

    it('does not create a new record', async () => {
      await assertCount(input, { changedBy: 0 });
    });

    it('returns a bad request response', async () => {
      const response = await makeRequest(input);
      await assertBadRequest(response, /must match format "email"/);
    });
  });

  describe('when the email is already taken', () => {
    const input = {
      name: 'John Doe', email: 'user@email.com'
    };

    beforeEach(async () => {
      const response = await makeRequest({ ...input, name: 'Jane Doe' });

      expect(response.statusCode).toBe(201);
    });

    it('does not create a new record', async () => {
      await assertCount({ email: input.email }, { changedBy: 0 });
    });

    it('returns a bad request response', async () => {
      await makeRequest(input);

      const response = await makeRequest(input);
      await assertBadRequest(response, /email already taken/);
    });
  });

  const makeRequest = async (input: Partial<User>) =>
    server.inject({
      method: 'POST',
      url: '/users',
      body: input,
    });

  const countRecords = async (input: Partial<User>) =>
    User.query().where(input).resultSize();

  const assertCount = async (input: Partial<User>, { changedBy }: { changedBy: number }) => {
    const initialCount = await countRecords(input);

    await makeRequest(input);

    const finalCount = await countRecords(input);

    expect(finalCount).toBe(initialCount + changedBy);
  };

  const assertBadRequest = async (response: LightMyRequestResponse, message: RegExp | string) => {
    const json_response = response.json<{ message: string }>();
    expect(response.statusCode).toBe(400);
    expect(json_response.message).toMatch(message);
  };
});
