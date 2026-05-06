---
title: "Cara Membuat Lowongan Kerja Terindex di Google Jobs"
slug: seo-job-posting-google-jobs
date: 2026-05-06
description: "Panduan praktis menggunakan structured data JobPosting agar lowongan kerja muncul di Google Jobs dan menjangkau lebih banyak pelamar."
tags: [seo, recruitment, structured-data, google-jobs]
published: true
---

Kalau lu punya lowongan kerja tapi sepi pelamar, mungkin masalahnya bukan soal posisi yang nggak menarik. Bisa jadi lowongan lu nggak terlihat di tempat yang tepat. Google punya fitur khusus untuk job posting yang namanya Google Jobs, dan untuk muncul di sana, lu perlu structured data.

Structured data adalah cara lu ngomong ke Google: "Ini lowongan kerja, ini posisinya, ini lokasinya, ini gajinya." Tanpa itu, Google cuma lihat halaman lu sebagai teks biasa. Dengan itu, lowongan lu bisa muncul di search results dengan format khusus yang lebih eye-catching.

## Kenapa Structured Data Penting

Ketika lu search "lowongan kerja frontend developer jakarta" di Google, lu bakal lihat box khusus di atas hasil pencarian biasa. Itu adalah Google Jobs. Lowongan yang muncul di sana punya structured data yang benar.

Keuntungannya jelas. Pertama, visibility lebih tinggi. Lowongan lu nggak cuma muncul di search results biasa, tapi juga di Google Jobs yang dedicated untuk job seekers. Kedua, pelamar yang datang lebih qualified karena mereka actively searching untuk pekerjaan, bukan accidentally menemukan halaman lu. Ketiga, Google menampilkan logo perusahaan, rating, dan detail penting lainnya, jadi lowongan lu terlihat lebih profesional.

## Schema JobPosting: Apa yang Harus Ada

Google punya requirement untuk structured data job posting. Ada field yang wajib dan field yang recommended.

Field wajib:

- `title`: Nama posisi (contoh: "Senior Frontend Developer")
- `description`: Deskripsi lengkap pekerjaan
- `hiringOrganization`: Nama perusahaan
- `jobLocation`: Lokasi kerja
- `datePosted`: Tanggal posting dibuat

Field recommended yang bikin lowongan lu lebih menarik:

- `baseSalary` atau `estimatedSalary`: Range gaji
- `employmentType`: Tipe pekerjaan (full-time, part-time, contract, dll)
- `jobStartDate`: Kapan bisa mulai
- `applicationContact`: Kontak untuk pertanyaan
- `jobBenefits`: Benefit yang ditawarkan
- `experienceRequirements`: Pengalaman yang dibutuhkan
- `educationRequirements`: Pendidikan yang dibutuhkan

Semakin lengkap data lu, semakin bagus. Google akan menampilkan informasi ini di Google Jobs, dan job seekers bisa filter berdasarkan kriteria ini.

## Implementasi: JSON-LD Format

Structured data bisa ditulis dalam beberapa format. Yang paling mudah dan recommended adalah JSON-LD. Lu tinggal tambahkan script tag di halaman job posting lu.

Contoh minimal:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "JobPosting",
  "title": "Senior Frontend Developer",
  "description": "Kami mencari Senior Frontend Developer untuk bergabung dengan tim kami. Anda akan bekerja dengan React, Next.js, dan Tailwind CSS untuk membangun aplikasi web yang scalable.",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "PT Tech Indonesia",
    "sameAs": "https://techindo.com",
    "logo": "https://techindo.com/logo.png"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jl. Sudirman No. 123",
      "addressLocality": "Jakarta",
      "addressRegion": "DKI Jakarta",
      "postalCode": "12190",
      "addressCountry": "ID"
    }
  },
  "baseSalary": {
    "@type": "PriceSpecification",
    "priceCurrency": "IDR",
    "priceRange": "15000000-25000000"
  },
  "employmentType": "FULL_TIME",
  "datePosted": "2026-05-06",
  "validThrough": "2026-06-06",
  "jobStartDate": "2026-06-01"
}
</script>
```

Contoh yang lebih lengkap dengan benefit dan requirement:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "JobPosting",
  "title": "Senior Frontend Developer",
  "description": "Kami mencari Senior Frontend Developer untuk bergabung dengan tim kami. Anda akan bekerja dengan React, Next.js, dan Tailwind CSS untuk membangun aplikasi web yang scalable dan performant.",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "PT Tech Indonesia",
    "sameAs": "https://techindo.com",
    "logo": "https://techindo.com/logo.png"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jl. Sudirman No. 123",
      "addressLocality": "Jakarta",
      "addressRegion": "DKI Jakarta",
      "postalCode": "12190",
      "addressCountry": "ID"
    }
  },
  "baseSalary": {
    "@type": "PriceSpecification",
    "priceCurrency": "IDR",
    "priceRange": "15000000-25000000"
  },
  "employmentType": "FULL_TIME",
  "datePosted": "2026-05-06",
  "validThrough": "2026-06-06",
  "jobStartDate": "2026-06-01",
  "experienceRequirements": "Minimal 5 tahun pengalaman sebagai Frontend Developer",
  "educationRequirements": "Minimal S1 Teknik Informatika atau bidang terkait",
  "jobBenefits": "Health insurance, flexible working hours, professional development budget",
  "applicationContact": {
    "@type": "ContactPoint",
    "contactType": "Human Resources",
    "email": "hr@techindo.com"
  }
}
</script>
```

Letakkan script ini di dalam `<head>` atau sebelum closing `</body>` tag. Google akan crawl halaman lu dan parse JSON-LD ini.

## Checklist Sebelum Publish

Sebelum lu publish lowongan, pastikan:

1. Halaman bisa diakses oleh Googlebot. Jangan pakai robots.txt yang block job posting pages. Jangan pakai noindex meta tag.

2. Setiap lowongan punya halaman sendiri. Jangan put multiple job postings di satu halaman. Buat URL yang unik untuk setiap lowongan.

3. Gunakan canonical URL. Kalau lu punya multiple copies dari lowongan yang sama di URL berbeda, gunakan `rel="canonical"` untuk point ke versi utama.

4. Validasi structured data lu. Google punya Rich Results Test tool. Paste URL lowongan lu di sana dan lihat apakah structured data lu valid. Link: https://search.google.com/test/rich-results

5. Update datePosted dan validThrough. `datePosted` adalah kapan lowongan dibuat. `validThrough` adalah deadline aplikasi. Jangan lupa update ini.

6. Pastikan deskripsi lengkap. Google prefer deskripsi yang detail. Minimal 300 karakter, tapi lebih panjang lebih baik. Jelaskan responsibilities, requirements, dan benefits dengan jelas.

7. Gunakan format yang konsisten. Kalau lu punya multiple lowongan, pastikan format structured data lu konsisten. Ini membantu Google understand pattern lu.

## Testing dan Monitoring

Setelah lu publish, submit halaman ke Google Search Console. Ini akan mempercepat indexing. Pergi ke Search Console, pilih property website lu, terus submit URL lowongan lu.

Tunggu beberapa hari. Google biasanya butuh waktu untuk crawl dan index halaman baru. Setelah itu, cek apakah lowongan lu muncul di Google Jobs. Search di Google dengan keyword yang relevan dan lihat apakah lowongan lu ada di box Google Jobs.

Kalau nggak muncul, buka Rich Results Test lagi dan lihat ada error apa. Common errors:

- Missing required fields. Pastikan title, description, hiringOrganization, jobLocation, dan datePosted ada.
- Invalid date format. Gunakan format ISO 8601 (YYYY-MM-DD).
- Invalid salary range. Pastikan priceRange format benar (contoh: "15000000-25000000").
- Halaman nggak bisa diakses. Pastikan halaman nggak behind login atau robots.txt block.

## Pro Tips

Kalau lu punya banyak lowongan, pertimbangkan untuk buat job board atau careers page yang dedicated. Ini lebih scalable daripada buat halaman terpisah untuk setiap lowongan. Contohnya, lu bisa buat `/careers` page yang list semua lowongan dengan structured data untuk setiap job posting.

Kalau lu pake job board platform seperti LinkedIn, Indeed, atau Jobstreet, mereka biasanya udah handle structured data untuk lu. Tapi kalau lu punya website sendiri, lu perlu implement ini manually.

Satu hal penting: structured data nggak guarantee lowongan lu muncul di Google Jobs. Google punya criteria lain seperti kualitas halaman, domain authority, dan relevance. Tapi structured data adalah requirement dasar. Tanpa itu, lowongan lu nggak akan muncul di Google Jobs sama sekali.

Jadi, kalau lu serius mau attract pelamar melalui Google, implement structured data ini. Nggak butuh waktu lama, dan hasilnya bisa significant.
