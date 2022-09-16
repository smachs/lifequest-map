import { toast } from 'react-toastify';

export function notify<T>(
  promise: Promise<T>,
  {
    pending,
    success,
  }: {
    pending?: string;
    success?: string;
  } = {}
): Promise<T> {
  if (pending) {
    const info = toast.info(pending);
    promise.then((data) => {
      toast.dismiss(info);
      return data;
    });
  }
  if (success) {
    promise.then((data) => {
      toast.success(success);
      return data;
    });
  }
  promise.catch((data) => {
    toast.error(data instanceof Error ? data.message : data);
    return data;
  });
  return promise;
}
