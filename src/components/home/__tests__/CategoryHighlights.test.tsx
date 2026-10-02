import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { CategoryHighlights } from "../CategoryHighlights";
import type { HighlightSection } from "@/lib/home-highlights";
import type { Content } from "@/types/content";

describe("CategoryHighlights Component", () => {
  const createMockItem = (override: Partial<Content>): Content => ({
    id: "id-" + Math.random().toString(36).slice(2),
    type: "BEASISWA",
    title: "Judul Default",
    slug: "judul-default",
    summary: "Ringkasan default",
    body: "Konten artikel lengkap.",
    status: "PUBLISHED",
    organizer: "Penyelenggara Default",
    published_at: "2026-09-20T10:00:00Z",
    created_at: "2026-09-15T10:00:00Z",
    updated_at: "2026-09-20T10:00:00Z",
    view_count: 10,
    ...override,
  });

  const emptySection: HighlightSection = { items: [], failed: false };
  const failedSection: HighlightSection = { items: [], failed: true };

  it("renders all 4 category section headers with index numbers and view all links", () => {
    render(
      <CategoryHighlights
        scholarships={emptySection}
        events={emptySection}
        activities={emptySection}
        promotions={emptySection}
      />
    );

    expect(screen.getByRole("heading", { level: 2, name: "Beasiswa" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Event Kampus" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Kegiatan & Kompetisi" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Promosi" })).toBeInTheDocument();

    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByText("04")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /Lihat Semua Beasiswa/i })).toHaveAttribute("href", "/beasiswa");
    expect(screen.getByRole("link", { name: /Lihat Semua Event Kampus/i })).toHaveAttribute("href", "/event");
    expect(screen.getByRole("link", { name: /Lihat Semua Kegiatan & Kompetisi/i })).toHaveAttribute("href", "/kegiatan-kompetisi");
    expect(screen.getByRole("link", { name: /Lihat Semua Promosi/i })).toHaveAttribute("href", "/promosi");
  });

  it("renders role=alert message with friendly copy and retry link when a section fails to load", () => {
    render(
      <CategoryHighlights
        scholarships={failedSection}
        events={emptySection}
        activities={emptySection}
        promotions={emptySection}
      />
    );

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/Informasi belum dapat ditampilkan saat ini\. Silakan coba lagi nanti\./i);

    const retryLink = within(alert).getByRole("link", { name: /coba lagi/i });
    expect(retryLink).toBeInTheDocument();
    expect(retryLink).toHaveAttribute("href", "/");
  });

  it("renders role=status message when section has no published items", () => {
    render(
      <CategoryHighlights
        scholarships={emptySection}
        events={emptySection}
        activities={emptySection}
        promotions={emptySection}
      />
    );

    const statuses = screen.getAllByRole("status");
    expect(statuses).toHaveLength(4);
    expect(statuses[0]).toHaveTextContent(/Belum ada pengumuman beasiswa terbit saat ini/i);
    expect(statuses[1]).toHaveTextContent(/Belum ada pengumuman event kampus terbit saat ini/i);
    expect(statuses[2]).toHaveTextContent(/Belum ada pengumuman kegiatan & kompetisi terbit saat ini/i);
    expect(statuses[3]).toHaveTextContent(/Belum ada pengumuman promosi terbit saat ini/i);
  });

  it("renders up to 3 article cards with category-specific metadata", () => {
    const scholarshipItem = createMockItem({
      id: "sch-1",
      type: "BEASISWA",
      title: "Beasiswa Alumni 2026",
      slug: "beasiswa-alumni-2026",
      organizer: "Ikatan Alumni",
      summary: "Bantuan biaya studi semester genap.",
      registration_deadline: "2026-11-15T10:00:00Z",
    });

    const eventItem = createMockItem({
      id: "ev-1",
      type: "EVENT",
      title: "Seminar Karier Digital",
      slug: "seminar-karier-digital",
      organizer: "BEM Unpar",
      summary: "Persiapan memasuki industri digital.",
      event_start_at: "2026-10-25T10:00:00Z",
    });

    const activityItem = createMockItem({
      id: "act-1",
      type: "KEGIATAN_KOMPETISI",
      title: "Hackathon Mahasiswa Nasional",
      slug: "hackathon-mahasiswa-nasional",
      organizer: "Himpunan Mahasiswa Teknik Informatika",
      summary: "Lomba pembuatan solusi AI terapan.",
      location_or_url: "Gedung Lab Komputer & Hybrid",
    });

    const promoItem = createMockItem({
      id: "pro-1",
      type: "PROMOSI",
      title: "Diskon Kafe Mahasiswa",
      slug: "diskon-kafe-mahasiswa",
      organizer: "Koperasi Mahasiswa",
      summary: "Potongan 20% untuk seluruh menu makanan.",
      promo_period_end: "2026-12-31T10:00:00Z",
    });

    render(
      <CategoryHighlights
        scholarships={{ items: [scholarshipItem], failed: false }}
        events={{ items: [eventItem], failed: false }}
        activities={{ items: [activityItem], failed: false }}
        promotions={{ items: [promoItem], failed: false }}
      />
    );

    expect(screen.getByRole("heading", { level: 3, name: "Beasiswa Alumni 2026" })).toBeInTheDocument();
    expect(screen.getByText("Ikatan Alumni")).toBeInTheDocument();
    expect(screen.getByText(/Deadline: 15 November 2026/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Detail: Beasiswa Alumni 2026" })).toHaveAttribute(
      "href",
      "/beasiswa/beasiswa-alumni-2026"
    );

    expect(screen.getByRole("heading", { level: 3, name: "Seminar Karier Digital" })).toBeInTheDocument();
    expect(screen.getByText("BEM Unpar")).toBeInTheDocument();
    expect(screen.getByText(/25 Oktober 2026/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Detail: Seminar Karier Digital" })).toHaveAttribute(
      "href",
      "/event/seminar-karier-digital"
    );

    expect(screen.getByRole("heading", { level: 3, name: "Hackathon Mahasiswa Nasional" })).toBeInTheDocument();
    expect(screen.getByText("Gedung Lab Komputer & Hybrid")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Detail: Hackathon Mahasiswa Nasional" })).toHaveAttribute(
      "href",
      "/kegiatan-kompetisi/hackathon-mahasiswa-nasional"
    );

    expect(screen.getByRole("heading", { level: 3, name: "Diskon Kafe Mahasiswa" })).toBeInTheDocument();
    expect(screen.getByText(/Hingga 31 Desember 2026/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Detail: Diskon Kafe Mahasiswa" })).toHaveAttribute(
      "href",
      "/promosi/diskon-kafe-mahasiswa"
    );
  });

  it("limits cards to at most 3 items even when more are provided", () => {
    const items: Content[] = [1, 2, 3, 4, 5].map((idx) =>
      createMockItem({
        id: "item-" + idx,
        type: "BEASISWA",
        title: "Beasiswa Ke-" + idx,
        slug: "beasiswa-ke-" + idx,
      })
    );

    render(
      <CategoryHighlights
        scholarships={{ items, failed: false }}
        events={emptySection}
        activities={emptySection}
        promotions={emptySection}
      />
    );

    expect(screen.getByRole("heading", { level: 3, name: "Beasiswa Ke-1" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Beasiswa Ke-2" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Beasiswa Ke-3" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3, name: "Beasiswa Ke-4" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3, name: "Beasiswa Ke-5" })).not.toBeInTheDocument();
  });

  it("renders hero image with correct src, alt, loading, and decoding attributes when hero_image_url is valid", () => {
    const itemWithImage = createMockItem({
      id: "img-1",
      type: "BEASISWA",
      title: "Beasiswa Prestasi 2026",
      slug: "beasiswa-prestasi-2026",
      hero_image_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
      hero_image_alt: "Foto mahasiswa berprestasi",
    });

    render(
      <CategoryHighlights
        scholarships={{ items: [itemWithImage], failed: false }}
        events={emptySection}
        activities={emptySection}
        promotions={emptySection}
      />
    );

    const img = screen.getByRole("img", { name: "Foto mahasiswa berprestasi" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://images.unsplash.com/photo-1523240795612-9a054b0db644");
    expect(img).toHaveAttribute("alt", "Foto mahasiswa berprestasi");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("decoding", "async");
    expect(img).toHaveAttribute("width", "640");
    expect(img).toHaveAttribute("height", "360");
  });

  it("uses item title as alt fallback when hero_image_alt is absent", () => {
    const itemWithoutAlt = createMockItem({
      id: "img-2",
      type: "EVENT",
      title: "Workshop Desain UI",
      slug: "workshop-desain-ui",
      hero_image_url: "https://images.unsplash.com/photo-workshop",
      hero_image_alt: undefined,
    });

    render(
      <CategoryHighlights
        scholarships={emptySection}
        events={{ items: [itemWithoutAlt], failed: false }}
        activities={emptySection}
        promotions={emptySection}
      />
    );

    const img = screen.getByRole("img", { name: "Workshop Desain UI" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "Workshop Desain UI");
  });

  it("renders branded placeholder when hero_image_url is absent", () => {
    const itemWithoutImage = createMockItem({
      id: "no-img",
      type: "PROMOSI",
      title: "Diskon Buku Akademik",
      slug: "diskon-buku-akademik",
      organizer: "Penerbit Kampus",
      hero_image_url: undefined,
    });

    render(
      <CategoryHighlights
        scholarships={emptySection}
        events={emptySection}
        activities={emptySection}
        promotions={{ items: [itemWithoutImage], failed: false }}
      />
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    const placeholder = screen.getByTestId("item-placeholder");
    expect(placeholder).toBeInTheDocument();
    expect(within(placeholder).getByText("Promosi")).toBeInTheDocument();
  });

  it("renders branded placeholder when hero_image_url is unsafe", () => {
    const itemWithUnsafeImage = createMockItem({
      id: "unsafe-img",
      type: "KEGIATAN_KOMPETISI",
      title: "Lomba Robotika",
      slug: "lomba-robotika",
      hero_image_url: "javascript:alert(1)",
    });

    render(
      <CategoryHighlights
        scholarships={emptySection}
        events={emptySection}
        activities={{ items: [itemWithUnsafeImage], failed: false }}
        promotions={emptySection}
      />
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByTestId("item-placeholder")).toBeInTheDocument();
  });

  it("does not render 'Berakhir' badge or greyed styling for items", () => {
    const item = createMockItem({
      id: "item-clean",
      type: "BEASISWA",
      title: "Beasiswa Terbuka",
      slug: "beasiswa-terbuka",
      registration_deadline: "2026-11-15T10:00:00Z",
    });

    render(
      <CategoryHighlights
        scholarships={{ items: [item], failed: false }}
        events={emptySection}
        activities={emptySection}
        promotions={emptySection}
      />
    );

    expect(screen.queryByText("Berakhir")).not.toBeInTheDocument();
    const article = screen.getByRole("article");
    expect(article).not.toHaveClass("bg-slate-50");
    expect(article).not.toHaveClass("opacity-80");
  });

  it("renders single-column list of horizontal rectangular cards on sm+ with mobile stacked layout and modest border radius", () => {
    const item = createMockItem({
      id: "card-layout-test",
      type: "BEASISWA",
      title: "Beasiswa Unggulan Riset",
      slug: "beasiswa-unggulan-riset",
      hero_image_url: "https://images.unsplash.com/photo-test",
      hero_image_alt: "Foto riset",
    });

    const { container } = render(
      <CategoryHighlights
        scholarships={{ items: [item], failed: false }}
        events={emptySection}
        activities={emptySection}
        promotions={emptySection}
      />
    );

    // Single-column list container (must NOT have multi-column classes like sm:grid-cols-2 or lg:grid-cols-3)
    const listContainer = container.querySelector(".space-y-4, .flex-col, .grid-cols-1");
    expect(listContainer).toBeInTheDocument();
    expect(listContainer?.className).not.toMatch(/grid-cols-2|grid-cols-3|lg:grid-cols-3/);

    // Card article is horizontal rectangular (sm:flex-row), mobile stacked (flex-col), modest rounded-md/rounded-sm (not rounded-xl)
    const article = screen.getByRole("article");
    expect(article.className).toMatch(/flex-col/);
    expect(article.className).toMatch(/sm:flex-row/);
    expect(article.className).toMatch(/rounded-(?:sm|md)/);
    expect(article.className).not.toMatch(/rounded-xl/);
    expect(article.className).toMatch(/border/);
  });
});
