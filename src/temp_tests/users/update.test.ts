import 'tests/setup';
import server from '../../server';
import User from '../../models/User';

describe('UPDATE action', () => {
  describe('when the user is found', () => {
    describe('and updating the name only', () => {
      const input = { name: 'John Doe' };

      it('is successful', async () => {
        const user = await createUser();

        const response = await makeRequest(user.id, input);

        expect(response.statusCode).toBe(200);
      });

      it('does NOT create a new record', async () => {
        const user = await createUser();

        await assertCount(user, input, { changedBy: 0 });
      });

      it('returns the updated user', async () => {
        const user = await createUser();

        const response = await makeRequest(user.id, input);

        const jsonResponse = response.json<User>();
        expect(jsonResponse).toEqual(
          expect.objectContaining({
            id: user.id,
            name: input.name,
            email: user.email,
          })
        );
      });
    });

    describe('and updating the email only', () => {
      const input = { email: 'jonh.doe@email.com' };

      it('is successful', async () => {
        const user = await createUser();

        const response = await makeRequest(user.id, input);

        expect(response.statusCode).toBe(200);
      });

      it('does NOT create a new record', async () => {
        const user = await createUser();

        await assertCount(user, input, { changedBy: 0 });
      });

      it('returns the updated user', async () => {
        const user = await createUser();

        const response = await makeRequest(user.id, input);

        const jsonResponse = response.json<User>();
        expect(jsonResponse).toEqual(
          expect.objectContaining({
            id: user.id,
            name: user.name,
            email: input.email,
          })
        );
      });
    });
  });

  describe('when the user is NOT found', () => {
    it('is not found', async () => {
      const response = await makeRequest(1, { email: 'jack.doe@email.com' });

      expect(response.statusCode).toBe(404);
    });

    it('returns the user data', async () => {
      const response = await makeRequest(1, { email: 'jack.doe@email.com' });

      const json_response = response.json<{ error: string }>();
      expect(json_response).toEqual({
        error: 'User not found',
      });
    });
  });

  const makeRequest = async (id: number, input: Partial<User>) =>
    server.inject({
      method: 'PATCH',
      url: `/users/${id}`,
      body: input,
    });

  const countRecords = async (input: Partial<User>) =>
    User.query().where(input).resultSize();

  const assertCount = async (oldUser: User, input: Partial<User>, { changedBy }: { changedBy: number }) => {
    const initialCount = await countRecords({});
    expect(initialCount).toBeGreaterThan(0);

    await makeRequest(oldUser.id, input);

    const finalCount = await countRecords({});

    expect(finalCount).toBe(initialCount + changedBy);
  };

  const createUser = async () =>
    await User.query().insert({ name: 'Jane Doe', email: 'jane.doe@email.com' });
});
