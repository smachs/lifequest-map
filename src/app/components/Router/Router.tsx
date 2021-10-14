import type { ReactNode, MouseEvent } from 'react';
import { useEffect } from 'react';
import { createContext, useContext, useState } from 'react';

type RouterContextType = {
  url: URL;
  go: (href: string, preserveSearch?: boolean) => void;
  search: (params: { [key: string]: string }) => void;
};
const RouterContext = createContext<RouterContextType>({
  url: new URL(location.href),
  go: () => undefined,
  search: () => undefined,
});

type RouterProviderProps = {
  children: ReactNode;
  readonly?: boolean;
};
export function RouterProvider({
  children,
  readonly,
}: RouterProviderProps): JSX.Element {
  const [url, setURL] = useState<URL>(
    () => new URL(localStorage.getItem('url') || location.href)
  );

  useEffect(() => {
    if (!readonly) {
      return;
    }
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== 'url' || !event.newValue) {
        return;
      }
      setURL(new URL(event.newValue));
    };
    window.addEventListener('storage', handleStorage, false);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [readonly]);

  useEffect(() => {
    if (!readonly) {
      localStorage.setItem('url', url.toString());
    }
    history.replaceState({}, '', url);
  }, [url]);

  function go(href: string, preserveSearch?: boolean): void {
    const url = new URL(location.href);
    let fullHref = href;
    if (preserveSearch) {
      fullHref += `?${url.searchParams.toString()}`;
    }
    if (fullHref.startsWith('/')) {
      fullHref = url.origin + fullHref;
    }
    if (fullHref !== location.href) {
      setURL(new URL(fullHref));
      history.pushState({}, '', fullHref);
    }
  }

  function search(params: { [key: string]: string }): void {
    const url = new URL(location.href);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    go(url.href);
  }

  return (
    <RouterContext.Provider value={{ url, go, search }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter(): RouterContextType {
  return useContext(RouterContext);
}

export function useURL(): URL {
  return useRouter().url;
}

type LinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  preserveSearch?: boolean;
};

export function Link({
  href,
  children,
  className,
  preserveSearch,
}: LinkProps): JSX.Element {
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    router.go(event.currentTarget.href, preserveSearch);
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

type RouteProps = {
  children: ReactNode;
  path: string;
};
export function Route({ children, path }: RouteProps): JSX.Element {
  const url = useURL();

  if (url.pathname !== path) {
    return <></>;
  }
  return <>{children}</>;
}
