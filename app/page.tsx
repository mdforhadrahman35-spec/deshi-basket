"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [shipping, setShipping] = useState(80);
  const [method, setMethod] = useState("cod");
  const [checkout, setCheckout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem("db-cart") || "{}"));
    } catch {
      setCart({});
    }

    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,description,price,image_url")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error) setError("পণ্য লোড করা যাচ্ছে না। পরে আবার চেষ্টা করুন।");
      else setProducts((data || []) as Product[]);

      setLoading(false);
    }

    loadProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem("db-cart", JSON.stringify(cart));
  }, [cart]);

  const filtered = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const count = Object.values(cart).reduce((a, b) => a + b, 0);

  const subtotal = products.reduce(
    (sum, p) => sum + Number(p.price) * (cart[p.id] || 0),
    0
  );

  const total = subtotal + shipping;

  function add(id: string) {
    setCart(old => ({ ...old, [id]: (old[id] || 0) + 1 }));
  }

  function remove(id: string) {
    setCart(old => {
      const next = { ...old };
      if ((next[id] || 0) <= 1) delete next[id];
      else next[id]--;
      return next;
    });
  }

  async function placeOrder() {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert("নাম, ফোন নম্বর ও ঠিকানা পূরণ করুন।");
      return;
    }

    if (!/^01[3-9]\d{8}$/.test(phone)) {
      alert("সঠিক বাংলাদেশি মোবাইল নম্বর দিন।");
      return;
    }

    if (!subtotal) {
      alert("প্রথমে কার্টে পণ্য যোগ করুন।");
      return;
    }

    setBusy(true);

    try {
      const response = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name, phone, address },
          items: products
            .filter(p => cart[p.id])
            .map(p => ({
              product_id: p.id,
              name: p.name,
              price: p.price,
              quantity: cart[p.id]
            })),
          subtotal,
          shipping,
          total,
          method
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "অর্ডার করা যায়নি।");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        localStorage.removeItem("db-cart");
        setCart({});
        alert("আপনার অর্ডার গ্রহণ করা হয়েছে।");
        setCheckout(false);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "একটি সমস্যা হয়েছে।");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="wrap">
      <div className="top">
        সারা বাংলাদেশে পণ্য ডেলিভারি | নিরাপদ কেনাকাটা
      </div>

      <header className="nav">
        <a href="/" className="brand">
          Deshi Basket
          <small>আপনার বিশ্বস্ত অনলাইন বাজার</small>
        </a>

        <div className="navlinks">
          <a href="#products">পণ্যসমূহ</a>
          <button className="btn" onClick={() => setCheckout(!checkout)}>
            🛒 কার্ট ({count})
          </button>
        </div>
      </header>

      <section className="hero">
        <div>
          <span className="muted">স্বাগতম Deshi Basket-এ</span>
          <h1>আপনার পছন্দের পণ্য, এখন ঘরে বসেই!</h1>
          <p>
            সহজ কেনাকাটা, সাশ্রয়ী দাম এবং নির্ভরযোগ্য ডেলিভারি।
            আপনার দৈনন্দিন কেনাকাটা হোক আরও আনন্দময়।
          </p>
          <a href="#products" className="btn">
            কেনাকাটা শুরু করুন →
          </a>
        </div>
        <div className="heroArt">🛍️ 🥬 🥭</div>
      </section>

      <section id="products">
        <div className="sectionhead">
          <div>
            <h2>আমাদের পণ্যসমূহ</h2>
            <p className="muted">আপনার পছন্দের পণ্য বেছে নিন</p>
          </div>
          <span className="price">{products.length} টি পণ্য</span>
        </div>

        <input
          className="field"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 পণ্যের নাম লিখে খুঁজুন..."
        />

        {error && <div className="notice">{error}</div>}

        {loading ? (
          <div className="panel">পণ্য লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div className="panel">
            কোনো পণ্য পাওয়া যায়নি। পরে আবার চেষ্টা করুন।
          </div>
        ) : (
          <div className="grid">
            {filtered.map(p => (
              <article className="product" key={p.id}>
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} />
                ) : (
                  <div style={{
                    height: 180,
                    display: "grid",
                    placeItems: "center",
                    background: "#eef1e9",
                    fontSize: 55
                  }}>
                    🛍️
                  </div>
                )}

                <div className="pad">
                  <h3>{p.name}</h3>
                  <p className="muted">{p.description || "মানসম্মত পণ্য"}</p>
                  <div className="price">
                    ৳{Number(p.price).toLocaleString("en-BD")}
                  </div>
                  <button
                    className="btn"
                    style={{ width: "100%", marginTop: 10 }}
                    onClick={() => add(p.id)}
                  >
                    + কার্টে যোগ করুন
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {checkout && (
        <section className="panel" id="checkout">
          <h2>🛒 আপনার শপিং কার্ট</h2>

          {products.filter(p => cart[p.id]).map(p => (
            <div className="cartrow" key={p.id}>
              <div>
                <b>{p.name}</b>
                <div className="muted">
                  ৳{p.price} × {cart[p.id]}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button className="btn light" onClick={() => remove(p.id)}>
                  −
                </button>
                <b>{cart[p.id]}</b>
                <button className="btn" onClick={() => add(p.id)}>
                  +
                </button>
              </div>
            </div>
          ))}

          {count === 0 ? (
            <p className="muted">আপনার কার্ট খালি।</p>
          ) : (
            <>
              <h3>ডেলিভারি তথ্য</h3>

              <label>আপনার নাম</label>
              <input
                className="field"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="সম্পূর্ণ নাম"
              />

              <label>মোবাইল নম্বর</label>
              <input
                className="field"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                inputMode="numeric"
              />

              <label>সম্পূর্ণ ঠিকানা</label>
              <textarea
                className="field"
                rows={3}
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="বাড়ি, রোড, এলাকা, জেলা"
              />

              <label>ডেলিভারি চার্জ (৳)</label>
              <input
                className="field"
                type="number"
                min="0"
                value={shipping}
                onChange={e => setShipping(Math.max(0, Number(e.target.value)))}
              />

              <label>পেমেন্ট পদ্ধতি</label>
              <select
                className="field"
                value={method}
                onChange={e => setMethod(e.target.value)}
              >
                <option value="cod">ক্যাশ অন ডেলিভারি</option>
                <option value="sslcommerz">বিকাশ / নগদ / কার্ড (Gateway)</option>
              </select>

              <div className="cartrow">
                <span>পণ্যের মূল্য</span>
                <b>৳{subtotal}</b>
              </div>

              <div className="cartrow">
                <span>ডেলিভারি চার্জ</span>
                <b>৳{shipping}</b>
              </div>

              <div className="cartrow">
                <b>সর্বমোট</b>
                <b className="price">৳{total}</b>
              </div>

              <button
                className="btn"
                disabled={busy}
                style={{ width: "100%", marginTop: 15 }}
                onClick={placeOrder}
              >
                {busy ? "প্রসেস হচ্ছে..." : "অর্ডার কনফার্ম করুন"}
              </button>
            </>
          )}
        </section>
      )}

      <footer className="footer">
        <h2>Deshi Basket</h2>
        <p>আপনার বিশ্বস্ত অনলাইন বাজার।</p>
        <p>© {new Date().getFullYear()} Deshi Basket. All rights reserved.</p>
      </footer>
    </main>
  );
         }
