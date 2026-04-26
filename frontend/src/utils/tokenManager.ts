let authToken: string | null = null;

export const tokenManager = {
  setToken: (token: string | null) => {
    authToken = token;
  },
  getToken: () => {
    return authToken;
  }
};
