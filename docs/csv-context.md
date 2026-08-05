# CSV Context

The lead CSV is currently stored at the project root:

```text
Klenty_Master_Call_List_Clean.csv
```

The intended canonical local import path is:

```text
/data/Klenty_Master_Call_List_Clean.csv
```

The CSV is Git-ignored and must not be committed.

## Aggregate inspection (local file)

- Rows: 1,674
- Columns: 25
- Unique emails: 1,673
- Unique companies: 957

### Column names

- First Name
- Last Name
- Job Title
- Persona
- Company
- Email Address
- Work Phone Number
- Street Address
- City
- State
- Zip Code
- Country
- Previous Outreach
- Priority: Havent Found Right Tech Partner
- Priority: Outsourcing to Asia-Pacific
- Priority: Investing in Chatbots/Virtual Agents
- Priority: Investing in Voice/Speech AI
- Priority: Investing in Conversational IVR/Voicebots
- Priority Score (0-5)
- Filter: Call Volume Band
- Filter: Call Volume Match (100K-500K)
- Filter: Budgeting Period
- Filter: Budgeting Period Match (Jul-Year End)
- Filter: Industry (auto-classified)
- PDF Match Confidence

### Top personas

| Persona | Contacts |
|---|---:|
| Operations & Customer Service | 685 |
| Executive Leadership | 241 |
| Executive Leadership & General Management | 213 |
| Product, IT & Technology | 169 |
| Sales & Revenue Growth | 134 |
| Customer Experience (CX) & Success | 83 |
| Customer Experience (CX) | 54 |
| Marketing & Brand Strategy | 47 |
| Other/General Business Roles | 23 |
| HR, Training & Quality Assurance | 19 |

### Top industries

| Industry | Contacts |
|---|---:|
| Customer Support Intensive | 289 |
| Business Services | 200 |
| BFSI | 131 |
| CX Technology/AI Vendor | 95 |
| BPO/Outsourcing | 84 |
| Enterprise & Consumer Operations | 81 |
| CX Technology/Contact Center Vendor | 69 |
| Healthcare Operations | 44 |
| Consumer Services | 39 |
| Healthcare & Life Sciences | 29 |

Known expectations:

- around 1,674 rows
- around 1,673 unique emails
- around 964 unique companies
- mostly US leads
- priority score is mixed-format:
  - some values are 0–5
  - some values are 50–90
  - some values may be blank or invalid

Priority score normalization rule:

If numeric value <= 5, normalized score = value * 20.
If numeric value > 5, normalized score = value.
If not numeric, normalized score = null.

The CSV contains useful sales signals:

- persona
- industry
- previous outreach
- call volume band
- budgeting period
- chatbot/virtual-agent investment signal
- voice/speech AI investment signal
- conversational IVR/voicebot signal
- whether they have not found the right tech partner
- outsourcing to Asia-Pacific signal
- PDF match confidence

The app should preserve the raw CSV row as JSONB during import.
The app should normalize useful fields into Supabase tables.
The app should not commit this CSV.
