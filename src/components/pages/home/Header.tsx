import React from "react";
import { IonHeader, IonToolbar, IonTitle } from "@ionic/react";

import "./Header.css";

interface HeaderProps {
  isTranslucent: boolean;
}

const HomeHeader: React.FC<HeaderProps> = ({ isTranslucent }) => {
  return (
    <IonHeader className={`${isTranslucent ? "translucent" : "ion-no-border"}`}>
      <IonToolbar>
        <IonTitle>Tuesday</IonTitle>
        <IonTitle size="small">13th November 2024</IonTitle>
      </IonToolbar>
    </IonHeader>
  );
};

export default HomeHeader;
