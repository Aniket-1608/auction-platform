jest.mock('./services/db', () => {
  return {
    query: jest.fn(),
    end: jest.fn().mockImplementation((callback) => {
      if (callback) callback();
    }),
  };
});
