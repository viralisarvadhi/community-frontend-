let memoryToken: string | null = null;

export const tokenStore = {
    getToken: () => memoryToken,
    setToken: (token: string | null) => {
        memoryToken = token;
    },
    clear: () => {
        memoryToken = null;
    },
};
