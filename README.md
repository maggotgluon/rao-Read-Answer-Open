# Rao · เรา

**EN:** A calm, private space for two people — share moments, answer one
question a day together, reconnect. Web app + PWA.

**TH:** พื้นที่ส่วนตัวที่สงบสำหรับคนสองคน — แชร์ช่วงเวลา ตอบคำถามวันละข้อด้วยกัน
และกลับมาใกล้กันอีกครั้ง เป็นเว็บแอป + PWA

- Decisions / การตัดสินใจ: [`docs/decisions.md`](docs/decisions.md)
- Plan / แผนงาน: [`docs/plan.md`](docs/plan.md)

## Stack

Laravel 13 · Inertia · React (TypeScript) · Tailwind · MySQL (SQLite locally) · PWA.
Deployed to Plesk shared hosting (no SSH) via a pre-built `deploy` branch.

## Local dev / รันบนเครื่อง

```bash
composer install && npm install
cp .env.example .env && php artisan key:generate
php artisan migrate
composer run dev          # app + vite + queue + logs
```

## Checks / ตรวจสอบ

```bash
php artisan test          # Pest — includes the space "wall" tests / มีเทสต์กำแพงระหว่าง space
npm run types:check       # TypeScript
npm run check             # lint + format
```

## Key rules / กฎสำคัญ

- A space has 2 members; one person can be in several pair spaces, and nothing
  leaks between spaces. Outsiders get **404**.
  / 1 space มี 2 คน ผู้ใช้อยู่ได้หลาย space ข้อมูลห้ามรั่วข้ามกัน คนนอกได้ 404
- Every new feature must scope its queries to the current space and add a wall test.
  / ทุกฟีเจอร์ใหม่ต้อง query ภายใน space ปัจจุบัน และต้องมีเทสต์กำแพง
- UI strings live in `lang/th.json` + `lang/en.json` (both, always).
  / ข้อความ UI อยู่ใน `lang/th.json` และ `lang/en.json` ต้องมีครบทั้งสองภาษา
- Placeholder icons: `php scripts/make-icons.php`.
