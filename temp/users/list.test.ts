import 'tests/setup';
import server from '../../../src/server';
import User from '../../../src/models/User';

describe('LIST action', () => {
  describe("when there's no users in the database", () => {
    it('returns an empty array', async () => {
      const response = await makeRequest();

      const json_response = response.json<User[]>();
      expect(response.statusCode).toBe(200);
      expect(json_response).toEqual([]);
    });
  });

  describe('when there are users in the database', () => {
    const users = [
      { name: 'John Doe', email: 'john.doe@email.com' },
      { name: 'Jane Doe', email: 'jane.doe@email.com' },
      { name: 'Jack Doe', email: 'jack.doe@email.com' }
    ];

    beforeEach(async () => {
      Promise.all(users.map(async user =>
        User.query().insert(user)
      ));
    });

    it('returns an empty array', async () => {
      const response = await makeRequest();

      const json_response = response.json<User[]>();
      expect(response.statusCode).toBe(200);
      expect(json_response).toEqual(
        expect.arrayContaining(users.map(user =>
          expect.objectContaining({
            ...user,
            id: expect.any(Number)
          })
        ))
      );
    });
  });

  const makeRequest = async () =>
    server.inject({
      method: 'GET',
      url: '/users',
    });
});
