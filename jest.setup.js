jest.mock('./db', () => {
    return {
      query: jest.fn(),
      end: jest.fn().mockImplementation((callback) => {
        if (callback) callback();
      }),
    };
  });
  