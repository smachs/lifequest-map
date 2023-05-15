import { notifications } from '@mantine/notifications';

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
    const id = Date.now().toString();
    notifications.show({ id: id, message: pending, loading: true });
    promise.then((data) => {
      notifications.hide(id);
      return data;
    });
  }
  if (success) {
    promise.then((data) => {
      notifications.show({ message: success, color: 'green' });
      return data;
    });
  }
  promise.catch((data) => {
    notifications.show({
      message: data instanceof Error ? data.message : data,
      color: 'red',
    });
    return data;
  });
  return promise;
}
