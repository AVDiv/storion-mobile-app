import React from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonSearchbar,
} from "@ionic/react";
import {
  notificationsOutline,
  settingsOutline,
  searchOutline,
  closeOutline,
} from "ionicons/icons";
import "./PageHeader.css";

interface PageHeaderProps {
  title: string;
  showSearch?: boolean;
  showNotification?: boolean;
  showSettings?: boolean;
  onSearchChange?: (value: string) => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  showSearch = true,
  showNotification = true,
  showSettings = true,
  onSearchChange,
}) => {
  const [searchVisible, setSearchVisible] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
    if (searchVisible) {
      setSearchValue("");
      if (onSearchChange) {
        onSearchChange("");
      }
    }
  };

  const handleSearchChange = (e: CustomEvent) => {
    const value = e.detail.value || "";
    setSearchValue(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  return (
    <IonHeader className="page-header">
      <IonToolbar>
        {!searchVisible ? (
          <>
            <IonTitle className="page-title">{title}</IonTitle>
            <IonButtons slot="end">
              {showSearch && (
                <IonButton onClick={toggleSearch}>
                  <IonIcon slot="icon-only" icon={searchOutline} />
                </IonButton>
              )}
              {showNotification && (
                <IonButton className="notification-btn">
                  <IonIcon slot="icon-only" icon={notificationsOutline} />
                  <span className="notification-badge"></span>
                </IonButton>
              )}
              {showSettings && (
                <IonButton>
                  <IonIcon slot="icon-only" icon={settingsOutline} />
                </IonButton>
              )}
            </IonButtons>
          </>
        ) : (
          <>
            <IonSearchbar
              value={searchValue}
              onIonChange={handleSearchChange}
              placeholder="Search articles..."
              showCancelButton="never"
              animated
              className="header-searchbar"
              autoFocus
            ></IonSearchbar>
            <IonButtons slot="end">
              <IonButton onClick={toggleSearch}>
                <IonIcon slot="icon-only" icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </>
        )}
      </IonToolbar>
    </IonHeader>
  );
};

export default PageHeader;
