import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import Home from "./pages/Home";

import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
// import "@ionic/react/css/padding.css";
// import "@ionic/react/css/float-elements.css";
// import "@ionic/react/css/text-alignment.css";
// import "@ionic/react/css/text-transformation.css";
// import "@ionic/react/css/flex-utils.css";
// import "@ionic/react/css/display.css";

// Custom CSS
import "./components/utils/TabBar.css";

import {
  HomeSimple as HomeIcon,
  Search as SearchIcon,
  UserCircle as UserIcon,
} from "iconoir-react";

import "@ionic/react/css/palettes/dark.class.css";

import "./theme/global.css";
import "./theme/variables.css";

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/home">
            <Home />
          </Route>
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="home" layout="icon-start" href="/home">
            <HomeIcon />
            <IonLabel>Home</IonLabel>
          </IonTabButton>

          <IonTabButton tab="explore" layout="icon-start" href="/explore">
            <SearchIcon />
            <IonLabel>Explore</IonLabel>
          </IonTabButton>

          <IonTabButton tab="unknown" layout="icon-start" href="/#">
            <IonLabel>Unknown</IonLabel>
          </IonTabButton>

          <IonTabButton tab="profile" layout="icon-start" href="/profile">
            <UserIcon />
            <IonLabel>Profile</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;
