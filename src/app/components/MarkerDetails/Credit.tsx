type CreditProps = {
  username: string;
};

function Credit({ username }: CreditProps): JSX.Element {
  let content: JSX.Element;
  if (username === 'mapgenie') {
    content = (
      <a href="https://mapgenie.io/new-world/maps/aeternum" target="_blank">
        Map Genie
      </a>
    );
  } else if (username === 'newworld-map') {
    content = (
      <a href="https://www.newworld-map.com" target="_blank">
        New World Map
      </a>
    );
  } else {
    content = <b>{username}</b>;
  }
  return <small>Credits to {content} ❤️</small>;
}

export default Credit;
