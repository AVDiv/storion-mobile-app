import {
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch,
} from "react-router-dom";
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
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding"; // Import the Onboarding component
// import SettingsPage from "./pages/SettingsPage";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
/* Global styles */
import "./theme/global.css";

// Custom CSS
import "./components/utils/TabBar.css";

import {
  HomeSimple as HomeIcon,
  Search as SearchIcon,
  UserCircle as UserIcon,
} from "iconoir-react";

import "@ionic/react/css/palettes/dark.class.css";

import Search from "./pages/Search";
import { AuthProvider } from "./services/auth/authContext";
import PrivateRoute from "./components/utils/function/PrivateRoute";
import OnboardingRoute from "./components/utils/function/OnboardingRoute";
import { initializePostHog } from "./services/analytics/posthogAnalytics";
import { storageService } from "./services/storage/storageService";
import { useEffect } from "react";

setupIonicReact({
  mode: "md",
  rippleEffect: true,
  hardwareBackButton: true,
  statusTap: true,
});

const App: React.FC = () => {
  useEffect(() => {
    const initApp = async () => {
      await storageService.init();
      await initializePostHog();
      // Initialize token service is done automatically in its constructor
    };
    initApp();
  }, []);

  return (
    <IonApp>
      <Router>
        <AuthProvider>
          <IonReactRouter>
            <Switch>
              {/* Public routes */}
              <Route exact path="/login" component={Login} />
              <Route exact path="/signup" component={Signup} />
              <PrivateRoute exact path="/onboarding" component={Onboarding} />

              {/* Protected routes */}
              <Route>
                <IonTabs>
                  <IonRouterOutlet>
                    <Route exact path="/">
                      <Redirect to="/home" />
                    </Route>
                    <OnboardingRoute exact path="/home" component={Home} />
                    <OnboardingRoute exact path="/search" component={Search} />
                    <OnboardingRoute
                      exact
                      path="/article/:id"
                      component={Article}
                    />
                    <OnboardingRoute
                      exact
                      path="/profile"
                      component={Profile}
                    />
                    {/* <OnboardingRoute
                    exact
                    path="/settings"
                    component={SettingsPage}
                  /> */}
                  </IonRouterOutlet>

                  <IonTabBar slot="bottom">
                    <IonTabButton tab="home" layout="icon-start" href="/home">
                      <HomeIcon />
                      <IonLabel>Home</IonLabel>
                    </IonTabButton>

                    <IonTabButton
                      tab="search"
                      layout="icon-start"
                      href="/search"
                    >
                      <SearchIcon />
                      <IonLabel>Search</IonLabel>
                    </IonTabButton>

                    <IonTabButton
                      tab="profile"
                      layout="icon-start"
                      href="/profile"
                    >
                      <UserIcon />
                      <IonLabel>Profile</IonLabel>
                    </IonTabButton>
                  </IonTabBar>
                </IonTabs>
              </Route>
            </Switch>
          </IonReactRouter>
        </AuthProvider>
      </Router>
    </IonApp>
  );
};

export default App;
