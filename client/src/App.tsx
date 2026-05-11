import { Switch, Route } from 'wouter';
import Home from './pages/Home';
import ShellBlitz from './pages/ShellBlitz';
import Race from './pages/Race';
import Customize from './pages/Customize';
import Gallery from './pages/Gallery';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shell-blitz" component={ShellBlitz} />
      <Route path="/race" component={Race} />
      <Route path="/customize" component={Customize} />
      <Route path="/gallery" component={Gallery} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
