let socketClient: Promise<typeof import("./client")> | undefined;

export const loadSocketClient = () => {
  socketClient ??= import("./client");
  return socketClient;
};

export const disconnectRealtime = () => {
  if (socketClient !== undefined) {
    void socketClient.then(({ disconnectRealtime: disconnect }) => disconnect());
  }
};
