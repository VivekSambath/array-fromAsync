// Arrow keys, Space and Page Up/Down move between slide pages.
document.addEventListener("keydown", (e) => {
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  // Leave keys alone while a demo control has focus.
  if (e.target.closest("button, input, select, textarea")) return;
  let rel = null;
  if (["ArrowRight", "PageDown", " "].includes(e.key)) rel = "next";
  else if (["ArrowLeft", "PageUp"].includes(e.key)) rel = "prev";
  const link = rel && document.querySelector(`.deck-nav a[rel="${rel}"]`);
  if (!link) return;
  e.preventDefault();
  location.href = link.href;
});
