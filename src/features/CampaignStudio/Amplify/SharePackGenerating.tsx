import React, { useEffect, useRef, useState } from "react";

const GENERATION_STEPS = [
  "Analyzing your brief...",
  "Matching a template...",
  "Drafting captions...",
  "Setting CTA and audience...",
  "Preparing your share pack...",
];

const WIZARD_STEPS = [
  { title: "Details", description: "Review auto-filled fields." },
  { title: "Preview & Publish", description: "Review generated content." },
] as const;

interface SharePackGeneratingProps {
  onDone: () => void;
  onExit: () => void;
}

export const SharePackGenerating: React.FC<SharePackGeneratingProps> = ({ onDone, onExit }) => {
  const [step, setStep] = useState(0);
  const onDoneRef = useRef(onDone);
  const cancelledRef = useRef(false);
  const doneTimeoutRef = useRef<number | null>(null);
  onDoneRef.current = onDone;
  const progress = Math.min((step + 1) * 20, 100);

  useEffect(() => {
    cancelledRef.current = false;
    const interval = window.setInterval(() => {
      setStep((current) => {
        if (current >= GENERATION_STEPS.length - 1) {
          window.clearInterval(interval);
          doneTimeoutRef.current = window.setTimeout(() => {
            if (!cancelledRef.current) onDoneRef.current();
          }, 350);
          return current;
        }
        return current + 1;
      });
    }, 520);
    return () => {
      window.clearInterval(interval);
      if (doneTimeoutRef.current !== null) {
        window.clearTimeout(doneTimeoutRef.current);
        doneTimeoutRef.current = null;
      }
    };
  }, []);

  const handleExit = () => {
    cancelledRef.current = true;
    if (doneTimeoutRef.current !== null) {
      window.clearTimeout(doneTimeoutRef.current);
      doneTimeoutRef.current = null;
    }
    onExit();
  };

  return (
    <section className="amp-wizard-shell amp-wizard-shell--generating">
      <div className="amp-dispatch amp-dispatch--wizard">
        <header className="amp-dispatch__hero">
          <button type="button" className="cs-back-edit" onClick={handleExit}>
            <svg className="cs-back-edit__icon" viewBox="0 0 14 12" aria-hidden="true" focusable="false">
              <path
                d="M0.23125 6.54554C0.084375 6.40179 0 6.20804 0 6.00179C0 5.79554 0.084375 5.60179 0.23125 5.45804L5.73125 0.208037C6.03125 -0.0794632 6.50625 -0.0669631 6.79063 0.233037C7.075 0.533037 7.06563 1.00804 6.76562 1.29241L2.62188 5.25179H13.25C13.6656 5.25179 14 5.58616 14 6.00179C14 6.41741 13.6656 6.75179 13.25 6.75179H2.62188L6.76875 10.708C7.06875 10.9955 7.07812 11.4674 6.79375 11.7674C6.50937 12.0674 6.03438 12.0768 5.73438 11.7924L0.234375 6.54241L0.23125 6.54554Z"
                fill="currentColor"
              />
            </svg>
            Back to Employee Advocacy
          </button>
          <h1>Generate share pack</h1>
        </header>

        <div className="amp-dispatch__stepper-row">
          <div className="cs-wizard-steps" aria-label="Generate share pack steps">
            {WIZARD_STEPS.map((item, index) => (
              <span key={item.title} className={index === 0 ? "is-active" : ""}>
                <span className="cs-wizard-step__rail" aria-hidden="true">
                  <em>{index + 1}</em>
                </span>
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>
            ))}
          </div>
        </div>

        <div className="cs-generation__progress amp-generation__progress" aria-live="polite">
          <div className="cs-generation__progress-copy">
            <strong>{GENERATION_STEPS[step]}</strong>
            <span>{progress}%</span>
          </div>
          <div className="cs-progress">
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="cs-skeleton-grid amp-generation__skeletons">
            <div className="cs-skeleton-card amp-generation__skeleton" />
            <div className="cs-skeleton-card amp-generation__skeleton" />
          </div>
        </div>
      </div>
    </section>
  );
};
