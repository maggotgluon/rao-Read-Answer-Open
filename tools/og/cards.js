/*
 * Share-image cards (1200×630) for public/og/. Rendered inside the running app so the real
 * fonts (Itim/Anuphan) and dusk textures are used. How to rebuild: see tools/og/README.md.
 * การ์ดภาพตัวอย่างลิงก์ 1200×630 วาดในแอปจริงเพื่อให้ได้ฟอนต์และพื้นผิวของธีม
 */
window.raoOgCard = function (kind) {
    const A = (n) => `/themes/dusk/${n}`;
    const mask = (file, color, size) =>
        `<span style="display:inline-block;width:${size}px;height:${size}px;background:${color};` +
        `-webkit-mask:url(${A(file)}) center/contain no-repeat;mask:url(${A(file)}) center/contain no-repeat"></span>`;
    const seal = (size) =>
        `<span style="position:absolute;display:grid;place-items:center;width:${size}px;height:${size}px;border-radius:50%;` +
        `background:var(--stamp) var(--seal-image) center/cover;box-shadow:inset 0 -5px 0 rgb(0 0 0/.18),0 6px 14px -6px rgb(0 0 0/.35)">` +
        mask('icons/seal.svg', 'var(--stamp-ink)', size * 0.5) +
        '</span>';
    const letter = (who, color, text, rot, extra) =>
        `<div class="paper" style="position:absolute;width:390px;transform:rotate(${rot}deg);overflow:visible;${extra}">` +
        `<div style="height:9px;background:${color};border-radius:var(--radius) var(--radius) 0 0"></div>` +
        `<div style="position:relative;padding:26px 30px 30px">` +
        `<div style="font-size:19px;color:${color}">${who}</div>` +
        `<p class="hand" style="margin:6px 0 0;font-size:31px;line-height:1.25;color:var(--ink)">${text}</p>` +
        (kind === 'default' && color === 'var(--stamp)'
            ? `<div style="position:absolute;top:-30px;right:-30px">${seal(78)}</div>`
            : '') +
        '</div></div>';

    const copy = {
        default: {
            th: 'จดหมายถึงกัน<br>วันละฉบับ',
            en: 'One letter a day, to each other',
            sub: 'คำถามเล็ก ๆ วันละข้อ · ปิดผนึก · เปิดพร้อมกัน',
        },
        invite: {
            th: 'เธอได้รับคำเชิญ<br>มาที่ เรา',
            en: "You're invited to a private space for two",
            sub: 'เปิดลิงก์เพื่อเข้าร่วม · Open the link to join',
        },
    }[kind];

    const art =
        kind === 'default'
            ? letter(
                  'จาก คนของเธอ',
                  'var(--airmail)',
                  'เสียงหัวเราะของเธอ<br>ตอนกินข้าวเช้า',
                  4,
                  'top:70px;right:60px',
              ) +
              letter(
                  'จาก เธอ',
                  'var(--stamp)',
                  'ข้อความเสียงของเธอ<br>ตอนฉันกลับบ้าน',
                  -3,
                  'top:300px;right:150px',
              )
            : `<div class="paper" style="position:absolute;top:120px;right:90px;width:440px;height:300px;transform:rotate(-3deg);overflow:visible">` +
              `<div style="position:absolute;inset:0;border-radius:var(--radius);background:` +
              `linear-gradient(152deg,transparent 49.6%,var(--rule-strong) 50%,transparent 50.4%),` +
              `linear-gradient(28deg,transparent 49.6%,var(--rule-strong) 50%,transparent 50.4%)"></div>` +
              `<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)">` +
              `<div style="position:relative;width:110px;height:110px">${seal(110)}</div></div>` +
              `<div style="position:absolute;top:22px;right:24px;transform:rotate(6deg)">` +
              `<img src="${A('logo/stamp.png')}" style="height:84px"></div></div>`;

    document.body.innerHTML =
        `<div id="og" style="position:fixed;inset:0;width:1200px;height:630px;overflow:hidden;` +
        `background:var(--ground) var(--ground-image);background-size:var(--ground-size);font-family:var(--font-sans);color:var(--ink)">` +
        `<img src="${A('logo/stamp.png')}" style="position:absolute;top:56px;left:70px;height:96px;transform:rotate(-6deg)">` +
        `<div style="position:absolute;left:70px;top:190px;width:600px">` +
        `<h1 style="margin:0;font-family:var(--font-hand);font-weight:400;font-size:84px;line-height:1.12;color:var(--ink)">${copy.th}</h1>` +
        `<p style="margin:22px 0 0;font-size:30px;color:var(--ink-soft)">${copy.en}</p>` +
        `<p style="margin:14px 0 0;font-size:22px;color:var(--postmark)">${copy.sub}</p></div>` +
        `<div style="position:absolute;left:70px;bottom:52px;display:flex;align-items:center;gap:12px;font-size:22px;color:var(--ink-soft)">` +
        mask('icons/heart.svg', 'var(--stamp)', 26) +
        '<span>rao.mag.codes · ไทย / English</span></div>' +
        art +
        '</div>';
    return document.fonts.ready.then(() => true);
};
