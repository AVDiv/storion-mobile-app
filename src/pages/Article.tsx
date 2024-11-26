import { IonContent, IonPage } from "@ionic/react";
import { useState } from "react";
import ArticleBackground from "../components/pages/article/Background";
import ArticleHeader from "../components/pages/article/Header";
import "./styles/Article.css";

const Article: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const title = "Article Title";

  const handleScroll = (event: CustomEvent) => {
    setScrollY(event.detail.scrollTop);
  };

  return (
    <IonPage>
      <ArticleBackground scrollY={scrollY} />
      <ArticleHeader
        title={title}
        isTranslucent={scrollY > 50}
        showTitle={scrollY > 150}
      />
      <IonContent fullscreen scrollEvents={true} onIonScroll={handleScroll}>
        <div className="article-content">
          <div className="article-header">
            <h1>{title}</h1>
            <p className="article-meta">4h ago • 50 sources</p>
          </div>
          <img src="/image-placeholder.webp" alt="Article header" />
          <div className="article-body" style={{ height: "200vh" }}>
            <p>Article content goes here...</p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Article;
