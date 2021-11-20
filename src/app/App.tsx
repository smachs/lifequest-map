import { ToastContainer } from 'react-toastify';
import styles from './App.module.css';
import AppHeader from './components/AppHeader/AppHeader';
import MapFilter from './components/MapFilter/MapFilter';
import ResizeBorder from './components/ResizeBorder/ResizeBorder';
import WorldMap from './components/WorldMap/WorldMap';
import 'react-toastify/dist/ReactToastify.css';

function App(): JSX.Element {
  return (
    <div className={styles.container}>
      <AppHeader />
      <MapFilter />
      <WorldMap />
      <ResizeBorder />
      <ToastContainer theme="dark" pauseOnFocusLoss={false} />
    </div>
  );
}

export default App;
