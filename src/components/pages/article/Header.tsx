import { IonBackButton, IonButtons, IonHeader, IonToolbar } from "@ionic/react";
import { chevronBackOutline as ArrowLeftIcon } from "ionicons/icons";
import "./Header.css";

interface HeaderProps {
  title: string;
  isTranslucent: boolean;
  showTitle: boolean;
}

const ArticleHeader: React.FC<HeaderProps> = ({
  title,
  isTranslucent,
  showTitle,
}) => {
  return (
    <IonHeader className={`${isTranslucent ? "translucent" : "ion-no-border"}`}>
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton defaultHref="/home" icon={ArrowLeftIcon} />
        </IonButtons>
        <div className={`header-title ${showTitle ? "visible" : ""}`}>
          <h1>{title}</h1>
        </div>
      </IonToolbar>
    </IonHeader>
  );
};

export default ArticleHeader;
