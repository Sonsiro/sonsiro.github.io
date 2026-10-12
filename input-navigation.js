/* Cross-platform touch, mouse, keyboard, and Android TV remote navigation. */
(() => {
  "use strict";

  const surface = document.querySelector("[data-gesture-surface]");
  const focusSelector = 'a[href], button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])';
  const swipeTargets = () => [...document.querySelectorAll(".grid .download")].filter(isVisible);
  const threshold = 42;
  const scrollBehavior = () => matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  let touchStart = null;
  let mouseStart = null;
  let suppressClick = false;

  function isVisible(element) {
    return element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden";
  }

  function focusables() {
    return [...document.querySelectorAll(focusSelector)].filter(element =>
      isVisible(element) && !element.closest("[inert]")
    );
  }

  function focus(element) {
    if (!element) return;
    element.focus({ preventScroll: true });
    element.scrollIntoView({ behavior: scrollBehavior(), block: "nearest", inline: "nearest" });
  }

  function moveFocus(direction) {
    const items = focusables();
    if (!items.length) return;

    const current = document.activeElement;
    if (current instanceof HTMLInputElement || current?.isContentEditable) return;

    if (!items.includes(current)) {
      focus(items[0]);
      return;
    }

    const vectors = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0]
    };
    const [vx, vy] = vectors[direction];
    const from = current.getBoundingClientRect();
    const originX = from.left + from.width / 2;
    const originY = from.top + from.height / 2;
    let nearest = null;
    let nearestScore = Infinity;

    for (const candidate of items) {
      if (candidate === current) continue;
      const rect = candidate.getBoundingClientRect();
      const dx = rect.left + rect.width / 2 - originX;
      const dy = rect.top + rect.height / 2 - originY;
      const forward = dx * vx + dy * vy;
      if (forward <= 4) continue;
      const perpendicular = Math.abs(dx * vy - dy * vx);
      const score = forward + perpendicular * 1.65;
      if (score < nearestScore) {
        nearest = candidate;
        nearestScore = score;
      }
    }

    if (nearest) focus(nearest);
  }

  function focusAdjacentCard(direction) {
    const cards = swipeTargets();
    if (!cards.length) return;
    const activeIndex = cards.indexOf(document.activeElement);
    const nextIndex = activeIndex < 0
      ? (direction > 0 ? 0 : cards.length - 1)
      : Math.max(0, Math.min(cards.length - 1, activeIndex + direction));
    focus(cards[nextIndex]);
  }

  function onTouchStart(event) {
    if (!surface || event.touches.length !== 1) return;
    const touch = event.touches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
  }

  function onTouchMove(event) {
    if (!touchStart || event.touches.length !== 1) return;
    const touch = event.touches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.15) event.preventDefault();
  }

  function onTouchEnd(event) {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy) * 1.15) {
      focusAdjacentCard(dx < 0 ? 1 : -1);
      suppressNextClick();
    }
  }

  function onMouseDown(event) {
    if (!surface || event.button !== 0 || event.target.closest("a, button, input, select, textarea")) return;
    mouseStart = { x: event.clientX, y: event.clientY, dragged: false };
  }

  function onMouseMove(event) {
    if (!mouseStart) return;
    const dx = event.clientX - mouseStart.x;
    const dy = event.clientY - mouseStart.y;
    if (Math.hypot(dx, dy) > 8) {
      mouseStart.dragged = true;
      surface.classList.add("is-dragging");
    }
  }

  function onMouseUp(event) {
    if (!mouseStart) return;
    const { x, y, dragged } = mouseStart;
    const dx = event.clientX - x;
    const dy = event.clientY - y;
    mouseStart = null;
    surface?.classList.remove("is-dragging");
    if (!dragged) return;

    if (Math.abs(dx) > Math.abs(dy) * 1.15 && Math.abs(dx) >= threshold) {
      focusAdjacentCard(dx < 0 ? 1 : -1);
    } else if (Math.abs(dy) >= threshold) {
      window.scrollBy({ top: -dy, behavior: scrollBehavior() });
    }
    suppressNextClick();
  }

  function suppressNextClick() {
    suppressClick = true;
    window.setTimeout(() => { suppressClick = false; }, 300);
  }

  function handleBack() {
    const search = document.querySelector("#search");
    if (document.activeElement === search) {
      search.blur();
      return;
    }
    document.dispatchEvent(new CustomEvent("app:back", {
      bubbles: true,
      cancelable: true,
      detail: { source: "remote-or-keyboard" }
    }));
  }

  document.addEventListener("keydown", event => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
      if (document.activeElement instanceof HTMLInputElement || document.activeElement?.isContentEditable) return;
      event.preventDefault();
      moveFocus(event.key);
      return;
    }

    if (event.key === "Enter") {
      const active = document.activeElement;
      if (active?.matches("[role=button], [role=link]")) {
        event.preventDefault();
        active.click();
      }
      return; // Native links and buttons already activate on Enter.
    }

    const isBack = ["Escape", "Backspace", "Back", "GoBack", "BrowserBack"].includes(event.key)
      || event.keyCode === 4;
    const editingText = event.target instanceof HTMLInputElement
      || event.target instanceof HTMLTextAreaElement
      || event.target?.isContentEditable;
    if (isBack && !(event.key === "Backspace" && editingText)) {
      event.preventDefault();
      handleBack();
    }
  });

  if (surface) {
    surface.addEventListener("touchstart", onTouchStart, { passive: true });
    surface.addEventListener("touchmove", onTouchMove, { passive: false });
    surface.addEventListener("touchend", onTouchEnd, { passive: true });
    surface.addEventListener("touchcancel", () => { touchStart = null; }, { passive: true });
    surface.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    surface.addEventListener("click", event => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
      suppressClick = false;
    }, true);
  }
})();
