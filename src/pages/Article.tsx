import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonIcon,
  IonButton,
  IonFab,
  IonFabButton,
  IonFabList,
  IonChip,
  IonLabel,
  useIonViewDidEnter,
  useIonViewDidLeave,
} from "@ionic/react";
import { useState } from "react";
import {
  bookmarkOutline,
  shareOutline,
  textOutline,
  heartOutline,
  ellipsisHorizontal,
  arrowBackOutline,
  linkOutline,
  chatbubbleOutline,
} from "ionicons/icons";
import "./styles/Article.css";
import {
  posthogPageleaveCaptureEvent,
  posthogPageviewCaptureEvent,
} from "../services/analytics/posthogAnalytics";

// Mock article data
const article = {
  id: 1,
  title: "The Future of Artificial Intelligence in Healthcare",
  subtitle: "How AI is revolutionizing diagnosis, treatment, and patient care",
  source: "Tech Today",
  author: "Sarah Johnson",
  date: "October 15, 2023",
  category: "Technology",
  readTime: "5 min read",
  imageUrl: "https://source.unsplash.com/random/1200x600?ai,healthcare",
  content: `
    <p>Artificial intelligence is rapidly transforming the healthcare industry, offering new possibilities for improving patient outcomes, reducing costs, and enhancing efficiency.</p>
    
    <h2>Revolutionizing Diagnostics</h2>
    <p>AI algorithms can now analyze medical images like X-rays, MRIs, and CT scans with remarkable accuracy, often detecting subtle abnormalities that might be missed by human eyes. These systems can help identify conditions like cancer, fractures, and neurological disorders at earlier stages when treatment is most effective.</p>
    
    <p>Machine learning models trained on vast datasets of patient records can also identify patterns that predict disease risk factors, potentially enabling preventive interventions before symptoms appear.</p>
    
    <h2>Personalized Treatment Plans</h2>
    <p>One of the most promising applications of AI in healthcare is the development of personalized treatment plans. By analyzing a patient's genetic information, medical history, and lifestyle factors, AI can help doctors tailor treatments to individual needs.</p>
    
    <p>This approach is already showing promise in oncology, where treatment responses can vary significantly between patients with seemingly similar cancer diagnoses.</p>
    
    <h2>Challenges and Ethical Considerations</h2>
    <p>Despite its potential, the implementation of AI in healthcare faces significant challenges. Data privacy concerns, the need for regulatory frameworks, and questions about the explainability of AI decisions all require careful consideration.</p>
    
    <p>Healthcare professionals also emphasize that AI should augment human expertise rather than replace it, maintaining the critical human connection in patient care.</p>
    
    <h2>The Future Outlook</h2>
    <p>As technology continues to evolve, we can expect to see even more sophisticated applications of AI in healthcare. From virtual nursing assistants to robotic surgery and drug discovery, the possibilities are vast.</p>
    
    <p>The key to successful implementation will be balancing technological innovation with ethical considerations and human-centered care practices.</p>
  `,
  relatedArticles: [
    {
      id: 2,
      title: "New AI Algorithm Detects Alzheimer's Years Before Symptoms",
      source: "Medical News",
    },
    {
      id: 3,
      title: "Tech Giants Invest Billions in Healthcare AI Research",
      source: "Business Insider",
    },
  ],
};

const Article: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [fontSize, setFontSize] = useState("medium"); // small, medium, large

  const handleScroll = (event: CustomEvent) => {
    setScrollY(event.detail.scrollTop);
  };

  const changeFontSize = (size: string) => {
    setFontSize(size);
  };

  useIonViewDidEnter(() => {
    posthogPageviewCaptureEvent();
  });

  useIonViewDidLeave(() => {
    posthogPageleaveCaptureEvent();
  });

  return (
    <IonPage>
      <IonHeader
        className={`article-header ${scrollY > 50 ? "translucent" : ""}`}
      >
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              defaultHref="/home"
              icon={arrowBackOutline}
              text=""
            />
          </IonButtons>

          <IonTitle
            className={`article-title ${scrollY > 150 ? "visible" : ""}`}
          >
            {article.title}
          </IonTitle>

          <IonButtons slot="end">
            <IonButton>
              <IonIcon slot="icon-only" icon={bookmarkOutline} />
            </IonButton>
            <IonButton>
              <IonIcon slot="icon-only" icon={shareOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent
        fullscreen
        scrollEvents={true}
        onIonScroll={handleScroll}
        className={`article-content font-size-${fontSize}`}
      >
        <div className="article-hero">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="article-image"
          />
          <div className="article-overlay"></div>

          <div className="article-meta">
            <IonChip color="primary" className="article-category">
              <IonLabel>{article.category}</IonLabel>
            </IonChip>
            <span className="article-read-time">{article.readTime}</span>
          </div>
        </div>

        <div className="article-container">
          <div className="article-header-content">
            <h1>{article.title}</h1>
            <h2>{article.subtitle}</h2>

            <div className="article-info">
              <div className="article-source">
                <span className="article-author">{article.author}</span>
                <span className="article-source-name"> • {article.source}</span>
              </div>
              <span className="article-date">{article.date}</span>
            </div>
          </div>

          {/* Article body content */}
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: article.content }}
          ></div>

          {/* Article actions */}
          <div className="article-actions">
            <div className="article-reaction">
              <IonButton fill="clear" className="reaction-button">
                <IonIcon icon={heartOutline} slot="start" />
                <span>245</span>
              </IonButton>
              <IonButton fill="clear" className="reaction-button">
                <IonIcon icon={chatbubbleOutline} slot="start" />
                <span>36</span>
              </IonButton>
            </div>
            <div className="article-share">
              <IonButton fill="clear" className="share-button">
                <IonIcon icon={linkOutline} slot="icon-only" />
              </IonButton>
              <IonButton fill="clear" className="share-button">
                <IonIcon icon={shareOutline} slot="icon-only" />
              </IonButton>
              <IonButton fill="clear" className="share-button">
                <IonIcon icon={bookmarkOutline} slot="icon-only" />
              </IonButton>
            </div>
          </div>

          {/* Related articles */}
          <div className="related-articles">
            <h3>Related Articles</h3>
            <div className="related-list">
              {article.relatedArticles.map((related) => (
                <div
                  key={related.id}
                  className="related-item"
                  onClick={() =>
                    (window.location.href = `/article/${related.id}`)
                  }
                >
                  <h4>{related.title}</h4>
                  <span className="related-source">{related.source}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reading options fab */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton>
            <IonIcon icon={textOutline} />
          </IonFabButton>
          <IonFabList side="top">
            <IonFabButton onClick={() => changeFontSize("small")}>
              <span style={{ fontSize: "12px" }}>A</span>
            </IonFabButton>
            <IonFabButton onClick={() => changeFontSize("medium")}>
              <span style={{ fontSize: "16px" }}>A</span>
            </IonFabButton>
            <IonFabButton onClick={() => changeFontSize("large")}>
              <span style={{ fontSize: "20px" }}>A</span>
            </IonFabButton>
          </IonFabList>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Article;
