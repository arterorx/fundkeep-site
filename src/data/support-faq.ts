import { CONTACT_EMAIL, PRICING, RELEASE, TRIAL } from '../consts';

/**
 * The support questions, in one array.
 *
 * The visible page and the FAQPage structured data are both built from this
 * list, so the two cannot drift apart — a lesson from sawkit.app, where the
 * markup and the text were written separately and had to be diffed by hand.
 *
 * Rules these answers obey (CLAUDE.md, SPEC §5):
 *  - Only facts that can be checked by installing the app: the price and how
 *    it is charged, the platforms, what the trial does and what happens after
 *    it, what the export produces, what the app does and does not talk to.
 *  - No financial advice. Not how much to put in an envelope, not what to cut,
 *    not what a budget "should" look like. We explain the method and show the
 *    tool.
 *  - No feature that is not in the version being submitted, and no "soon".
 *
 * The source for the app-behaviour answers is the app repository's own
 * `Metadata/ReviewNotes.md` and `Metadata/AppStore.md` — the documents that
 * had to be true in front of App Review.
 */
export interface FaqItem {
  q: string;
  a: string;
  /** Rendered as a link after the answer, and appended to the schema text. */
  link?: { href: string; label: string };
}

export const SUPPORT_FAQ: FaqItem[] = [
  {
    q: 'Which devices does Fundkeep run on?',
    a: `${RELEASE.platforms}. It needs ${RELEASE.requires} or later. One purchase covers all three.`,
  },
  {
    q: 'What does it cost?',
    a: `${PRICING.full} — ${PRICING.note}. There is nothing else to pay, no tier above it, and no account to keep alive.`,
  },
  {
    q: 'Can I try it before paying?',
    a: `Yes. Fundkeep is free to use for ${TRIAL.days} days with nothing withheld — every feature, no watermark, no nagging.`,
  },
  {
    q: `What happens after the ${TRIAL.days} days?`,
    a: `The app becomes read-only until you buy it. Everything you entered stays visible — board, history, reports — and exporting to CSV keeps working. Entering new transactions resumes the moment you unlock it. The trial is counted from first launch, and it is not a subscription: nothing auto-renews, because there is nothing to renew.`,
  },
  {
    q: 'Does Fundkeep connect to my bank?',
    a: 'No, and that is deliberate rather than pending. It asks for no bank credentials and has no bank integration of any kind. You get transactions in by typing them, or by exporting a CSV statement from your own bank and picking that file yourself — it is read on your device, and you see every row before anything is saved.',
  },
  {
    q: 'Can I bring my budget over from another budgeting app?',
    a: 'Yes, if it can export. Fundkeep reads the export, rebuilds your categories, accounts and history, and then shows you a reconciliation report: what the other app said each balance was, what Fundkeep makes it, and every difference it found. You check the numbers before you commit to them.',
  },
  {
    q: 'Can I get my data back out?',
    a: `Everything exports to CSV, at any time, and that includes after the trial ends and before you have bought anything. An app that held your own records hostage would not be worth trusting with them.`,
  },
  {
    q: 'How do I get my budget onto a second device?',
    a: 'Leave iCloud sync on, on both devices, signed in to the same Apple Account. The data travels through your own private iCloud database — we never hold a copy — and you can switch it off in Settings to keep everything local.',
  },
  {
    q: 'I paid, but the app is still read-only.',
    a: 'Use Restore Purchase, on the purchase screen, while signed in to the Apple Account you bought it with. The purchase is tied to that account rather than to the device, so reinstalling or moving to a new device does not cost you anything.',
  },
  {
    q: 'How do I ask for a refund?',
    a: 'Purchases and refunds are handled by Apple, not by us. Report the problem to Apple and choose the purchase:',
    link: {
      href: 'https://reportaproblem.apple.com',
      label: 'reportaproblem.apple.com',
    },
  },
  {
    q: 'If I email support, can you see my budget?',
    a: `No. Fundkeep has no server and no account, so there is nothing for us to look up. We only ever see what you choose to put in the message yourself — please do not send account numbers or statements to ${CONTACT_EMAIL} unless they are genuinely needed to explain the problem.`,
  },
  {
    q: 'How do I report a bug?',
    a: 'Write and say which device you are on, which version of iOS, iPadOS or macOS it is running, the Fundkeep version from Settings, and what you did just before it went wrong. That is usually enough to find it.',
  },
];
