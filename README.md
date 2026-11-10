# Lucky Embroidery

An independent, unofficial website redesign concept for a custom embroidery and screen-printing business.

**Live Demo:** https://lucky-embroidery-demo.vercel.app/

## Overview

Lucky Embroidery is a responsive business website concept built to demonstrate modern frontend development and backend API implementation.

The project includes a custom website interface and a demo enquiry API with request validation and automated tests.

This is an independent portfolio project and is not an official business website.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Node.js
- Native Node.js test runner
- Vercel (Deployment)

## Features

- Responsive website design
- Custom embroidery and screen-printing presentation
- Enquiry form interface
- Backend enquiry API
- Server-side input validation
- JSON request handling
- Request body size limits
- Error handling
- Automated API tests

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/babarxai/lucky-embroidery-demo.git
cd lucky-embroidery-demo
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## API Documentation

### POST /api/enquiries

Accepts and validates demo enquiry submissions.

**Request Content-Type:**

`application/json`

**Example request:**

```json
{
  "fullName": "Demo User",
  "email": "demo@example.com",
  "phone": "",
  "service": "",
  "projectDetails": "Custom embroidery project"
}
```

**Successful response: HTTP 201**

```json
{
  "message": "Enquiry received. Thank you for getting in touch."
}
```

### Validation

Required fields:

- `fullName`
- `email`
- `projectDetails`

Optional fields:

- `phone`
- `service`

Additional validation includes email format, field length limits, JSON content type and a maximum request body size of 16 KB.

### HTTP Status Codes

| Status | Description |
|---|---|
| 201 | Enquiry accepted |
| 400 | Invalid request or validation failure |
| 413 | Request body too large |
| 415 | Unsupported content type |

## Testing

Run automated API tests:

```bash
npm test
```

Run TypeScript checks:

```bash
npx tsc --noEmit
```

Run lint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

## Demo Limitations

This project operates in demo mode.

- Enquiries are validated but not permanently stored.
- No emails or external notifications are sent.
- No customer data is transmitted to third-party services through the enquiry API.
- The website is an independent, unofficial redesign concept.

## Deployment

The project is deployed using Vercel.

Production URL:

https://lucky-embroidery-demo.vercel.app/

## Author

**Muhammad Babar Khan**

GitHub: https://github.com/babarxai

LinkedIn: https://linkedin.com/in/babarxai

---

Built as an independent web development portfolio project.