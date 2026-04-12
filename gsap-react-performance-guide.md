# Panduan Efisiensi & Optimasi Animasi GSAP untuk React

Dokumen ini ditujukan untuk AI coding agent agar mengimplementasikan animasi **GSAP di React** dengan pola yang aman, efisien, mudah dirawat, dan minim bug.

## Ringkasan eksekutif

Untuk React modern, pola yang paling aman adalah:

1. Gunakan **`@gsap/react` + `useGSAP()`** sebagai default integration layer.
2. Jalankan animasi sebagai **efek imperatif ke DOM**, bukan sebagai hasil samping saat render.
3. **Scope** semua selector ke container lokal.
4. **Cleanup wajib** saat unmount atau saat dependency berubah.
5. Utamakan animasi **`transform`** dan **`opacity`**.
6. Hindari update React state di setiap frame animasi.
7. Jangan buat ulang timeline/ScrollTrigger tanpa alasan.
8. Profiling tetap wajib untuk halaman berat, terutama yang memakai scroll, parallax, pin, blur, filter, atau banyak elemen.

---

## Landasan teknis

- GSAP menyediakan **`useGSAP()`** untuk React, yang membungkus `gsap.context()` dan melakukan cleanup otomatis saat hook dibongkar. Ini membantu mencegah kebocoran animasi, `ScrollTrigger`, dan inline style yang tertinggal. citeturn192004view0turn192004view2
- React menegaskan bahwa animasi library pihak ketiga termasuk **external system**, sehingga integrasinya memang seharusnya dilakukan melalui Effect, bukan di dalam render. citeturn871088search8turn871088search14
- Dalam **Strict Mode**, React menjalankan setup + cleanup ekstra di development untuk mendeteksi bug. Jika animasi dobel, trigger dobel, atau style tertinggal, biasanya cleanup Anda belum benar. citeturn192004view6turn192004view7
- Untuk performa render browser, jalur termurah adalah perubahan yang hanya mencapai tahap **composite**. Karena itu, animasi `transform` dan `opacity` jauh lebih aman dibanding properti yang memicu layout atau paint berat. citeturn457839search0turn192004view9

---

## Yang jangan dilakukan

### 1) Jangan menjalankan GSAP di body render React
**Buruk:** membuat tween/timeline langsung saat fungsi komponen dieksekusi.

Kenapa salah:
- Render React harus tetap pure.
- Di Strict Mode development, render dapat dipanggil lebih dari sekali.
- Ini mudah menimbulkan animasi ganda, memory leak, dan state DOM yang sulit diprediksi. citeturn871088search1turn630504search10

**Jangan lakukan:**
```tsx
function Hero() {
  gsap.to(".title", { y: 0, opacity: 1 }); // ❌ jangan di render body
  return <h1 className="title">Hello</h1>;
}
```

---

### 2) Jangan default ke `useLayoutEffect` untuk semua kasus
React menyebut `useLayoutEffect` dapat merusak performa dan memblok repaint browser bila dipakai berlebihan. `useLayoutEffect` hanya cocok saat Anda **harus** mengukur layout sebelum paint. citeturn192004view8

**Implikasi untuk GSAP:**
- Gunakan **`useGSAP()`** sebagai default.
- Hanya bergantung pada perilaku ala layout effect bila memang perlu sinkron sebelum paint.
- Jangan membangun pola sendiri dengan `useLayoutEffect` di mana-mana kalau `useGSAP()` sudah cukup. citeturn192004view0turn192004view1

---

### 3) Jangan lupa cleanup
React akan menjalankan cleanup bukan hanya saat unmount, tetapi juga sebelum effect berikutnya berjalan pada dependency yang berubah. Di development, setup/cleanup juga diuji ekstra. citeturn192004view6turn192004view7

Risiko jika lupa cleanup:
- `ScrollTrigger` dobel
- listener tertinggal
- inline style tertinggal
- timeline lama tetap hidup
- memory leak

**Jangan lakukan pola ini:**
```tsx
useEffect(() => {
  const tl = gsap.timeline();
  tl.to(boxRef.current, { x: 200 });
}, []); // ❌ tanpa cleanup
```

---

### 4) Jangan target elemen secara global kalau bisa di-scope lokal
Selector global seperti `.box`, `.title`, `.panel` dari dalam komponen React rawan mengenai elemen lain di subtree berbeda, terutama saat komponen dipakai ulang.

GSAP merekomendasikan **scope** melalui `useGSAP(..., { scope })` agar selector text hanya mencari di dalam container terkait. citeturn192004view1

**Hindari:**
```tsx
gsap.to(".card", { y: 20 }); // ❌ global selector
```

---

### 5) Jangan animasikan properti yang memicu layout bila tidak perlu
Hindari menjadikan ini pilihan default untuk motion:
- `top`, `left`, `width`, `height`
- margin/padding untuk efek gerak
- properti layout-heavy lain

Perubahan properti layout dapat memicu **style → layout → paint → composite**, yang lebih mahal daripada sekadar composite. citeturn457839search0

**Hindari untuk movement:**
```tsx
gsap.to(node, { left: 200 }); // ❌
```

**Lebih baik:**
```tsx
gsap.to(node, { x: 200 }); // ✅ transform
```

---

### 6) Jangan update React state pada setiap tick animasi
Menghubungkan `onUpdate`, `ScrollTrigger.onUpdate`, atau `gsap.ticker` ke `setState()` setiap frame hampir selalu buruk untuk performa. Ini memaksa React ikut rerender berkali-kali per detik.

Gunakan React state hanya untuk perubahan UI diskret, bukan untuk progress frame-by-frame, kecuali benar-benar perlu.

**Hindari:**
```tsx
gsap.to({}, {
  duration: 2,
  onUpdate() {
    setProgress(self.progress()); // ❌ rerender terus
  }
});
```

**Lebih baik:**
- simpan progress di ref
- update DOM langsung untuk indikator murni visual
- commit ke state hanya saat event penting, misalnya `onComplete`, `onEnter`, `onLeave`, atau throttle secukupnya

Alasannya sejalan dengan prinsip React untuk menghindari effect yang re-run terlalu sering dan menghindari rerender yang tidak perlu. citeturn192004view6turn871088search0turn871088search2turn871088search4

---

### 7) Jangan membuat ulang timeline / trigger pada setiap render tanpa kontrol dependency
Jika dependency effect berubah terus karena object/function baru dibuat di setiap render, maka animasi akan teardown dan dibuat ulang terus. React juga memperingatkan bahwa object/function dependency dapat menyebabkan effect berjalan terlalu sering. citeturn192004view8

**Buruk:**
```tsx
useGSAP(() => {
  gsap.to(boxRef.current, { x: endX });
}, { dependencies: [{ endX }] }); // ❌ object baru tiap render
```

**Lebih baik:**
```tsx
useGSAP(() => {
  gsap.to(boxRef.current, { x: endX });
}, { dependencies: [endX] });
```

---

### 8) Jangan campur aduk React sebagai source of truth frame-by-frame untuk properti visual murni
Untuk animasi DOM biasa, biarkan **GSAP mengontrol properti visual** yang memang sedang dianimasikan. React tetap memegang state bisnis/UI, tetapi jangan memaksa React menjadi penggerak setiap frame untuk `x`, `y`, `scale`, `rotation`, `opacity`, dan sejenisnya.

Ini meminimalkan rerender dan menjaga pemisahan tanggung jawab:
- React: struktur UI, state bisnis, condition rendering
- GSAP: orchestration motion imperatif

Konsep ini konsisten dengan panduan React bahwa refs/effects dipakai untuk sinkronisasi dengan sistem eksternal seperti library animasi. citeturn871088search5turn871088search8

---

### 9) Jangan terlalu banyak elemen animasi berat bersamaan tanpa profiling
Semakin banyak elemen bergerak bersamaan, semakin besar beban style, paint, compositing, texture upload, dan rasterization. Risiko memburuk jika digabung dengan:
- `filter: blur(...)`
- `backdrop-filter`
- `mix-blend-mode`
- shadow besar
- SVG kompleks
- pinned sections bertumpuk
- scrub scroll panjang dengan banyak node

web.dev menekankan frame budget animasi tipikal sangat ketat; pada layar 60Hz Anda praktis hanya punya sekitar **10ms kerja efektif per frame** agar tetap mulus. citeturn457839search0

---

### 10) Jangan mengandalkan `.from()` di skenario yang sering dipicu ulang tanpa memahami efek sampingnya
GSAP menjelaskan `.from()` bisa menimbulkan perilaku yang tampak “rusak” jika tween dipicu berulang ketika nilai saat ini belum kembali ke baseline. Dalam beberapa kasus, `.fromTo()` atau timeline yang dibuat sekali lalu di-control akan lebih stabil. citeturn192004view3

---

## Yang direkomendasikan

### 1) Jadikan `useGSAP()` sebagai default integration pattern
Ini rekomendasi utama untuk React karena:
- membungkus `gsap.context()`
- cleanup otomatis
- lebih aman terhadap lifecycle React
- lebih nyaman untuk selector scoping citeturn192004view0turn192004view1

**Contoh baseline yang baik:**
```tsx
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function Hero() {
  const scope = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    gsap.fromTo(
      ".title",
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
    );
  }, { scope });

  return (
    <section ref={scope}>
      <h1 className="title">Hello</h1>
    </section>
  );
}
```

---

### 2) Scope selector ke root container komponen
Daripada membuat banyak ref untuk setiap node kecil, pakai satu ref container lalu scope selector text ke sana.

**Manfaat:**
- aman untuk komponen reusable
- lebih sedikit boilerplate
- mencegah tabrakan selector antar komponen citeturn192004view1

---

### 3) Gunakan `transform` dan `opacity` untuk mayoritas motion
Untuk gerakan, scale, rotate, slide, fade:
- `x`, `y`
- `scale`
- `rotation`
- `opacity`

Ini biasanya menjaga perubahan tetap di jalur compositing atau setidaknya lebih murah dibanding properti layout. citeturn457839search0turn192004view9

**Contoh:**
```tsx
gsap.to(card, {
  y: -12,
  opacity: 1,
  duration: 0.4,
  ease: "power2.out"
});
```

---

### 4) Buat timeline sekali, lalu kontrol play/reverse/progress bila perlu
Daripada membuat tween baru berulang-ulang saat event berubah, sering kali lebih efisien membuat timeline sekali lalu mengontrolnya.

Cocok untuk:
- open/close menu
- enter/exit panel
- hover complex state
- modal/sidebar transitions

**Pola bagus:**
```tsx
const tlRef = useRef<gsap.core.Timeline | null>(null);

useGSAP(() => {
  tlRef.current = gsap.timeline({ paused: true })
    .fromTo(".panel", { xPercent: 100 }, { xPercent: 0, duration: 0.4 })
    .fromTo(".backdrop", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);
}, { scope });

useEffect(() => {
  if (!tlRef.current) return;
  isOpen ? tlRef.current.play() : tlRef.current.reverse();
}, [isOpen]);
```

Alasan: lebih sedikit create/destroy work, perilaku lebih stabil, dan lebih gampang diuji.

---

### 5) Simpan handle animasi di `useRef`, bukan di state
Timeline, tween, instance `ScrollTrigger`, dan nilai mutable sejenis sebaiknya disimpan di ref. `useRef` cocok untuk nilai imperatif yang tidak perlu memicu rerender. citeturn871088search5

**Gunakan ref untuk:**
- timeline instance
- trigger instance
- DOM node
- last progress / last velocity / flags mutable

---

### 6) Untuk event handler yang membuat GSAP object setelah hook utama, gunakan pola yang aman terhadap context
Dokumentasi GSAP React menekankan cleanup otomatis untuk objek yang dibuat saat `useGSAP()` berjalan. Untuk logika yang dipanggil belakangan dari event/callback, gunakan pola yang tetap terikat ke context terkait agar cleanup dan selector scoping tetap benar. citeturn192004view0

Praktiknya:
- hindari membuat tween “liar” di event handler tanpa ikatan cleanup
- letakkan logika pembuatan animasi dalam pola yang tetap terkait dengan lifecycle komponen

---

### 7) Gunakan ScrollTrigger hanya saat memang memberi nilai tambah
ScrollTrigger bagus karena animasi hanya aktif saat elemen relevan masuk viewport, yang membantu performa dan memastikan animasi benar-benar terlihat. citeturn192004view10

Namun tetap batasi pemakaian:
- jangan pasang trigger untuk elemen yang tidak perlu
- hindari scrub berat untuk banyak section sekaligus
- kurangi pin bertumpuk
- refresh dengan hati-hati saat layout berubah besar

**Contoh sederhana:**
```tsx
useGSAP(() => {
  gsap.fromTo(
    ".feature",
    { y: 40, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.08,
      scrollTrigger: {
        trigger: ".features",
        start: "top 80%"
      }
    }
  );
}, { scope });
```

---

### 8) Minimalkan dependency effect animasi
Semakin sering effect dibangun ulang, semakin besar overhead.

Prinsip:
- hanya masukkan dependency yang benar-benar memengaruhi setup animasi
- stabilkan object/function bila memang harus dipakai
- gunakan `useMemo` / `useCallback` bila diperlukan untuk mencegah churn yang tidak perlu. citeturn871088search0turn871088search2turn871088search4

---

### 9) Pisahkan “state UI” dari “state animasi frame-by-frame”
Contoh pemisahan yang baik:
- React state: `isOpen`, `activeTab`, `isReady`
- GSAP internal: progress, transform current value, scrub interpolation, velocity visual

Gunakan React state saat perubahan perlu memengaruhi render JSX.
Gunakan ref/GSAP internals saat perubahan hanya visual per-frame.

---

### 10) Profiling dengan browser tools untuk kasus nyata
Untuk halaman kompleks, lakukan profiling di Chrome DevTools Performance.

Fokus lihat:
- scripting panjang
- layout/paint besar
- frame drop saat scroll
- event handler berat
- rerender React berlebihan

React juga menyediakan integrasi **React Performance Tracks** di DevTools untuk membantu membaca aktivitas React bersama timeline performa browser. citeturn871088search13turn457839search0

---

## Pola implementasi yang direkomendasikan

### A. Entrance animation komponen
Gunakan sekali saat mount, scoped, cleanup otomatis.

```tsx
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function SectionIntro() {
  const scope = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    gsap.fromTo(
      ".item",
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.06,
        ease: "power2.out"
      }
    );
  }, { scope });

  return (
    <div ref={scope}>
      <div className="item">A</div>
      <div className="item">B</div>
      <div className="item">C</div>
    </div>
  );
}
```

### B. Toggle animation berbasis state React
Buat timeline sekali, kontrol via state.

```tsx
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function Drawer({ isOpen }: { isOpen: boolean }) {
  const scope = useRef<HTMLDivElement | null>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useGSAP(() => {
    tl.current = gsap.timeline({ paused: true })
      .fromTo(".backdrop", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0)
      .fromTo(".panel", { xPercent: 100 }, { xPercent: 0, duration: 0.35, ease: "power2.out" }, 0);
  }, { scope });

  useEffect(() => {
    if (!tl.current) return;
    isOpen ? tl.current.play() : tl.current.reverse();
  }, [isOpen]);

  return (
    <div ref={scope}>
      <div className="backdrop" />
      <aside className="panel" />
    </div>
  );
}
```

### C. Scroll reveal yang masuk akal
Pakai trigger seperlunya, jangan over-engineer.

```tsx
useGSAP(() => {
  gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
    gsap.fromTo(
      el,
      { y: 32, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true
        }
      }
    );
  });
}, { scope });
```

Catatan: `once: true` sering membantu mengurangi pekerjaan berulang pada halaman konten.

---

## Checklist keputusan untuk AI coding agent

### Selalu lakukan
- Pakai `@gsap/react` dan `useGSAP()` sebagai default.
- Scope selector ke ref container.
- Simpan timeline/tween instance di `useRef`.
- Cleanup semua animasi/trigger/listener.
- Pilih `transform` dan `opacity` untuk motion.
- Jaga dependency effect sekecil mungkin.
- Pisahkan state React dari state animasi per-frame.
- Profile halaman berat di DevTools.

### Hindari sebagai default
- Menjalankan GSAP di render body.
- `useLayoutEffect` untuk semua animasi.
- Global selector tanpa scope.
- `setState()` pada setiap frame.
- Menganimasikan `top/left/width/height` untuk movement.
- Membuat ulang timeline setiap render.
- ScrollTrigger di terlalu banyak elemen tanpa profiling.
- Efek visual mahal bertumpuk tanpa alasan.

---

## Aturan praktis yang bisa langsung dipakai agent

1. **Default stack**: `gsap` + `@gsap/react`.
2. **Default hook**: `useGSAP()`.
3. **Default movement props**: `x`, `y`, `scale`, `rotation`, `opacity`.
4. **Default storage**: instance animasi di `useRef`, bukan `useState`.
5. **Default architecture**:
   - React mengontrol kapan animasi harus terjadi.
   - GSAP mengontrol bagaimana motion dijalankan.
6. **Kalau animasi tergantung state**:
   - buat timeline sekali
   - play/reverse/update seperlunya
   - jangan recreate terus.
7. **Kalau scroll animation**:
   - trigger hanya untuk elemen yang penting
   - pertimbangkan `once: true`
   - hindari scrub/pin berlebihan.
8. **Kalau ada flicker, duplikasi, atau bug hanya di development**:
   - cek cleanup dulu
   - cek Strict Mode behavior
   - cek apakah ada GSAP object dibuat di luar lifecycle yang benar.
9. **Kalau performa jelek**:
   - kurangi jumlah node yang dianimasikan
   - ganti properti ke transform/opacity
   - kurangi filter/shadow/blend/backdrop effects
   - profile layout/paint/composite.

---

## Contoh instruksi singkat untuk agent

> Implementasikan animasi GSAP di React memakai `@gsap/react` dan `useGSAP()`. Scope semua selector ke root ref komponen. Jangan buat tween/timeline di body render. Simpan instance timeline di `useRef`, bukan state. Prioritaskan `transform` dan `opacity`, hindari `top/left/width/height` untuk motion. Jangan memanggil `setState()` setiap frame dari `onUpdate`/ticker. Pastikan cleanup aman untuk Strict Mode React. Gunakan ScrollTrigger seperlunya dan minimalkan dependency yang menyebabkan re-init animasi.

---

## Referensi

- GSAP React guide (`useGSAP`, `gsap.context`, cleanup, scoping). citeturn192004view0turn192004view1turn192004view2
- GSAP common mistakes (`from()` vs `fromTo()`, pola yang sering salah). citeturn192004view3
- GSAP ScrollTrigger docs (animasi hanya saat elemen masuk viewport, manfaat performa). citeturn192004view10
- React docs tentang Effects, Strict Mode, dan cleanup. citeturn192004view6turn192004view7turn871088search8
- React docs tentang `useLayoutEffect` caveats. citeturn192004view8
- React docs tentang `useRef`, `useMemo`, `useCallback`, `memo`, dan purity. citeturn871088search5turn871088search0turn871088search2turn871088search4turn871088search1
- web.dev rendering performance dan pixel pipeline. citeturn457839search0turn192004view4


a
