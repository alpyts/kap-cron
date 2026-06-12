import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface KapDisclosure {
  publishDate: string | null;
  fundCode: string | null;
  kapTitle: string | null;
  isOldKap: boolean;
  disclosureClass: string;
  disclosureType: string;
  disclosureCategory: string;
  summary: string | null;
  subject: string | null;
  relatedStocks: string | null;
  year: number | null;
  ruleType: string;
  period: string | null;
  disclosureIndex: number;
  isLate: boolean;
  stockCodes: string | null;
  hasMultiLanguageSupport: boolean;
  attachmentCount: number;
  modifyStatus: string | null;
}

type KapResponse = KapDisclosure[] | { data?: KapDisclosure[] };

async function fetchKapAndEmail() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 7 * 86400000)
      .toISOString()
      .slice(0, 10);

    const res = await fetch(
      "https://www.kap.org.tr/tr/api/disclosure/members/byCriteria",
      {
        method: "POST",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromDate: yesterday,
          toDate: today,
          memberType: "IGS",
          mkkMemberOidList: [],
          inactiveMkkMemberOidList: [],
          disclosureClass: "ODA",
          subjectList: [
            "8aca490d513475640151347f817d0064",
            "8aca490d513475640151348064c3006e",
            "8aca490d513475640151348149780081",
          ],
          isLate: "",
          mainSector: "",
          sector: "",
          subSector: "",
          marketOid: "",
          index: "",
          bdkReview: "",
          bdkMemberOidList: [],
          year: "",
          term: "",
          ruleType: "",
          period: "",
          fromSrc: false,
          srcCategory: "",
          disclosureIndexList: [],
        }),
      }
    );

    const data = (await res.json()) as KapResponse;
    const items: KapDisclosure[] = Array.isArray(data) ? data : data.data ?? [];

    const html = items.length
      ? `<ul>${items
          .map((d) => {
            const url = d.disclosureIndex
              ? `https://kap.org.tr/tr/Bildirim/${d.disclosureIndex}`
              : null;
            const count = Number(d.attachmentCount ?? 0);
            const badge =
              count > 0
                ? `<span style="display:inline-block;background:#fff3b0;color:#5a4500;padding:2px 8px;margin-left:6px;border-radius:10px;font-size:12px;font-weight:bold;border:1px solid #e6c84a;">📎 ${count} ek</span>`
                : `<span style="display:inline-block;background:#eee;color:#777;padding:2px 8px;margin-left:6px;border-radius:10px;font-size:12px;">📎 0</span>`;
            const titleHtml = url
              ? `<a href="${url}" style="color:#0a66c2;text-decoration:none;"><b>${
                  d.kapTitle ?? "—"
                }</b></a>`
              : `<b>${d.kapTitle ?? "—"}</b>`;
            const idHtml = url
              ? `<a href="${url}" style="color:#0a66c2;">${d.disclosureIndex}</a>`
              : d.disclosureIndex ?? "—";
            return `
      <li>
        ${titleHtml}${badge}<br/>
        <b>Konu:</b> ${d.subject ?? "—"}<br/>
        <b>Özet:</b> ${d.summary ?? "—"}<br/>
        <b>Hisse:</b> ${d.stockCodes ?? "—"}<br/>
        <b>Tarih:</b> ${d.publishDate ?? "—"}<br/>
        <b>Bildirim No:</b> ${idHtml}
      </li><hr/>
    `;
          })
          .join("")}</ul>`
      : "<p>Son 7 günde yeni MDV bildirim bulunamadı.</p>";

    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: process.env.TO_EMAIL!,
      subject: `KAP Bildirimleri — ${yesterday} / ${today}`,
      html: `<h2>KAP IGS Bildirimleri</h2><p>Tarih: ${today}</p>${html}`,
    });
    console.log(result, "res of mail send");

    console.log(
      `[${new Date().toISOString()}] Email sent — ${items.length} items`
    );
  } catch (err) {
    console.log(err);
  }
}

fetchKapAndEmail().catch((err) => {
  console.error(err);
  process.exit(1);
});
