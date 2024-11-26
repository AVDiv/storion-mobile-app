import { Redirect, Route, Switch } from "react-router-dom";
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
import Article from "./pages/Article";
import Signup from "./pages/Signup";
import Login from "./pages/Login";

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
import Search from "./pages/Search";

setupIonicReact({
  mode: "md",
  rippleEffect: true,
  hardwareBackButton: true,
  statusTap: true,
});

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <Switch>
        {/* Auth routes without tabs */}
        <Route exact path="/login" component={Login} />
        <Route exact path="/signup" component={Signup} />

        {/* Main app routes with tabs */}
        <Route>
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/">
                <Redirect to="/home" />
              </Route>
              <Route exact path="/home" component={Home} />
              <Route exact path="/search" component={Search} />
              <Route exact path="/article/:id" component={Article} />
            </IonRouterOutlet>

            <IonTabBar slot="bottom">
              <IonTabButton tab="home" layout="icon-start" href="/home">
                <HomeIcon />
                <IonLabel>Home</IonLabel>
              </IonTabButton>

              <IonTabButton tab="search" layout="icon-start" href="/search">
                <SearchIcon />
                <IonLabel>Search</IonLabel>
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
        </Route>
      </Switch>
    </IonReactRouter>
  </IonApp>
);

export default App;
