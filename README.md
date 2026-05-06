# kap-cron

A scheduled job that fetches daily disclosures from KAP (Kamuyu Aydınlatma Platformu) and emails a digest via Resend.

## KAP API

The job posts to `https://www.kap.org.tr/tr/api/disclosure/members/byCriteria` and receives an array of disclosure objects.

### Response body keys

| Key | Type | Description |
| --- | --- | --- |
| `publishDate` | string | Publication timestamp, e.g. `"05.05.2026 18:56:56"` |
| `fundCode` | string \| null | Fund code, when applicable |
| `kapTitle` | string | Issuer's title, e.g. `"ASCE GAYRİMENKUL YATIRIM ORTAKLIĞI A.Ş."` |
| `isOldKap` | boolean | Whether the disclosure is from the legacy KAP system |
| `disclosureClass` | string | Class identifier, e.g. `"ODA"` |
| `disclosureType` | string | Type identifier, e.g. `"ODA"` |
| `disclosureCategory` | string | Category identifier, e.g. `"ODA"` |
| `summary` | string | Short summary, e.g. `"Maddi Duran Varlık Alımı"` |
| `subject` | string | Subject of the disclosure |
| `relatedStocks` | string \| null | Related stocks list |
| `year` | number \| null | Reporting year, when applicable |
| `ruleType` | string | Rule type, e.g. `"-"` |
| `period` | string \| null | Reporting period, when applicable |
| `disclosureIndex` | number | Unique disclosure ID, e.g. `1601408` |
| `isLate` | boolean | Whether the disclosure was filed late |
| `stockCodes` | string | Stock ticker(s), e.g. `"ASGYO"` |
| `hasMultiLanguageSupport` | boolean | Multi-language availability flag |
| `attachmentCount` | number | Number of attached files |
| `modifyStatus` | string \| null | Modification status |

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
