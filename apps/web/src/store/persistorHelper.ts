let persistorRef: any = null;

export const setPersistorRef = (persistor: any) => {
  persistorRef = persistor;
};

export const purgeStore = async () => {
  try {
    if (persistorRef) {
      await persistorRef.purge();
    }
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
  } catch (error) {
    console.error('Error purging persistor:', error);
  }
};
