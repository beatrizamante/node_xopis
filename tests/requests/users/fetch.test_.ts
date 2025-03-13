import 'tests/setup';
import server from '../../server';
import User from '../User';

describe('FETCH action', () => {
  describe('when the user is found', () => {
    it('is successful', async () => {
      const user = await User.query().insert({ name: 'John Doe', email: 'john.doe@email.com' });

      const response = await makeRequest(user.id);

      expect(response.statusCode).toBe(200);
    });

    it('returns the user data', async () => {
      const user = await User.query().insert({ name: 'John Doe', email: 'john.doe@email.com' });

      const response = await makeRequest(user.id);

      const json_response = response.json<User>();
      expect(json_response).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });
  });

  describe('when the user is NOT found', () => {
    it('is not found', async () => {
      const user = await User.query().insert({ name: 'John Doe', email: 'john.doe@email.com' });

      const response = await makeRequest(user.id + 1);

      expect(response.statusCode).toBe(404);
    });

    it('returns the user data', async () => {
      const user = await User.query().insert({ name: 'John Doe', email: 'john.doe@email.com' });

      const response = await makeRequest(user.id + 1);

      const json_response = response.json<{ error: string }>();
      expect(json_response).toEqual({
        error: 'User not found',
      });
    });
  });

  const makeRequest = async (id: number) =>
    server.inject({
      method: 'GET',
      url: `/users/${id}`,
    });
});
