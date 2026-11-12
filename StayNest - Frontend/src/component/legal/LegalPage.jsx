import { Link } from "react-router-dom";
import { legalContent } from "./legalContent";
import "./LegalPage.css";

const LegalPage = ({ slug }) => {
  const page = legalContent[slug];

  if (!page) {
    return (
      <div className="legal-page">
        <div className="legal-shell">
          <p>That page couldn't be found.</p>
          <Link to="/" className="legal-back">Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="legal-hero">
        <img src={page.heroImage || "/images/legal-hero-default.jpg"} alt={page.title} />
        <div className="legal-hero-content">
          <span className="legal-hero-eyebrow">StayNest</span>
          <h1>{page.title}</h1>
          {page.tagline && <p>{page.tagline}</p>}
        </div>
      </div>

      <div className="legal-page">
        <div className="legal-shell">
          <p className="legal-updated">{page.updated}</p>

          {page.sections.map((section) => (
            <section className="legal-section" key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}

          <Link to="/" className="legal-back">
            ← Back to home
          </Link>
        </div>
      </div>
    </>
  );
};

export default LegalPage;