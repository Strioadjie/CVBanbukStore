"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppNavbar from "@/components/AppNavbar";
import ProductImage from "@/components/ProductImage";

export default function AddProductPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    material: "",
    size: "",
    image: "",
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        image: String(reader.result || ""),
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Produk berhasil ditambahkan!");
        router.push("/products");
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menambahkan produk");
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (session?.user.role !== "ADMIN") {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <div className="glass-panel px-8 py-6 text-sm text-slate-300">
          Unauthorized - Hanya admin yang bisa akses halaman ini
        </div>
      </div>
    );
  }

  return (
    <main className="page-shell pb-16">
      <AppNavbar />

      <div className="content-wrap py-8">
        <div className="glass-panel p-6 sm:p-8">
          <span className="section-kicker">Admin tools</span>
          <h1 className="section-title">Tambah produk baru</h1>
          <p className="section-subtitle">
            Admin bisa menambahkan foto produk langsung dari komputer. Untuk MVP, gambar akan disimpan ke field `image` dan langsung tampil di katalog.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Nama Produk *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="app-input"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Harga (Rp) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="app-input"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Stok *
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="app-input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Deskripsi *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="app-input min-h-[120px]"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Bahan *
              </label>
              <input
                type="text"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                className="app-input"
                placeholder="Contoh: Kulit Asli"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Ukuran *
              </label>
              <input
                type="text"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="app-input"
                placeholder="Contoh: 30x25x10 cm"
                required
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Upload Foto Produk
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="app-input file:mr-4 file:rounded-full file:border-0 file:bg-teal-500/15 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-teal-300"
                />
                <p className="mt-2 text-xs text-slate-400">
                  Bisa upload dari device atau isi manual dengan URL jika diperlukan.
                </p>

                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="app-input mt-3"
                  placeholder="Atau tempel URL gambar"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-200">Preview</p>
                <div className="overflow-hidden rounded-[24px] border border-slate-800 bg-slate-950/70">
                  <div className="h-56">
                    <ProductImage src={formData.image} alt={formData.name || "Preview produk"} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="app-button-primary flex-1"
              >
                {loading ? "Menyimpan..." : "Tambah Produk"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="app-button-secondary flex-1"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
