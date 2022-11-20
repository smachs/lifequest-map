import fetch from 'node-fetch';

type Result = {
  data: {
    attributes: {
      patron_status: 'declined_patron' | 'former_patron' | 'active_patron';
    };
    id: string;
    type: 'member';
  }[];
};
export const getPatrons = async () => {
  const response = await fetch(
    encodeURI(
      'https://www.patreon.com/api/oauth2/v2/campaigns/1482769/members?fields[member]=patron_status'
    ),
    {
      headers: {
        Authorization: `Bearer ${process.env.PATREON_CREATORS_ACCESS_TOKEN}`,
      },
    }
  );
  const result = await response.json();
  if (!response.ok) {
    throw new Error(JSON.stringify(result));
  }
  const patrons = (result as Result).data.map((item) => ({
    id: item.id,
    status: item.attributes.patron_status,
  }));
  return patrons;
};

export const isPatron = async (id: string) => {
  const patrons = await getPatrons();
  return patrons.some(
    (patron) => patron.id === id && patron.status === 'active_patron'
  );
};
