export type FormStatus = {
  isLoading: boolean;
  success: {
    data?: boolean;
    files?: boolean;
  };
  error: string | null;
};
