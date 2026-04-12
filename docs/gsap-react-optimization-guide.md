# GSAP + React Optimization Guide

Panduan ini diriset untuk dipakai oleh AI coding agent saat membuat, mereview, atau mengoptimalkan animasi GSAP di aplikasi React/Next.js.

Riset tanggal: 2026-04-12  
Basis utama: dokumentasi resmi GSAP, `@gsap/react`, React docs, dan MDN performance docs.

## Ringkasan Singkat

- Gunakan `useGSAP()` dari `@gsap/react` sebagai default di React.
- Selalu scope animasi ke container `ref`.
- Pastikan cleanup benar: `gsap.context()` / `useGSAP()` / `contextSafe()`.
- Animasikan `transform` dan `opacity` lebih dulu; hindari properti yang memicu layout/paint berat.
- Jangan biarkan effect re-run terus karena dependency object/function yang tidak stabil.
- Untuk interaksi berfrekuensi tinggi seperti mousemove, drag, parallax, atau cursor follower, pertimbangkan `gsap.quickSetter()` atau `gsap.quickTo()`.
- Untuk responsive animation dan `prefers-reduced-motion`, gunakan `gsap.matchMedia()`.
- Jangan pakai `will-change` secara massal atau permanen.

## Prinsip Utama

GSAP sangat cepat, tetapi bottleneck di React biasanya bukan cuma library animasinya. Masalah yang paling sering justru:

- effect dipanggil ulang terlalu sering
- cleanup tidak rapi
- selector tidak di-scope
- terlalu banyak node yang dianimasikan
- properti CSS yang berat dianimasikan
- listener / ScrollTrigger / tween bocor saat component unmount atau re-render

## Yang Jangan Dilakukan

### 1. Jangan pakai animasi GSAP tanpa cleanup

Hindari pola seperti ini:

```tsx
useEffect(() => {
  gsap.to(".card", { y: 20, opacity: 1 });
}, []);
```

Masalah:

- selector bisa kena elemen di luar component
- cleanup tidak eksplisit
- riskan di React Strict Mode saat development

### 2. Jangan buat animasi baru di setiap render tanpa alasan

Contoh masalah umum:

```tsx
useEffect(() => {
  gsap.to(nodeRef.current, { x: endX });
}, [{ endX }]);
```

Object/function dependency yang tidak stabil bisa memicu re-run effect terlalu sering.

### 3. Jangan animasikan properti layout-heavy sebagai pilihan pertama

Hindari jika bisa:

- `top`
- `left`
- `width`
- `height`
- `margin`
- `padding`
- `border-width`

Properti seperti ini lebih mudah memicu style recalculation, layout, dan paint.

### 4. Jangan pasang event listener GSAP callback tanpa `contextSafe()` dan cleanup

Contoh jelek:

```tsx
useGSAP(() => {
  buttonRef.current?.addEventListener("click", () => {
    gsap.to(".item", { rotation: 180 });
  });
}, { scope: containerRef });
```

Masalah:

- callback dibuat di luar recording context utama
- animasi tambahan tidak otomatis ikut cleanup
- listener bisa bocor

### 5. Jangan pakai `will-change` ke banyak elemen atau sepanjang waktu

`will-change` bukan default optimization. Overuse bisa menaikkan memory cost dan malah memperburuk performa.

### 6. Jangan default ke `useLayoutEffect` manual untuk semua kasus

React docs menegaskan `useLayoutEffect` bisa merusak performa jika dipakai berlebihan. Di React app, `useGSAP()` lebih aman karena menangani pola isomorphic layout effect dan cleanup.

### 7. Jangan suppress dependency linter tanpa alasan kuat

Kalau effect membaca reactive value, dependency harus benar. Kalau terlalu sering re-run, perbaiki struktur code-nya, bukan menyembunyikan warning.

### 8. Jangan animasikan terlalu banyak elemen sekaligus jika outcome bisa dicapai dengan lebih sedikit node

Contoh masalah:

- split text ke ratusan span lalu semuanya dianimasikan
- daftar panjang diberi entrance animation satu per satu
- banyak glow/blur besar aktif bersamaan

GSAP bisa menangani banyak animasi, tapi DOM dan browser rendering tetap punya biaya.

## Yang Direkomendasikan

### 1. Pakai `useGSAP()` sebagai default integration

Pola paling aman:

```tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from("[data-reveal]", {
      y: 24,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: "power3.out",
    });
  }, { scope: root });

  return <section ref={root}>{/* ... */}</section>;
}
```

Kenapa bagus:

- cleanup otomatis via context
- selector ter-scope
- lebih aman untuk SSR/client boundary

### 2. Simpan ref, instance, dan nilai non-visual di `useRef`, bukan state

Gunakan `useRef` untuk:

- root container
- DOM node
- timeline instance
- imperative animation handle
- cached setter / quickTo function

Hindari `useState` jika perubahan nilainya tidak perlu memicu render.

### 3. Gunakan timeline untuk sequence kompleks

Jika animasi punya beberapa langkah, gunakan `gsap.timeline()` daripada banyak `delay` tersebar.

Lebih baik:

```tsx
useGSAP(() => {
  const tl = gsap.timeline({ defaults: { duration: 0.7, ease: "power3.out" } });
  tl.from(".hero-title", { y: 32, opacity: 0 })
    .from(".hero-copy", { y: 18, opacity: 0 }, "-=0.4")
    .from(".hero-cta", { y: 14, opacity: 0, stagger: 0.08 }, "-=0.35");
}, { scope: root });
```

Manfaat:

- sequencing lebih jelas
- kontrol pause/restart/reverse lebih mudah
- perubahan timing tidak memaksa ubah banyak `delay`

### 4. Pilih properti yang murah untuk dirender

Prioritas utama:

- `transform`
- `opacity`

Praktik umum:

- geser elemen pakai `x` / `y`, bukan `left` / `top`
- scale pakai transform, bukan resize layout jika tidak perlu

### 5. Gunakan `contextSafe()` untuk callback yang berjalan setelah hook utama

Contoh aman:

```tsx
const { contextSafe } = useGSAP({ scope: root });

const onClick = contextSafe(() => {
  gsap.to(".card", { y: -8, duration: 0.25 });
});
```

Pakai ini untuk:

- event listener
- timeout
- interval
- callback async
- interaksi user yang membuat tween baru

### 6. Untuk high-frequency updates, pertimbangkan `quickSetter()` atau `quickTo()`

Pakai jika ada update sangat sering:

- `mousemove`
- drag
- pointer follower
- scroll-linked manual handler

Contoh:

```tsx
useGSAP(() => {
  const xTo = gsap.quickTo(".cursor-dot", "x", { duration: 0.2, ease: "power3" });
  const yTo = gsap.quickTo(".cursor-dot", "y", { duration: 0.2, ease: "power3" });

  const onMove = (e: MouseEvent) => {
    xTo(e.clientX);
    yTo(e.clientY);
  };

  window.addEventListener("mousemove", onMove);
  return () => window.removeEventListener("mousemove", onMove);
}, { scope: root });
```

### 7. Untuk responsive behavior dan reduced motion, pakai `gsap.matchMedia()`

Contoh:

```tsx
useGSAP(() => {
  const mm = gsap.matchMedia();

  mm.add(
    {
      desktop: "(min-width: 1024px)",
      mobile: "(max-width: 1023px)",
      reduceMotion: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      const { desktop, reduceMotion } = context.conditions!;

      gsap.from(".hero-card", {
        y: reduceMotion ? 0 : 24,
        opacity: 0,
        duration: reduceMotion ? 0 : 0.8,
        stagger: desktop ? 0.1 : 0.05,
      });
    }
  );

  return () => mm.revert();
}, { scope: root });
```

### 8. Animasi harus degrade dengan baik

Checklist praktis:

- hormati `prefers-reduced-motion`
- jangan bikin entrance animation terlalu lama
- hindari scroll hijacking
- pastikan content tetap terbaca sebelum animasi selesai

### 9. Registrasi plugin secukupnya

GSAP core relatif kecil, dan plugin bisa ditambahkan saat perlu. Jangan membawa plugin yang tidak dipakai.

### 10. Profiling tetap wajib untuk animasi berat

Jika animasi terasa jank:

- cek Chrome Performance / Firefox Performance
- lihat layout, paint, dan compositing cost
- ukur sebelum menambah optimasi seperti `will-change`

## Pola Implementasi yang Disarankan untuk AI Agent

Saat agent membuat animasi GSAP di React, default policy-nya sebaiknya seperti ini:

1. Pastikan file adalah client component bila memakai effect/DOM animation.
2. Import `gsap` dan `useGSAP`.
3. `gsap.registerPlugin(useGSAP)`.
4. Buat satu `rootRef`.
5. Scope semua selector ke `rootRef`.
6. Gunakan timeline untuk entrance sequence.
7. Gunakan `contextSafe()` untuk handler di luar body hook utama.
8. Animasikan `transform` / `opacity` lebih dulu.
9. Hormati `prefers-reduced-motion` untuk animasi besar.
10. Tambahkan cleanup listener manual jika ada.

## Anti-Pattern Review Checklist

Jika agent menemukan salah satu hal ini, anggap sebagai candidate bug atau optimization issue:

- `gsap.to()` / `gsap.from()` dipanggil langsung di body component
- penggunaan `useEffect`/`useLayoutEffect` tanpa cleanup
- selector global seperti `".card"` tanpa scope/container
- dependency effect berupa object/function inline yang berubah setiap render
- event listener tidak dilepas saat cleanup
- tween baru dibuat di `mousemove` tanpa `quickSetter()` / `quickTo()`
- animasi mengubah `top/left/width/height/margin`
- `will-change` dipasang permanen di stylesheet untuk banyak elemen
- animasi besar tetap aktif meskipun user memilih reduced motion
- terlalu banyak blur/shadow/filter berat yang aktif bersamaan

## Template Instruksi untuk AI Agent

Gunakan prompt ini ke agent coding:

```md
Saat menulis atau mereview animasi GSAP di React:

- default ke `useGSAP()` dari `@gsap/react`
- scope selector ke container ref
- wajib cleanup semua tween, ScrollTrigger, dan event listener
- gunakan `contextSafe()` untuk callback yang berjalan setelah hook utama
- pilih `transform` dan `opacity` sebelum properti layout-heavy
- hindari dependency effect yang tidak stabil
- untuk pointer/mousemove/drag gunakan `gsap.quickSetter()` atau `gsap.quickTo()` bila update sangat sering
- hormati `prefers-reduced-motion`
- jangan pakai `will-change` kecuali ada bukti bottleneck
- jika sequence kompleks, gunakan `gsap.timeline()`
- jika responsive, pertimbangkan `gsap.matchMedia()`
```

## Template Komponen Aman

```tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function SafeGsapSection() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        desktop: "(min-width: 1024px)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { reduceMotion } = context.conditions!;

        const tl = gsap.timeline({
          defaults: {
            duration: reduceMotion ? 0 : 0.8,
            ease: "power3.out",
          },
        });

        tl.from("[data-title]", { y: reduceMotion ? 0 : 24, opacity: 0 })
          .from("[data-copy]", { y: reduceMotion ? 0 : 16, opacity: 0 }, "-=0.45")
          .from("[data-cta]", { y: reduceMotion ? 0 : 12, opacity: 0, stagger: 0.08 }, "-=0.35");
      }
    );

    return () => mm.revert();
  }, { scope: root });

  return <section ref={root}>{/* ... */}</section>;
}
```

## Catatan Khusus untuk Next.js

Inference dari React docs: karena effects hanya berjalan di client, kode GSAP di App Router sebaiknya ditempatkan di client component, biasanya dengan `"use client"` pada file component yang mengakses DOM atau menjalankan hook animasi.

## Kapan Perlu Dioptimasi Lebih Agresif

Pertimbangkan optimasi ekstra jika:

- animasi ikut pointer atau scroll dan update setiap frame
- ada ratusan target DOM
- banyak `filter`, `blur`, `box-shadow`, atau layer besar
- frame rate turun di device menengah
- Strict Mode memunculkan bug cleanup

Urutan optimasi yang disarankan:

1. rapikan cleanup
2. rapikan dependencies
3. scope selector
4. ganti properti animasi ke `transform`/`opacity`
5. kurangi jumlah node
6. pakai `quickSetter()` / `quickTo()` untuk update intensif
7. profiling
8. baru pertimbangkan `will-change`

## Sumber

- GSAP docs home: https://gsap.com/docs/v3/
- GSAP plugins overview (`useGSAP()` ada di bagian React): https://gsap.com/docs/v3/Plugins/
- GSAP core overview: https://github.com/greensock/GSAP
- `gsap.context()`: https://gsap.com/docs/v3/GSAP/gsap.context%28%29/
- `gsap.quickSetter()`: https://gsap.com/docs/v3/GSAP/gsap.quickSetter%28%29/
- `gsap.quickTo()`: https://gsap.com/docs/v3/GSAP/gsap.quickTo%28%29/
- `gsap.matchMedia()`: https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/
- GSAP Timeline docs: https://gsap.com/docs/v3/GSAP/Timeline/
- `gsap.registerPlugin()`: https://gsap.com/docs/v3/GSAP/gsap.registerPlugin%28%29/
- React `useEffect`: https://react.dev/reference/react/useEffect
- React `useLayoutEffect`: https://react.dev/reference/react/useLayoutEffect
- React `useRef`: https://react.dev/reference/react/useRef
- React Strict Mode: https://react.dev/reference/react/StrictMode
- React removing effect dependencies: https://react.dev/learn/removing-effect-dependencies
- MDN animation performance: https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate
- MDN `will-change`: https://developer.mozilla.org/en-US/docs/Web/CSS/will-change
