import React, { useEffect, useRef, useState } from "react";
import linkIcon from "../../../assets/svg/link.svg";

const MAX_SUBJECT_LENGTH = 150;
const CAMPAIGN_QUESTION_TOKEN = "[[CAMPAIGN_QUESTION]]";

const DEFAULT_MESSAGE = `Hello,

As you are aware, we are growing as a company and looking for talented people just like you! To better engage our candidates, we're creating videos of our employees discussing what it's like working for our company. We can't create this content by ourselves, however: we need your help! Below is a prompt about the video we're trying to create. Read the prompt and click the link below to record a response. Your input will really help improve our candidate experience!

${CAMPAIGN_QUESTION_TOKEN}`;

const getDefaultFromEmail = () => {
  const userDetails = (window as { keycloakInstance?: { tokenParsed?: { userDetails?: { userName?: string; email?: string } } } })
    .keycloakInstance?.tokenParsed?.userDetails;
  return userDetails?.userName || userDetails?.email || "local.preview@onehealth.org";
};

interface ShareViaEmailModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (payload: { to: string; subject: string; message: string; fromName: string }) => void;
  defaultFromName: string;
  videoPrompt: string;
  requestLink: string;
}

export const ShareViaEmailModal: React.FC<ShareViaEmailModalProps> = ({
  open,
  onClose,
  onSend,
  defaultFromName,
  videoPrompt,
  requestLink,
}) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const [fromName, setFromName] = useState(defaultFromName);
  const [fromEmail] = useState(getDefaultFromEmail);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("Help us attract new talent!");
  const [messageHtml, setMessageHtml] = useState("");

  useEffect(() => {
    if (!open) return;
    setFromName(defaultFromName);
    setTo("");
    setSubject("Help us attract new talent!");
    const initialMessage = DEFAULT_MESSAGE.replace(
      CAMPAIGN_QUESTION_TOKEN,
      videoPrompt ? `"${videoPrompt}"\n\n${requestLink}` : requestLink,
    );
    setMessageHtml(initialMessage.replace(/\n/g, "<br />"));
  }, [defaultFromName, open, requestLink, videoPrompt]);

  useEffect(() => {
    if (!open || !messageRef.current) return;
    messageRef.current.innerHTML = messageHtml;
  }, [messageHtml, open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const canSend = to.trim().length > 0 && subject.trim().length > 0;

  const applyFormat = (command: string) => {
    document.execCommand(command, false);
    messageRef.current?.focus();
  };

  const insertPlaceholder = () => {
    const token = videoPrompt || CAMPAIGN_QUESTION_TOKEN;
    document.execCommand("insertText", false, token);
    messageRef.current?.focus();
  };

  const handleSend = () => {
    if (!canSend) return;
    const message = messageRef.current?.innerText?.trim() || "";
    onSend({ to: to.trim(), subject: subject.trim(), message, fromName: fromName.trim() });
  };

  return (
    <div
      className="cs-modal-backdrop amp-share-email-modal__backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="amp-share-email-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="cs-modal cs-modal--lg amp-share-email-modal">
        <div className="cs-modal__header">
          <h2 id="amp-share-email-title">Share via Email</h2>
          <button type="button" className="cs-icon-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="cs-modal__body amp-share-email-modal__body">
          <div className="cs-field">
            <label htmlFor="amp-share-email-from-name">From</label>
            <p className="cs-field-help">
              Use a name recipients will instantly recognize. The email address is taken from your settings.
            </p>
            <div className="amp-share-email-modal__from-grid">
              <input
                id="amp-share-email-from-name"
                type="text"
                value={fromName}
                placeholder="e.g. HR Team"
                onChange={(event) => setFromName(event.target.value)}
              />
              <input type="email" value={fromEmail} readOnly aria-label="From email address" />
            </div>
          </div>

          <div className="cs-field">
            <label htmlFor="amp-share-email-to">To</label>
            <p className="cs-field-help">
              Who do you want to send your request to? For multiple recipients separate with comma.
            </p>
            <textarea
              id="amp-share-email-to"
              rows={2}
              value={to}
              placeholder="Enter email address(es)"
              onChange={(event) => setTo(event.target.value)}
            />
          </div>

          <div className="cs-field">
            <label htmlFor="amp-share-email-subject">Subject</label>
            <p className="cs-field-help">Choose an engaging topic</p>
            <div className="amp-share-email-modal__subject-wrap">
              <input
                id="amp-share-email-subject"
                type="text"
                value={subject}
                maxLength={MAX_SUBJECT_LENGTH}
                onChange={(event) => setSubject(event.target.value)}
              />
              <span className="amp-share-email-modal__counter" aria-live="polite">
                {subject.length} / {MAX_SUBJECT_LENGTH}
              </span>
            </div>
          </div>

          <div className="cs-field">
            <label htmlFor="amp-share-email-message">Message</label>
            <div className="amp-share-email-modal__editor">
              <div className="amp-share-email-modal__toolbar" role="toolbar" aria-label="Message formatting">
                <button type="button" className="amp-share-email-modal__tool" onClick={() => applyFormat("bold")} aria-label="Bold">
                  <strong>B</strong>
                </button>
                <button type="button" className="amp-share-email-modal__tool" onClick={() => applyFormat("italic")} aria-label="Italic">
                  <em>I</em>
                </button>
                <button type="button" className="amp-share-email-modal__tool" onClick={() => applyFormat("underline")} aria-label="Underline">
                  <span>U</span>
                </button>
                <button
                  type="button"
                  className="amp-share-email-modal__tool"
                  onClick={() => {
                    const url = window.prompt("Enter link URL", requestLink);
                    if (url) document.execCommand("createLink", false, url);
                    messageRef.current?.focus();
                  }}
                  aria-label="Insert link"
                >
                  <img src={linkIcon} alt="" width={14} height={14} />
                </button>
                <button
                  type="button"
                  className="amp-share-email-modal__tool"
                  onClick={() => document.execCommand("unlink")}
                  aria-label="Remove link"
                  disabled
                >
                  <span className="amp-share-email-modal__unlink" aria-hidden="true" />
                </button>
                <button type="button" className="amp-share-email-modal__placeholders" onClick={insertPlaceholder}>
                  + Placeholders
                </button>
              </div>
              <div
                id="amp-share-email-message"
                ref={messageRef}
                className="amp-share-email-modal__message"
                contentEditable
                suppressContentEditableWarning
                role="textbox"
                aria-multiline="true"
              />
            </div>
          </div>
        </div>

        <div className="cs-modal__footer amp-share-email-modal__footer">
          <button type="button" className="cs-btn cs-btn--secondary-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="cs-btn cs-btn--primary" onClick={handleSend} disabled={!canSend}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
