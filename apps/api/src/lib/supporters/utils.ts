import fetch from 'node-fetch';

type Result = {
  data: {
    attributes: {
      email: string;
      patron_status: 'declined_patron' | 'former_patron' | 'active_patron';
    };
    id: string;
    type: 'member';
  }[];
  links?: {
    next: string;
  };
  meta: {
    pagination: {
      cursors?: {
        next: string;
      };
      total: number;
    };
  };
};
export const getPatrons = async (next?: string) => {
  const url =
    next ??
    encodeURI(
      'https://www.patreon.com/api/oauth2/v2/campaigns/1482769/members?fields[member]=patron_status,email'
    );
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.PATREON_CREATORS_ACCESS_TOKEN}`,
    },
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(JSON.stringify(result));
  }
  const { data, links } = result as Result;
  const patrons = data.map((item) => ({
    id: item.id,
    email: item.attributes.email,
    status: item.attributes.patron_status,
  }));

  if (links?.next) {
    const morePatrons = await getPatrons(links.next);
    patrons.push(...morePatrons);
  }
  return patrons;
};

const cache: {
  timestamp: number;
  promise: ReturnType<typeof getPatrons> | null;
} = {
  timestamp: 0,
  promise: null,
};

export const isPatron = async (id: string) => {
  if (cache.timestamp < Date.now() - 1000 * 60 || !cache.promise) {
    cache.promise = getPatrons();
    cache.timestamp = Date.now();
  }
  const patrons = await cache.promise;
  return patrons.find(
    (patron) => patron.id === id && patron.status === 'active_patron'
  );
};

export const findPatron = async (email: string) => {
  if (cache.timestamp < Date.now() - 1000 * 60 || !cache.promise) {
    cache.promise = getPatrons();
    cache.timestamp = Date.now();
  }
  const patrons = await cache.promise;
  return patrons.find(
    (patron) => patron.email === email && patron.status === 'active_patron'
  );
};
