"use strict";
const $ = (id) => document.getElementById(id);
let offset = 0; const limit = 50;
function cell(tr, text, cls) { const td = document.createElement("td"); td.textContent = text ?? ""; if (cls) td.className = cls; tr.appendChild(td); return td; }
function row(e, text) {
  const tr = document.createElement("tr");
  cell(tr, e.timestamp || ""); cell(tr, e.type); cell(tr, e.subject); cell(tr, e.actor || "");
  const st = cell(tr, ""); const s = document.createElement("span"); s.className = "st " + (e.status || ""); s.textContent = e.status || "?"; st.appendChild(s);
  cell(tr, e.trust); cell(tr, text);
  const b = document.createElement("button"); b.textContent = "Approve"; b.disabled = true; b.title = "Human-only; step 2";
  const td = cell(tr, ""); if (e.status === "proposed") td.appendChild(b);
  $("rows").appendChild(tr);
}
async function load() {
  const p = new URLSearchParams({ limit, offset }); if ($("status").value) p.set("status", $("status").value); if ($("trust").value) p.set("trust", $("trust").value);
  const d = await (await fetch("/api/events?" + p)).json(); $("rows").replaceChildren();
  if (d.error) { $("info").textContent = d.error; return; }
  d.events.forEach((e) => row(e, e.text));
  $("info").textContent = `${d.total} events, showing ${d.total ? offset + 1 : 0}–${offset + d.events.length}`;
  $("prev").disabled = offset === 0; $("next").disabled = offset + limit >= d.total;
}
async function search() {
  const q = $("q").value.trim(); if (!q) return load();
  const d = await (await fetch("/api/search?" + new URLSearchParams({ q }))).json(); $("rows").replaceChildren();
  d.results.forEach((e) => row(e, e.snippet)); $("info").textContent = `${d.results.length} search hits`;
  $("prev").disabled = $("next").disabled = true;
}
$("status").onchange = $("trust").onchange = () => { offset = 0; load(); };
$("go").onclick = search; $("q").onkeydown = (ev) => { if (ev.key === "Enter") search(); };
$("clear").onclick = () => { $("q").value = ""; offset = 0; load(); };
$("prev").onclick = () => { offset = Math.max(0, offset - limit); load(); };
$("next").onclick = () => { offset += limit; load(); };
load();
