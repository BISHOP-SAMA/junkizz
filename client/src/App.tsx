import { Switch, Route } from 'wouter';
import Home from './pages/Home';
import GameHub from './pages/GameHub';
import ShellBlitz from './pages/ShellBlitz';
import Airdrop from './pages/Airdrop';
import ComingSoon from './pages/ComingSoon';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/game" component={GameHub} />
      <Route path="/shell-blitz" component={ShellBlitz} />
      <Route path="/airdrop" component={Airdrop} />
      <Route path="/race" component={() => <ComingSoon pageId="slog-race" label="Slog Race" color="#06D6A0" emoji="🏁" />} />
      <Route path="/customize" component={() => <ComingSoon pageId="customize" label="Customize" color="#EF476F" emoji="🎨" />} />
      <Route path="/gallery" component={() => <ComingSoon pageId="gallery" label="Gallery" color="#118AB2" emoji="🖼️" />} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
