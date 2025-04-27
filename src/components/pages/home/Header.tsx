import React from "react";
import { IonHeader, IonToolbar, IonTitle, IonText } from "@ionic/react";

import "./Header.css";

interface HeaderProps {
  isTranslucent: boolean;
  userName?: string;
}

const HomeHeader: React.FC<HeaderProps> = ({ isTranslucent, userName }) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const userFirstName = userName ? userName.split(" ")[0] : "";

  return (
    <IonHeader
      className={`ion-header-home ${
        isTranslucent ? "translucent" : "ion-no-border"
      }`}
      translucent={isTranslucent}
    >
      <IonToolbar>
        <IonTitle size="small">{currentDate}</IonTitle>
        <IonTitle>
          {userName ? `Welcome, ${userFirstName}` : "Welcome"}
        </IonTitle>
      </IonToolbar>
    </IonHeader>
  );
};

export default HomeHeader;
