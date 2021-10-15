import styles from './App.module.css';
import AppHeader from './components/AppHeader/AppHeader';
import MapFilter from './components/MapFilter/MapFilter';
import ResizeBorder from './components/ResizeBorder/ResizeBorder';
import WorldMap from './components/WorldMap/WorldMap';

function App(): JSX.Element {
  return (
    <div className={styles.container}>
      <AppHeader />
      <MapFilter />
      <WorldMap />
      <ResizeBorder />
    </div>
  );
}

export default App;
