import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import Header from "../components/pages/home/Header";
import "./styles/Home.css";

import Background from "../components/utils/Background/GradientBackground";
import { useState } from "react";
import FeedBody from "../components/pages/home/FeedBody";
import FilterBody from "../components/pages/home/FilterBody";

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
        <FilterBody />
        <FeedBody />
      </IonContent>
    </IonPage>
  );
};

export default Home;
