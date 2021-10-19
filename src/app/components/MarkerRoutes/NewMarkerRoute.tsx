import SelectRoute from './SelectRoute';

function NewMarkerRoute(): JSX.Element {
  return (
    <>
      <SelectRoute onSelectRoute={console.log} />
    </>
  );
}

export default NewMarkerRoute;
