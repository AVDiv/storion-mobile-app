import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import Header from "../components/pages/home/Header";
import "./Home.css";

import Background from "../components/utils/Background/GradientBackground";
import { useState } from "react";
import FeedBody from "../components/pages/home/FeedBody";

const Home: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = (event: CustomEvent) => {
    setScrollY(event.detail.scrollTop);
  };

  return (
    <IonPage>
      <Header isTranslucent={scrollY > 50} />
      <Background scrollY={scrollY} />
      <IonContent fullscreen scrollEvents={true} onIonScroll={handleScroll}>
        <FeedBody />
      </IonContent>
    </IonPage>
  );
};

export default Home;
