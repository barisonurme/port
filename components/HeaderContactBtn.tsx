'use client';

export function HeaderContactBtn() {
  function handleClick() {
    const el = document.getElementById('contact');
    if (el) {
      window.dispatchEvent(
        new CustomEvent('smooth-scroll-to', { detail: { top: el.offsetTop } })
      );
    }
  }

  return (
    <button
      onClick={handleClick}
      className="pointer-events-auto text-sm font-mono tracking-widest uppercase opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
    >
      Contact
    </button>
  );
}
