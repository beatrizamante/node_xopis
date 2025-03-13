import 'tests/setup';
import server from '../../../src/server';
import User from '../../../src/models/User';

describe('DELETE action', () => {
  describe('when the user is found', () => {
    it('is successful', async () => {
      const user = await User.query().insert({ name: 'John Doe', email: 'john.doe@email.com' });

      const response = await makeRequest(user.id);

      expect(response.statusCode).toBe(200);
    });

    it('returns the user id', async () => {
      await User.query().insert({ name: 'Jane Doe', email: 'jane.doe@email.com' });
      const user = await User.query().insert({ name: 'John Doe', email: 'john.doe@email.com' });
      await User.query().insert({ name: 'Jack Doe', email: 'jack.doe@email.com' });

      const response = await makeRequest(user.id);

      const json_response = response.json<number>();
      expect(json_response).toEqual(user.id);
    });
  });

  describe('when the user is NOT found', () => {
    it('is not found', async () => {
      const user = await User.query().insert({ name: 'John Doe', email: 'john.doe@email.com' });

      const response = await makeRequest(user.id + 1);

      expect(response.statusCode).toBe(404);
    });

    it('returns the user data', async () => {
      await User.query().insert({ name: 'Jane Doe', email: 'jane.doe@email.com' });
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
      method: 'DELETE',
      url: `/users/${id}`,
    });
});
