*** https://github.com/batuhan-elibuyuk/kap-cron/settings/secrets/actions to change secrets ***

# kap-cron

A scheduled job that fetches daily disclosures from KAP (Kamuyu Aydınlatma Platformu) and emails a digest via Resend.

## KAP API

KAP exposes two parallel disclosure-search endpoints — one for company filings, one for fund filings. Both accept a JSON criteria object and return an array of disclosure objects.

### Endpoints

| Tab | Method | Path |
| --- | --- | --- |
| Şirket Bildirimi | `POST` | `https://www.kap.org.tr/tr/api/disclosure/members/byCriteria` |
| Fon Bildirimi | `POST` | `https://www.kap.org.tr/tr/api/disclosure/funds/byCriteria` |

### Şirket Bildirimi — request body

Full schema with empty defaults:

```json
{
  "fromDate": "YYYY-MM-DD",
  "toDate": "YYYY-MM-DD",
  "memberType": "IGS",
  "mkkMemberOidList": [],
  "inactiveMkkMemberOidList": [],
  "disclosureClass": "",
  "subjectList": [],
  "isLate": "",
  "mainSector": "",
  "sector": "",
  "subSector": "",
  "marketOid": "",
  "index": "",
  "bdkReview": "",
  "bdkMemberOidList": [],
  "year": "",
  "term": "",
  "ruleType": "",
  "period": "",
  "fromSrc": false,
  "srcCategory": "",
  "disclosureIndexList": []
}
```

#### Field reference (Şirket)

| Field | Type | Türkçe | Description |
| --- | --- | --- | --- |
| `fromDate` | string `YYYY-MM-DD` | Başlangıç tarihi | Range start |
| `toDate` | string `YYYY-MM-DD` | Bitiş tarihi | Range end |
| `memberType` | string | Şirket grubu (`IGS`, `YK`, `PYS`…) | See table below |
| `mkkMemberOidList` | string[] | Aktif şirket OID listesi | Active company OIDs (Şirketler multi-select) |
| `inactiveMkkMemberOidList` | string[] | Pasif şirket OID listesi | Inactive / old-KAP company OIDs |
| `disclosureClass` | string | Bildirim sınıfı (`FR`, `ODA`, `DG`, `DUY`) | See table below |
| `subjectList` | string[] | Konu OID listesi (`subjectOid`) | OID values from the tables at the bottom of this README |
| `isLate` | string | Geç bildirim filtresi | `"true"` / `"false"` / `""` |
| `mainSector` | string | Ana sektör OID'i | — |
| `sector` | string | Sektör OID'i | Set when a sub-sector is chosen |
| `subSector` | string | Alt sektör OID'i | — |
| `marketOid` | string | Pazar OID'i | See table below |
| `index` | string | Endeks OID'i | e.g. `33E5FED8013D00EAE0530A4A622B2AEA` for BIST 100 (XU100) |
| `bdkReview` | string | BDK incelemesi | — |
| `bdkMemberOidList` | string[] | BDK üye OID listesi | Used when `memberType="BDK"` |
| `year` | string | Yıl | Period filter (used with `disclosureClass="FR"`) |
| `term` | string | Dönem | Period filter |
| `ruleType` | string | Kural tipi | Period filter |
| `period` | string | Periyot | Period filter |
| `fromSrc` | boolean | SRC kaynağından mı | Source-filter switch |
| `srcCategory` | string | SRC kategori | — |
| `disclosureIndexList` | number[] | Bildirim indeks listesi | Direct lookup by `disclosureIndex` |

#### `memberType` — Şirket Grubu

| UI label | Value |
| --- | --- |
| İşlem Gören Şirketler | `IGS` |
| Yatırım Kuruluşları | `YK` |
| Portföy Yönetim Şirketleri | `PYS` |
| Derecelendirme Şirketleri | `DCS` |
| Bağımsız Denetim Kuruluşları | `BDK` |
| Düzenleyici Denetleyici Kurumlar | `DDK` |
| Diğer KAP Üyeleri | `DK` |
| Kripto Varlık Hizmet Sağlayıcı | `KVH` |

#### `disclosureClass` — Bildirim Tipi

| UI label | Value |
| --- | --- |
| Tüm Bildirimler | `""` (empty string) |
| Finansal Raporlar | `FR` |
| Özel Durum Açıklamaları | `ODA` |
| Düzenleyici Kurum Bildirimleri | `DUY` |
| Diğer | `DG` |

#### `marketOid` — Pazar

| Pazar | marketOid |
| --- | --- |
| YILDIZ PAZAR | `4028328c6d92933b016e21b838963f42` |
| ANA PAZAR | `33E5FED802CC00EAE0530A4A622B2AEA` |
| ALT PAZAR | `4028328c6d92933b016e21b91b463f54` |
| YAKIN İZLEME PAZARI | `33E5FED802BE00EAE0530A4A622B2AEA` |
| PİYASA ÖNCESİ İŞLEM PLATFORMU | `33E5FED802B000EAE0530A4A622B2AEA` |
| YAPILANDIRILMIŞ ÜRÜNLER VE FON PAZARI | `33E5FED802B700EAE0530A4A622B2AEA` |
| GİRİŞİM SERMAYESİ PAZARI | `4028328c5fc60da8015fde393e673cb9` |
| EMTİA PAZARI | `4028328d8588f3000185aa66a9aa1e27` |
| KESİN ALIM SATIM PAZARI | `33E5FED802A900EAE0530A4A622B2AEA` |
| KESİN ALIM SATIM PAZARI-NİTELİKLİ YATIRIMCILAR ARASINDA | `33E5FED802DA00EAE0530A4A622B2AEA` |
| GÖZALTI PAZARI | `4028328c5fc60da701600c24c7b46ea0` |

#### Sample bodies (Şirket)

```json
// Pazar filter (YILDIZ PAZAR)
{
  "fromDate": "2026-05-09", "toDate": "2026-05-09",
  "memberType": "IGS", "mkkMemberOidList": [], "inactiveMkkMemberOidList": [],
  "disclosureClass": "", "subjectList": [], "isLate": "",
  "mainSector": "", "sector": "", "subSector": "",
  "marketOid": "4028328c6d92933b016e21b838963f42",
  "index": "", "bdkReview": "", "bdkMemberOidList": [],
  "year": "", "term": "", "ruleType": "", "period": "",
  "fromSrc": false, "srcCategory": "", "disclosureIndexList": []
}
```

```json
// Endeks + Bildirim Tipi combined (ODA disclosures from BIST 100)
{
  "fromDate": "2026-05-09", "toDate": "2026-05-09",
  "memberType": "IGS", "mkkMemberOidList": [], "inactiveMkkMemberOidList": [],
  "disclosureClass": "ODA",
  "subjectList": [], "isLate": "",
  "mainSector": "", "sector": "", "subSector": "",
  "marketOid": "",
  "index": "33E5FED8013D00EAE0530A4A622B2AEA",
  "bdkReview": "", "bdkMemberOidList": [],
  "year": "", "term": "", "ruleType": "", "period": "",
  "fromSrc": false, "srcCategory": "", "disclosureIndexList": []
}
```

```json
// Specific Konu (Finansal Rapor)
{
  "fromDate": "2026-05-09", "toDate": "2026-05-09",
  "memberType": "IGS", "mkkMemberOidList": [], "inactiveMkkMemberOidList": [],
  "disclosureClass": "FR",
  "subjectList": ["4028328c594bfdca01594c0af9aa0057"],
  "isLate": "",
  "mainSector": "", "sector": "", "subSector": "",
  "marketOid": "", "index": "", "bdkReview": "", "bdkMemberOidList": [],
  "year": "", "term": "", "ruleType": "", "period": "",
  "fromSrc": false, "srcCategory": "", "disclosureIndexList": []
}
```

```json
// Sektör (mainSector OID — DİĞER)
{
  "fromDate": "2026-05-09", "toDate": "2026-05-09",
  "memberType": "IGS", "mkkMemberOidList": [], "inactiveMkkMemberOidList": [],
  "disclosureClass": "", "subjectList": [], "isLate": "",
  "mainSector": "33E5FED802E100EAE0530A4A622B2AEA",
  "sector": "", "subSector": "",
  "marketOid": "", "index": "", "bdkReview": "", "bdkMemberOidList": [],
  "year": "", "term": "", "ruleType": "", "period": "",
  "fromSrc": false, "srcCategory": "", "disclosureIndexList": []
}
```

### Fon Bildirimi — request body

Full schema with empty defaults:

```json
{
  "fromDate": "YYYY-MM-DD",
  "toDate": "YYYY-MM-DD",
  "fundTypeList": ["BYF"],
  "mkkMemberOidList": [],
  "fundOidList": [],
  "passiveFundOidList": [],
  "disclosureClass": "",
  "isLate": "",
  "subjectList": [],
  "discIndex": [],
  "fromSrc": false,
  "srcCategory": ""
}
```

#### Field reference (Fon)

| Field | Type | Description |
| --- | --- | --- |
| `fromDate` / `toDate` | string | Date range, `YYYY-MM-DD` |
| `fundTypeList` | string[] | Fon Grubu (single-element array) — see table below |
| `mkkMemberOidList` | string[] | Kurucu Şirket (founder company) OIDs |
| `fundOidList` | string[] | Active fund OIDs (Fonlar multi-select) |
| `passiveFundOidList` | string[] | Terminated fund OIDs (Tasfiye Edilmiş Fonlar) |
| `disclosureClass` | string | Same dictionary as Şirket — `""` / `FR` / `ODA` / `DUY` / `DG` |
| `isLate` | string | `"true"` / `"false"` / `""` |
| `subjectList` | string[] | Same `subjectOid` values as Şirket |
| `discIndex` | number[] | Disclosure-index lookup |
| `fromSrc` | boolean | Source-filter switch |
| `srcCategory` | string | Source category |

#### `fundTypeList` — Fon Grubu

| UI label | Value |
| --- | --- |
| Borsa Yatırım Fonları | `BYF` |
| Yatırım Fonları | `YF` |
| Emeklilik Yatırım Fonları | `EYF` |
| OKS Emeklilik Yatırım Fonları | `OKS` |
| Yabancı Yatırım Fonları | `YYF` |
| Varlık Finansman Fonları | `VFF` |
| Konut Finansman Fonları | `KFF` |
| Gayrimenkul Yatırım Fonları | `GMF` |
| Girişim Sermayesi Yatırım Fonları | `GSF` |
| Proje Finansman Fonları | `PFF` |

### Auxiliary endpoints (used to populate dropdowns)

When **Şirket Grubu** changes, the UI fetches:

| Method | Path | Returns |
| --- | --- | --- |
| `GET` | `/tr/api/company/items/{memberType}/A` | active companies |
| `GET` | `/tr/api/company/items/{memberType}/P` | passive / inactive companies |

When **Fon Grubu** changes:

| Method | Path | Returns |
| --- | --- | --- |
| `GET` | `/tr/api/fund/founder/{fundType}` | founder companies for that fund type |
| `GET` | `/tr/api/fund/criteria/{fundType}/Y` | active funds |
| `GET` | `/tr/api/fund/criteria/{fundType}/T` | terminated funds |

### Response body keys

| Key | Type | Türkçe | Description / Example |
| --- | --- | --- | --- |
| `publishDate` | string | Yayın tarihi | Publication timestamp, e.g. `"08.05.2026 23:17:36"` |
| `fundCode` | string \| null | Fon kodu | e.g. `"XYZ"` when applicable |
| `kapTitle` | string | Şirket / kurum adı | e.g. `"MMC SANAYİ VE TİCARİ..."` |
| `isOldKap` | boolean | Eski KAP kaydı mı | Legacy KAP system flag |
| `disclosureClass` | string | Bildirim sınıfı | `"FR"`, `"ODA"`, `"DG"`, `"DKB"` |
| `disclosureType` | string | Bildirim tipi | `"FR"`, `"ODA"`, `"DG"`, `"CA"`, `"DUY"` |
| `disclosureCategory` | string | Bildirim kategorisi | `"FR"`, `"ODA"`, `"STT"` |
| `summary` | string \| null | Özet açıklama | Short summary |
| `subject` | string | Konu | e.g. `"Finansal Rapor"` |
| `relatedStocks` | string \| null | İlgili hisse senedi kodu | e.g. `"ECZYT"` |
| `year` | number \| null | Yıl | Reporting year, e.g. `2026` |
| `ruleType` | string | Kural tipi / raporlama dönemi | e.g. `"3 Aylık"`, `"Yıllık"`, `"17. Hafta"` |
| `period` | string \| null | Dönem numarası | e.g. `1` |
| `disclosureIndex` | number | Bildirim indeks numarası (unique ID) | e.g. `1603851` |
| `isLate` | boolean | Gecikmiş bildirim mi | — |
| `stockCodes` | string | Hisse kodu(ları) | e.g. `"MMCAS"` |
| `hasMultiLanguageSupport` | boolean | Çok dil desteği var mı | — |
| `attachmentCount` | number | Ek dosya sayısı | e.g. `1` |
| `modifyStatus` | string \| null | Düzenleme durumu | `null`, `"DUZENLENEN"`, `"DUZELTILEN"` |

### Sample item

```json
{
  "publishDate": "05.05.2026 18:56:56",
  "fundCode": null,
  "kapTitle": "ASCE GAYRİMENKUL YATIRIM ORTAKLIĞI A.Ş.",
  "isOldKap": false,
  "disclosureClass": "ODA",
  "disclosureType": "ODA",
  "disclosureCategory": "ODA",
  "summary": "Maddi Duran Varlık Alımı",
  "subject": "Maddi Duran Varlık Alımı",
  "relatedStocks": null,
  "year": null,
  "ruleType": "-",
  "period": null,
  "disclosureIndex": 1601408,
  "isLate": false,
  "stockCodes": "ASGYO",
  "hasMultiLanguageSupport": false,
  "attachmentCount": 1,
  "modifyStatus": null
}
```

## Local development with Bun

### Install Bun

macOS / Linux:

```bash
curl -fsSL https://bun.sh/install | bash
```

Windows (PowerShell):

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Verify:

```bash
bun --version
```

### Environment

Create a `.env` file in the project root:

```env
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=sender@example.com
TO_EMAIL=recipient@example.com
```

### Install dependencies and run

```bash
bun install
bun run index.ts
```

`index.ts` runs `fetchKapAndEmail()` once and exits. Scheduling is handled by GitHub Actions (see `.github/workflows/kap.yml`), which runs the script daily at `0 5 * * *` UTC (08:00 Europe/Istanbul) and is also triggerable manually via `workflow_dispatch`.

Configure these repository secrets for the workflow: `RESEND_API_KEY`, `FROM_EMAIL`, `TO_EMAIL`.

## Run with Docker Compose

### Install Docker on a sudo shell (Ubuntu / Debian)

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo usermod -aG docker $USER
newgrp docker
```

Verify:

```bash
docker --version
docker compose version
```

### Dockerfile

```dockerfile
FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

CMD ["bun", "run", "index.ts"]
```

### docker-compose.yml

```yaml
services:
  kap-cron:
    build: .
    container_name: kap-cron
    restart: unless-stopped
    env_file:
      - .env
    environment:
      TZ: Europe/Istanbul
```

### Bring it up

```bash
docker compose up -d --build
docker compose logs -f kap-cron
```

## `konu` (subject) filter OIDs

The KAP `byCriteria` endpoint accepts a `subjectList` parameter populated with `subjectOid` values. Below are the available subjects, grouped by `disclosureClass`.

### DUY — Düzenleyici Kurum Bildirimleri (78 items)

| Subject | subjectOid |
| --- | --- |
| ABCD Grubu Listeleri | `8aca490d504b7afa01504bb52a42022b` |
| BAP ta İşlem Görecek Menkul Kıymetler | `8aca490d4ff02191014ff030233b0056` |
| BIST Pay Endeksleri | `8aca490d50286f620150287a60580089` |
| BIST-KYD Endeksleri | `4028328d67565e4f0167cbe553261e1d` |
| BISTECH Pay Piyasası Alım Satım Sistemi Duyurusu | `4028328d537aad0a015383f1134c45f2` |
| Birincil Piyasa Duyurusu | `4028328d5988e2630159d974dae62e29` |
| Borçlanma Araçları, Yatırım Fonları ve Varant İtfa/Kupon/Getiri/ Nakdi Uzlaşı Ödeme İşlemleri | `4028328d5428b1ac015432a0a460153e` |
| Borçlanma Araçlarının / Kira Sertifikalarının İşlem Görmeye Başlaması | `4028328d758f60e80175e49ee2101f4e` |
| Borçlanma Araçlarının / Kira Sertifikalarının İşlem Görmeye Başlaması | `4028328c7415763701743530c35c0564` |
| Borçlanma Araçlarının İşlem Görmeye Başlaması | `8aca490d4f4b6fbd014f4b74f0800041` |
| Borsa Genel Müdürlüğü Duyurusu | `8aca490d50287c47015028a4cfbb0169` |
| Borsa İstanbul A.Ş. Duyurusu | `8aca490d507059f201507066aea600e4` |
| Borsa İşlemleri Açısından Hak Kullanım Tarihi | `4028328d5988e2630159d97979182e3e` |
| Borsa Yatırım Fonlarının İşlem Görmeye Başlaması | `8aca490d4ff02191014ff02c26ac0035` |
| Borsa Yönetim Kurulu Kararı | `8aca490d50287c47015028a3e576015f` |
| Borsada İşlem Gören Tipe Dönüşüm Duyurusu | `4028328d69d891c3016ab78398c63991` |
| Borsada İşlem Gören Tipe Dönüşüm Duyurusu | `4028328c550bb44d01550c6f2a2401c2` |
| Dönemsel Değerlendirme Kriteri Duyurusu | `8aca490d504b7afa01504bbb1ab60291` |
| Düzenleyici Kurum Duyurusu | `8aca490d5139ce7401513eb7e0c41884` |
| EBDK (Endekse Bağlı Devre Kesici) Seans Durdurma Bildirimi | `4028328c74157637017435351ba705f6` |
| Endeks Duyurusu | `8aca490d504b7afa01504bb98bcb026a` |
| Endeks Şirketlerinde Değişiklik | `8aca490d4fda2d58014fda4e141f0112` |
| Endekslerde Kullanılan Fiili Dolaşımdaki Pay Oranı Değişiklikleri | `8aca490d4fdb8f76014fdbad16c001a1` |
| Finansal Rapor Ek Süre Taleplerine İlişkin SPK Değerlendirmesi | `8aca490d5066ecc1015066f07ef50009` |
| Fonlara İlişkin Duyuru | `8aca490d4f4b6fbd014f4b77c1430078` |
| Hak Kullanımı | `4028328d5428b1ac0154329d3c4214f6` |
| İstanbul Takas ve Saklama Bankası A.Ş. Duyurusu | `8aca490d507059f201507068adbb0125` |
| İşlem İptali | `8aca490d4fdf2098014fdf26ba7b0074` |
| İşlem Sırası Durdurma Bildirimi - Devre Kesici | `4028328c5fc60da7016007ad193a5e2e` |
| İşlem Sırasının Durumu | `8aca490d50287c47015028b692b001d9` |
| İşlem Sırasının Kapalılık Halinin Devamı | `8aca490d50287c47015028b5b6be01cf` |
| İşlem Yasağı Uygulaması Nedeniyle Kurul Kaydından Çıkartılan Hisse Senetleri | `8aca490d50a470330150a4dffde50196` |
| Kamuyu Aydınlatma Platformu Duyurusu | `8aca490d507059f201507065efec00d1` |
| Kira Sertifikalarının İşlem Görmeye Başlaması | `8aca490d4f4b6fbd014f4b765fb10067` |
| Kod Değişikliği | `8aca490d4fdf3818014fdf3c703e0018` |
| Kottan Çıkarma/İşlem Görmekten Men Etme | `8aca490d504b7afa01504bbef9be02d1` |
| Likidite Sağlayıcı Atanması | `8aca490d504b7afa01504bbbc141029b` |
| Maksimum Lot Miktarı Değişen Paylar | `8aca490d504b7afa01504bb366820207` |
| Merkezi Kayıt Kuruluşu A.Ş. Duyurusu | `8aca490d507059f201507068053f0101` |
| MKK Üye Kod Değişiklikleri | `4028328c550b553a01550b9abcea19b9` |
| MKK Üye Statü Değişikliği&nbsp; | `8aca490d50a470330150a4e152bb01aa` |
| MKK Üyeliği | `8aca490d5098bb5d015098c10b180028` |
| Nitelikli Yatırımcıya İhraç Pazarında Satılacak Borçlanma Araçları | `8aca490d4ff02191014ff03217f10067` |
| Nitelikli Yatırımcıya İhraç Pazarında Satılacak Kira Sertifikaları | `4028328c56a4100301570980f46f4a5f` |
| Özsermaye Hallerine İlişkin Borsa Duyurusu | `4028328c550b553a01550b99fb5119ac` |
| Pay İşlem Sırası Kapatma / Açma | `4028328c5fc60da7016007a0bd395db0` |
| Pay Mali Hak Kullanım İşlemi - Nakit Ödeme | `4028328d5428b1ac0154329fed2f1517` |
| Pay Mali Hak Kullanım İşlemi - Nakit Ödeme | `4028328c5313b7ee015318ff82ab0302` |
| Payların Borsa Birincil Piyasada Halka Arzı | `8aca490d4ff02191014ff0375bd800b1` |
| Payların İşlem Görmeye Başlaması | `8aca490d4ff02191014ff03637790093` |
| Pazar Değişikliği | `8aca490d50666e6d0150669b6de101c4` |
| Piyasa Yapıcı Atanması | `8aca490d4fdf3818014fdf3d8e1a002a` |
| Rüçhan Hakkı Kupon Pazarı Tarihi | `8aca490d50dcb2da0150dcbe56830077` |
| Rüçhan Hakkı Referans Fiyatı | `8aca490d4ff02191014ff03955d700ca` |
| Sermaye Piyasası Kurulu Başvuru Sonucu (Haziran 2016 öncesi) | `4028328d552fd7b10155347092d11679` |
| Sermaye Piyasası Kurulu Başvurusu (Haziran 2016 öncesi) | `4028328d552fd7b101553473a87716cd` |
| Sermaye Piyasası Kurulu Duyurusu | `8aca490d507059f201507067721700f2` |
| Sermaye Piyasası Kurulu Tedbir Kararı | `8aca490d504b7afa01504bbff27602e3` |
| SPK Bülteni | `8aca490d504b7afa01504bb43c91021c` |
| SPK İşlem Yasağı Nedeniyle Pay Duyurusu | `4028328c550bb44d01550c70385001d1` |
| Şirketin Uyarılması | `8aca490d50287c470150287ec35c0021` |
| Takasbank Ödünç Pay Piyasası Günlük Bülten | `8aca490d50287c47015028b8760f01f4` |
| Takasbank Para Piyasası Günlük Bülten | `8aca490d50287c47015028b9214a01fe` |
| Temerrüt İşlemi | `8aca490d504b7afa01504bbc615e02ab` |
| Test Bildirimi | `4028328c53a8caba0153acc7ba60185d` |
| Toptan Alış Satış İşlemi | `4028328d5988e2630159d97ddb592e4b` |
| Varant Duyuruları | `8aca490d504b7afa01504bbd140b02bb` |
| Varantların veya Sertifikaların İşlem Görmeye Başlaması | `8aca490d4ff02191014ff02e05f3004c` |
| VİOP Diğer Duyurular | `4028328c75e6e8cb0175e7200b1603a8` |
| VİOP Gün İçi Fiyat Limiti Değişikliği Duyuruları | `4028328c75e6e8c90175e71e2a160496` |
| VİOP İşlem İptali Duyuruları | `8aca490d504b7afa01504bb8de130253` |
| VİOP Özsermaye Hali Duyuruları | `4028328c75e6e8c90175e717ac710473` |
| VİOP Seans Durdurma Duyuruları | `4028328c75e6e8c90175e71af6b60484` |
| VİOP Son İşlem Günü ve Vade Sonu Duyuruları | `8aca490d504b7afa01504bb5dc600235` |
| Yabancı Yatırımcı İşlemleri | `8aca490d504b7afa01504bb286c401f3` |
| Yapılandırılmış Borçlanma Araçlarının İşlem Görmeye Başlaması | `8aca490d4ff02191014ff035141f0075` |
| Yatırımcı Bazında Tedbir Sistemi | `4028328d5988e2630159d98178ce2e5d` |
| Yatırımcı Tazmin Merkezi Duyurusu | `4028328d537aad0a015383eedbc545e8` |

### ODA — Özel Durum Açıklamaları (68 items)

| Subject | subjectOid |
| --- | --- |
| Ana Faaliyet Konusu Değişikliği | `8aca490d5066ecc1015066f2572f0016` |
| Ayrılma Hakkı Kullanımına İlişkin Bildirim | `8aca490d505b707301505bc479830188` |
| Bağımsız Denetim Kuruluşunun Belirlenmesi | `8aca490d5134756401513481f2e30092` |
| Bağımsız Denetim Raporunun Olumsuz Görüş İçermesi veya Görüş Bildirmekten Kaçınılması | `srp2205201508` |
| Bilgilendirme Politikası | `srp2205201509` |
| Birleşme | `4028328d5988e2630159d5ff460b200c` |
| Borsa Kotundan Çıkmaya İlişkin Bildirim | `8aca490d504d0bea01504d339cfa00a9` |
| Bölünme | `4028328d5988e2630159d5e90bc21e73` |
| Çalışanlara Aylık Ücret Dışında Yapılan Ödemeler | `srp2205201524` |
| Devrolma | `4028328d5988e2630159d5f6c44b1fa0` |
| Diğer Nakit Ödemeye İlişkin Bildirim | `8aca490d505b707301505bc56ba3019f` |
| Diğer Pay İhracı - İptaline İlişkin Bildirim | `8aca490d505b707301505bc66d7601b4` |
| Esas Sözleşme Tadili | `8aca490d507059f201507069926e0138` |
| Faaliyetlerin Kısmen veya Tamamen Durdurulması ya da İmkansız Hale Gelmesi | `srp2205201504` |
| Faaliyetlerin veya Gelirlerin Yoğunlaştığı Şehir Değişikliği | `8aca490d5066ecc1015066f509150041` |
| Finansal Duran Varlık Edinimi | `8aca490d513475640151347dccb10032` |
| Finansal Duran Varlık Satışı | `8aca490d513475640151347eb1020041` |
| Finansal Tablo ve-veya Dipnot Değişikliği | `srp2205201506` |
| Geleceğe Dönük Değerlendirmeler | `srp2205201510` |
| Genel Kurul | `4028328d5988e2630159d5f7a0eb1fad` |
| Geri Alınan Payların Elden Çıkarılması | `4028328d6233239a01629b6924285677` |
| Haber ve Söylentilere İlişkin Açıklama | `srp2205201511` |
| Hak Kullanım Süreç İptal Bildirimi | `8aca490d5012e44201501425fd720b1c` |
| Halka Arz İşlemlerinde Sermaye Piyasası Aracının % 5 inden Fazlasını Satın Alanlara İlişkin Bildirim | `8aca490d50669f2f015066be576c0285` |
| İcra Takipleri | `srp2205201513` |
| İflas/İflas Erteleme | `4028328d5988e2630159d5f93b381fc4` |
| İhale Süreci / Sonucu | `srp2205201523` |
| İhraç Tavanına İlişkin Bildirim | `8aca490d50d783d10150d7ccc7b103f9` |
| İlişkili Taraf İşlemleri | `srp2205201521` |
| Kar Dağıtım Politikası | `srp2205201519` |
| Kar Payı Avansı Ödemesi İşlemlerine İlişkin Bildirim | `8aca490d4f64d803014f6523fdbd04c1` |
| Kar Payı Dağıtımı | `4028328d5988e2630159d5fb51c81fe6` |
| Kayıtlı Sermaye Tavanı İşlemlerine İlişkin Bildirim | `8aca490d4f688a00014f68a360550099` |
| Kredi Derecelendirmesi | `srp2205201520` |
| Kurumsal Yönetim İlkelerine Uyum Derecelendirmesi | `srp2205201515` |
| Maddi Duran Varlık Alımı | `8aca490d513475640151347f817d0064` |
| Maddi Duran Varlık Kiraya Verilmesi veya Ayni Hak Tesisi | `8aca490d513475640151348149780081` |
| Maddi Duran Varlık Satımı | `8aca490d513475640151348064c3006e` |
| Olağan Dışı Fiyat ve Miktar Hareketleri | `srp2205201518` |
| Ortaklık Aleyhine Dava Açılması veya Davaya İlişkin Gelişmeler | `8aca490d5075d480015075d8affa0017` |
| Ortaklıktan Çıkarma ve Satma Hakkına İlişkin Bildirim | `8aca490d5094db30015094ec127c005a` |
| Özel Durum Açıklaması (Genel) | `srp2205201501` |
| Pay Alım Satım Bildirimi | `8aca490d50286f620150287614ae005c` |
| Pay Alım Teklifi Yoluyla Pay Toplanmasına İlişkin Bildirim | `8aca490d505638d60150564a38c8001e` |
| Pay Dışı Sermaye Piyasası Aracı Alım Satım Bildirimi | `4028328d537aad0a015383f2b00e4610` |
| Pay Dışında Sermaye Piyasası Aracı İşlemlerine İlişkin Bildirim (Faiz İçeren) | `8aca490d50dc70440150dc7ce5d000b3` |
| Pay Dışında Sermaye Piyasası Aracı İşlemlerine İlişkin Bildirim (Faizsiz) | `8aca490d50dc70440150dc7daa5300d6` |
| Pay Dönüşümü İşlemlerine İlişkin Bildirim | `srp0906201502` |
| Payların Geri Alınmasına İlişkin Bildirim | `4028328d6233239a01629b43e4694fae` |
| Payların Konu Edildiği Sermaye Piyasası Araçlarına İlişkin Bildirim | `8aca490d5075d480015075daf1dc0035` |
| Pazar Geçiş Başvurusu | `8aca490d5075d480015075dbb357003f` |
| Piyasa Danışmanı Değişikliği | `8aca490d5075d480015075ff6c070049` |
| Satışa Hazır Bekletilen Paylara İlişkin Bildirim | `8aca490d504d0bea01504d2fcca8009e` |
| Sermaye Artırımı/Azaltımı | `4028328d5988e2630159d5fd68661ff4` |
| Sermaye Piyasası Araçlarına İlişkin Satış Öncesi Bildirim | `8aca490d5075d480015075d7089a0003` |
| Sözleşme Feshi | `8aca490d5134756401513484db8700e3` |
| Sözleşme İmzalanması | `8aca490d513475640151348617b500ff` |
| Şirket Merkezi Değişikliği | `8aca490d5066ecc1015066f39ad10032` |
| Teknik Yönetime İlişkin Açıklama | `8aca490d513475640151348438d800c7` |
| Toptan Alış Satış İşlemi Bildirimi | `4028328d537aad0a015383f19cb945fc` |
| Transfer Görüşmeleri | `8aca490d5134756401513482ac9200ab` |
| Transfer Görüşmelerinin Sonuçlanması veya Sona Ermesi | `8aca490d51347564015134836f5600b5` |
| TTK'nın 376. Maddesi Kapsamında Yapılan İşlemler | `8aca490d4f2c5b17014f2c8609930167` |
| Ünvan Değişikliği | `srp2205201502` |
| Varlıkların Zarara Uğraması | `8aca490d4f2c5b17014f2c7f249f0135` |
| Yatırım Kuruluşu Varant - Sertifika - Senetlerine İlişkin Bildirim | `srp2205201512` |
| Yeni İş İlişkisi | `srp2205201503` |
| Yönetim Kurulu Komiteleri | `srp2205201522` |

### DG — Diğer (51 items)

| Subject | subjectOid |
| --- | --- |
| Alma Hakkı Kullanımına İlişkin Duyuru | `8aca490d5134756401513486e0940112` |
| Aracılık Hizmetleri İçin Ödenen Komisyonlar | `8aca490d4f2c899f014f2c92a2b3000c` |
| Arz Programı İzahnamesi | `8aca490d50669f2f015066a168e30005` |
| Arz Programı Sirküleri | `8aca490d50669f2f015066a287e8000f` |
| Aylık Bildirim | `8aca490d4f308810014f30902bfb0018` |
| Borsa İstanbul A.Ş.de İşlem Görme Bilgi Formu | `8aca490d51458dcf0151483bacdf062f` |
| Borsa İstanbul A.Ş.de İşlem Görme Duyurusu | `8aca490d51458dcf0151484001f70645` |
| Değerleme Raporu | `8aca490d4f303c4d014f308187f200ab` |
| Dışarıdan Sağlanan Hizmetler ve Personel İçin Ödenen Komisyon ve Ücretler | `8aca490d50669f2f015066bcd272025d` |
| Esas Sözleşme | `8aca490d4f91c125014f922a30940415` |
| Faaliyet İzinlerinin İptali veya Faaliyet İzinlerinden Tamamen Feragat Edilmesi | `4028328c969f295c019769887ecc2a36` |
| Faaliyetlerin Geçici Olarak Durdurulması | `8aca490d4f2c5b17014f2c80a8e0013f` |
| Finansal Takvim | `4028328c69a8545e0169ceb480335e5c` |
| Fiyat Tespit Raporu | `8aca490d4f303c4d014f307f22e200a3` |
| Fiyat Tespit Raporuna İlişkin Analist Raporu (Halka Arza Aracılık Eden Kuruluş Dışında...) | `8aca490d504d0bea01504d18e8e00068` |
| Fiyat Tespit Raporuna İlişkin Analist Raporu (Halka Arza Aracılık Eden Kuruluş Tarafından...) | `8aca490d504d0bea01504d1c0d000072` |
| Genel Açıklama | `4028328d537aad0a015383f3278846a8` |
| Haftalık Rapor | `8aca490d4f2c5b17014f2c763ab000f6` |
| Halka Arz Fiyatının Belirlenmesinde Esas Alınan Varsayımlara İlişkin Değerlendirme Raporu | `8aca490d504d0bea01504d1e46ad0080` |
| Halka Arz Sonuçları | `8aca490d504d0bea01504d161a07005a` |
| Herhangi Bir Otoriteye Mali Tablo Verilmesi | `srp2205201505` |
| İç Yönerge | `8aca490d4f2c5b17014f2c6921c500a6` |
| İhraç Belgesi | `8aca490d4f2c5b17014f2c7d60270120` |
| İzahname (SPK Onayına Sunulan) | `4028328d5988e2630159d9aebd742fd4` |
| İzahname (SPK Tarafından Onaylanan) | `4028328d5988e2630159d9b261b72ffe` |
| İzahname veya İzahnameyi Oluşturan Belgelerde Değişiklik - Ekleme | `8aca490d507059f201507070951401c1` |
| Karşılaştırma Ölçütü Belirlenmesi veya Değiştirilmesi | `8aca490d4f2c5b17014f2c7bb8e90116` |
| Katılım Finansı İlkeleri Bilgi Formu | `4028328d81fdc61d01826e8d0acd1723` |
| Kurumsal Yönetim Uyum Raporu | `4028328d67cc95f90167cfae47dd0e37` |
| Likidite Sağlayıcılık Kapsamındaki İşlemler | `4028328c54571a3401545bdcfed51af7` |
| Ortak Promosyonu Uygulaması Süreci veya Sonucu | `4028328d6233239a01629b6b5ee756f7` |
| Pay Dışında Sermaye Piyasası Aracı İşlemlerine İlişkin Bildirim (Faizsiz) | `8aca490d50dc70440150dc7f0fab00d8` |
| Pay Satış Bilgi Formu | `8aca490d5075d480015075d968a70021` |
| Performans Sunuş Raporu | `8aca490d4f2c5b17014f2c7a18e1010c` |
| Piyasa Yapıcılığı Kapsamında Gerçekleştirilen İşlemler Bildirimi | `4028328c7b0e75d4017b1094d9bb0002` |
| Portföy İçin Yapılan İşlemlerden Sağlanan Menfaatler | `8aca490d4f2c5b17014f2c8231880149` |
| Portföy Sınırlamalarına Uyumun Kontrolü | `4028328d9d4a0485019d770ab5ac410e` |
| Portföy Sınırlamalarına Uyumun Kontrolü / Münhasıran Altyapı Yatırım ve Hizmetlerinden Oluşan Portföyü İşleten Ortaklıklar | `4028328d9d4a0485019d770b7231411b` |
| Portföy Sınırlamalarına, Finansal Borç ve Toplam Gider Sınırına Uyumun Kontrolü | `4028328d9d4a0485019d7705b997409d` |
| Sermaye Artırımından Elde Edilecek - Edilen Fonun Kullanımına İlişkin Rapor | `8aca490d4f303c4d014f3075e0e90074` |
| Sorumlu Yönetim İlkelerine İlişkin Bildirim | `4028328c7fd430430180093217e33da5` |
| Sürdürülebilirlik Raporu | `4028328d6233239a01629b637e965551` |
| Sürdürülebilirlik Uyum Raporu | `4028328c86d231ff01887c67cc6977e0` |
| Şirket Genel Bilgi Formu | `8aca490d5099971a015099a610ff0044` |
| Tasarruf Sahiplerine Satış Duyurusu | `8aca490d5075d4800150760138b7005d` |
| Teminat Raporu | `4028328c7fd4304301800930dbe93dbc` |
| Tertip İhraç Belgesi | `4028328d537aad0a015383f214e64606` |
| Üç Aylık Bildirim | `8aca490d50c882300150c8cdf6f701d5` |
| Yatırımcı Raporu | `8aca490d4f2c5b17014f2c6b1da400c0` |
| Yeşil veya Sürdürülebilir Temalı Sermaye Piyasası Aracına İlişkin Bildirim | `4028328c7fd430430180093432e23e58` |
| Yetki ve İzin Belgelerine İlişkin Bildirim | `8aca490d4f2c5b17014f2c843f2c015c` |

### FR — Finansal Raporlar (5 items)

| Subject | subjectOid |
| --- | --- |
| Entegre Rapor | `4028328d6233239a01629b674aeb5631` |
| Faaliyet Raporu | `4028328d594c04f201594c5155dd0076` |
| Finansal Rapor | `4028328c594bfdca01594c0af9aa0057` |
| Sorumluluk Beyanı | `4028328d594c04f201594c522aa60083` |
| TSRS Uyumlu Sürdürülebilirlik Raporu | `4028328d998eebe8019aa65187ce5b59` |
