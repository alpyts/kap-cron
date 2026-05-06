import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function fetchKapAndEmail() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);

    const res = await fetch(
      "https://www.kap.org.tr/tr/api/disclosure/members/byCriteria",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromDate: yesterday,
          toDate: today,
          memberType: "IGS",
          subjectList: ["8aca490d513475640151347f817d0064"],
        }),
      }
    );

    const data = await res.json();
    const items = Array.isArray(data) ? data : data?.data ?? [];

    const html = items.length
      ? `<ul>${items
          .map(
            (d: any) => `
      <li>
        <b>${d.kapTitle ?? "—"}</b><br/>
        <b>Konu:</b> ${d.subject ?? "—"}<br/>
        <b>Özet:</b> ${d.summary ?? "—"}<br/>
        <b>Hisse:</b> ${d.stockCodes ?? "—"}<br/>
        <b>Tarih:</b> ${d.publishDate ?? "—"}<br/>
        <b>Bildirim No:</b> ${d.disclosureIndex ?? "—"}
      </li><hr/>
    `
          )
          .join("")}</ul>`
      : "<p>Bugün yeni bildirim bulunamadı.</p>";

    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: process.env.TO_EMAIL!,
      subject: `KAP Bildirimleri — ${today}`,
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

await fetchKapAndEmail();
