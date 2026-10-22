import { useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { landingCopy } from "../../data/landing.js";

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const { announcement } = landingCopy;

  if (!visible) return null;

  return (
    <div className="announcement">
      <span className="announcement-dot" aria-hidden="true" />
      <span className="announcement-title">{announcement.message}</span>
      <a href={announcement.linkTarget} onClick={() => setVisible(false)}>
        {announcement.linkText}
        <ArrowRight size={13} aria-hidden="true" />
      </a>
      <button
        className="announcement-close"
        type="button"
        onClick={() => setVisible(false)}
        aria-label={announcement.dismissLabel}
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
