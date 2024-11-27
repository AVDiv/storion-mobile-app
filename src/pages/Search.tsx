import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import Header from "../components/pages/home/Header";
import SearchInput from "../components/pages/search/SearchInput";
import FilterBody from "../components/pages/home/FilterBody";
import "./styles/Search.css";

import Background from "../components/utils/Background/GradientBackground";
import { useState } from "react";

const Search: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = (event: CustomEvent) => {
    setScrollY(event.detail.scrollTop);
  };

  return (
    <IonPage>
      <Header isTranslucent={scrollY > 50} />
      <Background scrollY={scrollY} />
      <IonContent fullscreen scrollEvents={true} onIonScroll={handleScroll}>
        <div className="search-body">
          <SearchInput />
          <FilterBody />
          <div className="search-content">
            <p className="search-placeholder">
              Enter a search term to find news articles
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Search;
