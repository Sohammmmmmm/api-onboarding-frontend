import BrandMark from "./BrandMark";

export default function Loader({ text = "Loading...", fullScreen = false }) {
  return (
    <div
      className={`brand-loader ${fullScreen ? "brand-loader--full-screen" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="brand-loader__content">
        <div className="brand-loader__spinner" aria-hidden="true">
          <BrandMark className="brand-loader__mark" animated={false} />
        </div>
        <p className="brand-loader__text">{text}</p>
      </div>
    </div>
  );
}
