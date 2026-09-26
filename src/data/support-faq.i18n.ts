import { CONTACT_EMAIL, MARKETS, RELEASE, TRIAL } from '../consts';
import type { FaqItem } from './support-faq';

/**
 * The support questions in the other three languages.
 *
 * Not a translation of the English answers but the same answers written for
 * the reader who is standing in a different App Store: the price question is
 * answered with what Apple charges in that region, and the platform list is
 * written in that language rather than passed through from `RELEASE`.
 *
 * Everything else obeys the rules the English list obeys (CLAUDE.md, SPEC §5):
 * only facts that can be checked by installing the app, no financial advice,
 * and no feature that is not in the version on sale.
 */

const PLATFORMS = {
  de: 'iPhone, iPad und Mac',
  fr: 'iPhone, iPad et Mac',
  ja: 'iPhone・iPad・Mac',
} as const;

const de: FaqItem[] = [
  {
    q: 'Auf welchen Geräten läuft Fundkeep?',
    a: `${PLATFORMS.de}. Es braucht ${RELEASE.requires} oder neuer. Ein Kauf deckt alle drei ab.`,
  },
  {
    q: 'Was kostet es?',
    a: `${MARKETS.de.full} im deutschen App Store — ein Kauf, kein Abo. Es gibt nichts weiter zu zahlen, keine Stufe darüber und kein Konto, das am Leben gehalten werden muss.`,
  },
  {
    q: 'Kann ich es vorher ausprobieren?',
    a: `Ja. Fundkeep ist ${TRIAL.days} Tage lang kostenlos nutzbar, ohne dass etwas zurückgehalten wird — jede Funktion, kein Wasserzeichen, kein Betteln.`,
  },
  {
    q: `Was passiert nach den ${TRIAL.days} Tagen?`,
    a: 'Die App wird schreibgeschützt, bis du sie kaufst. Alles Eingetragene bleibt sichtbar — Übersicht, Verlauf, Berichte — und der CSV-Export funktioniert weiter. Neue Umsätze kannst du eintragen, sobald du freischaltest. Die Testzeit läuft ab dem ersten Start und ist kein Abo: es verlängert sich nichts, weil es nichts zu verlängern gibt.',
  },
  {
    q: 'Verbindet sich Fundkeep mit meiner Bank?',
    a: 'Nein, und das ist Absicht, nicht Baustelle. Die App fragt nach keinen Bankzugangsdaten und hat keinerlei Bankanbindung. Umsätze kommen herein, indem du sie eintippst oder eine CSV-Datei aus deinem Online-Banking exportierst und selbst auswählst — sie wird auf deinem Gerät gelesen, und du siehst jede Zeile, bevor etwas gespeichert wird.',
  },
  {
    q: 'Kann ich mein Budget aus einer anderen App mitnehmen?',
    a: 'Ja, wenn sie exportieren kann. Fundkeep liest den Export, baut Kategorien, Konten und Verlauf nach und zeigt dir dann einen Abgleichbericht: was die andere App als Saldo angegeben hat, was Fundkeep daraus macht, und jede gefundene Abweichung. Du prüfst die Zahlen, bevor du sie übernimmst.',
  },
  {
    q: 'Komme ich wieder an meine Daten heran?',
    a: 'Alles lässt sich jederzeit als CSV exportieren, auch nach Ablauf der Testzeit und bevor du etwas gekauft hast. Eine App, die deine eigenen Aufzeichnungen als Geisel nimmt, wäre es nicht wert, ihr welche anzuvertrauen.',
  },
  {
    q: 'Wie bekomme ich mein Budget auf ein zweites Gerät?',
    a: 'Lass die iCloud-Synchronisierung auf beiden Geräten an, angemeldet mit demselben Apple-Account. Die Daten reisen durch deine eigene private iCloud-Datenbank — wir halten nie eine Kopie — und du kannst das in den Einstellungen abschalten, dann bleibt alles lokal.',
  },
  {
    q: 'Ich habe bezahlt, aber die App ist weiter schreibgeschützt.',
    a: 'Nimm „Kauf wiederherstellen“ auf dem Kaufbildschirm, angemeldet mit dem Apple-Account, mit dem du gekauft hast. Der Kauf hängt am Account, nicht am Gerät: neu installieren oder auf ein neues Gerät wechseln kostet dich nichts.',
  },
  {
    q: 'Wie bekomme ich eine Rückerstattung?',
    a: 'Käufe und Rückerstattungen wickelt Apple ab, nicht wir. Melde das Problem bei Apple und wähle den Kauf aus:',
    link: {
      href: 'https://reportaproblem.apple.com',
      label: 'reportaproblem.apple.com',
    },
  },
  {
    q: 'Wenn ich an den Support schreibe, seht ihr dann mein Budget?',
    a: `Nein. Fundkeep hat keinen Server und kein Konto, es gibt also nichts nachzuschlagen. Wir sehen nur, was du selbst in die Nachricht schreibst — bitte schick keine Kontonummern oder Auszüge an ${CONTACT_EMAIL}, solange sie nicht wirklich nötig sind, um das Problem zu erklären.`,
  },
  {
    q: 'Wie melde ich einen Fehler?',
    a: 'Schreib uns, auf welchem Gerät du bist, welche Version von iOS, iPadOS oder macOS darauf läuft, welche Fundkeep-Version in den Einstellungen steht und was du unmittelbar davor gemacht hast. Das reicht meistens, um ihn zu finden.',
  },
];

const fr: FaqItem[] = [
  {
    q: 'Sur quels appareils Fundkeep fonctionne-t-il ?',
    a: `${PLATFORMS.fr}. Il faut ${RELEASE.requires} ou une version plus récente. Un seul achat couvre les trois.`,
  },
  {
    q: 'Combien ça coûte ?',
    a: `${MARKETS.fr.full} sur l’App Store français — un achat, pas un abonnement. Il n’y a rien d’autre à payer, aucune formule au-dessus, et aucun compte à maintenir en vie.`,
  },
  {
    q: 'Puis-je l’essayer avant de payer ?',
    a: `Oui. Fundkeep est utilisable gratuitement pendant ${TRIAL.days} jours sans rien retenir : toutes les fonctions, aucun filigrane, aucune relance.`,
  },
  {
    q: `Que se passe-t-il après les ${TRIAL.days} jours ?`,
    a: 'L’application passe en lecture seule jusqu’à l’achat. Tout ce que vous avez saisi reste visible — tableau, historique, rapports — et l’export CSV continue de fonctionner. La saisie reprend dès que vous débloquez. L’essai se compte à partir du premier lancement et ce n’est pas un abonnement : rien ne se renouvelle, puisqu’il n’y a rien à renouveler.',
  },
  {
    q: 'Fundkeep se connecte-t-il à ma banque ?',
    a: 'Non, et c’est un choix, pas un chantier. L’app ne demande aucun identifiant bancaire et n’a aucune intégration bancaire. Les opérations entrent de deux façons : vous les saisissez, ou vous exportez un relevé CSV depuis votre banque et choisissez ce fichier — il est lu sur votre appareil, et vous voyez chaque ligne avant tout enregistrement.',
  },
  {
    q: 'Puis-je reprendre mon budget depuis une autre application ?',
    a: 'Oui, si elle sait exporter. Fundkeep lit l’export, reconstruit catégories, comptes et historique, puis vous montre un rapport de rapprochement : ce que l’autre app annonçait comme solde, ce que Fundkeep en fait, et chaque écart trouvé. Vous vérifiez les chiffres avant de les valider.',
  },
  {
    q: 'Puis-je récupérer mes données ?',
    a: 'Tout s’exporte en CSV, à tout moment, y compris après la fin de l’essai et avant tout achat. Une application qui retiendrait vos propres écritures ne mériterait pas qu’on les lui confie.',
  },
  {
    q: 'Comment mettre mon budget sur un deuxième appareil ?',
    a: 'Laissez la synchronisation iCloud activée sur les deux appareils, connectés au même compte Apple. Les données passent par votre propre base iCloud privée — nous n’en gardons jamais de copie — et vous pouvez la désactiver dans les réglages pour tout garder en local.',
  },
  {
    q: 'J’ai payé, mais l’app reste en lecture seule.',
    a: 'Utilisez « Restaurer les achats » sur l’écran d’achat, connecté au compte Apple qui a servi à acheter. L’achat est lié au compte et non à l’appareil : réinstaller ou changer d’appareil ne coûte rien.',
  },
  {
    q: 'Comment demander un remboursement ?',
    a: 'Les achats et les remboursements sont gérés par Apple, pas par nous. Signalez le problème à Apple et choisissez l’achat :',
    link: {
      href: 'https://reportaproblem.apple.com',
      label: 'reportaproblem.apple.com',
    },
  },
  {
    q: 'Si j’écris à l’assistance, voyez-vous mon budget ?',
    a: `Non. Fundkeep n’a ni serveur ni compte : il n’y a rien à consulter. Nous ne voyons que ce que vous mettez vous-même dans le message — merci de ne pas envoyer de numéros de compte ni de relevés à ${CONTACT_EMAIL} s’ils ne sont pas vraiment nécessaires pour expliquer le problème.`,
  },
  {
    q: 'Comment signaler un bug ?',
    a: 'Écrivez en indiquant votre appareil, la version d’iOS, d’iPadOS ou de macOS, la version de Fundkeep affichée dans les réglages, et ce que vous veniez de faire. Cela suffit en général à le retrouver.',
  },
];

const ja: FaqItem[] = [
  {
    q: 'どのデバイスで使えますか？',
    a: `${PLATFORMS.ja}。${RELEASE.requires} 以降が必要です。1回の購入で3つとも使えます。`,
  },
  {
    q: 'いくらですか？',
    a: `日本の App Store で ${MARKETS.ja.full} の買い切りです。サブスクではありません。追加の支払いも、上位プランも、維持しておくアカウントもありません。`,
  },
  {
    q: '買う前に試せますか？',
    a: `はい。${TRIAL.days}日間、何も制限せずに使えます。すべての機能が使え、透かしも催促もありません。`,
  },
  {
    q: `${TRIAL.days}日を過ぎるとどうなりますか？`,
    a: '購入するまで読み取り専用になります。入力したものは見られたままで——一覧も履歴もレポートも——CSV の書き出しも動きます。購入すればその場で入力を再開できます。体験期間は初回起動から数え、サブスクではないので自動更新もありません。更新するものがないからです。',
  },
  {
    q: '銀行につながりますか？',
    a: 'いいえ。未完成なのではなく、そう決めています。銀行のログイン情報は一切求めず、銀行連携の仕組みも持っていません。取引は2通りで入ります。自分で入力するか、銀行から書き出した CSV を自分で選ぶかです。読み取りは端末の中で行われ、保存前にすべての行を確認できます。',
  },
  {
    q: '他の家計簿アプリから移せますか？',
    a: 'はい、書き出しができるアプリなら。Fundkeep はその書き出しを読み、カテゴリ・口座・履歴を作り直し、照合レポートを見せます。相手のアプリが示していた残高、Fundkeep が計算した残高、そして見つかった差のすべてです。確定させる前に数字を確認できます。',
  },
  {
    q: 'データは取り出せますか？',
    a: 'いつでも CSV に書き出せます。体験期間が終わったあとも、何も購入していない段階でも同じです。自分の記録を人質に取るアプリは、記録を預けるに値しません。',
  },
  {
    q: '2台目に家計を移すには？',
    a: '両方の端末で iCloud 同期を入れたまま、同じ Apple アカウントでサインインしてください。データは自分の非公開の iCloud データベースを通ります。こちらが写しを持つことはありません。設定で切れば、すべて端末の中だけに留まります。',
  },
  {
    q: '購入したのに読み取り専用のままです。',
    a: '購入画面の「購入を復元」を、購入したときの Apple アカウントでサインインした状態で使ってください。購入は端末ではなくアカウントに紐づくので、再インストールや機種変更で費用はかかりません。',
  },
  {
    q: '返金はどうすればいいですか？',
    a: '購入と返金は私たちではなく Apple が扱います。Apple に問題を報告し、該当の購入を選んでください：',
    link: {
      href: 'https://reportaproblem.apple.com',
      label: 'reportaproblem.apple.com',
    },
  },
  {
    q: 'サポートにメールしたら、家計の中身は見えますか？',
    a: `いいえ。Fundkeep にはサーバーもアカウントもないので、調べようがありません。見えるのは、あなたがメッセージに自分で書いた内容だけです。問題の説明に本当に必要でないかぎり、口座番号や明細を ${CONTACT_EMAIL} に送らないでください。`,
  },
  {
    q: '不具合はどう報告すればいいですか？',
    a: 'お使いの機種、iOS・iPadOS・macOS のバージョン、設定画面に出ている Fundkeep のバージョン、そして直前に何をしていたかを書いて送ってください。たいていはそれで見つかります。',
  },
];

export const SUPPORT_FAQ_I18N: Record<'de' | 'fr' | 'ja', FaqItem[]> = { de, fr, ja };
