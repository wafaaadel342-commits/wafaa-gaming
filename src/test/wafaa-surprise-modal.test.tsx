import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { WafaaSurpriseModal, WAFAA_SURPRISE_STORAGE_KEY } from "@/components/home/WafaaSurpriseModal";

describe("WafaaSurpriseModal", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("does not display immediately on mount, but appears after 1000ms", () => {
    render(<WafaaSurpriseModal />);

    // Before 1000ms: not visible
    expect(screen.queryByText(/وفاء عادل/)).toBeNull();

    // Advance 999ms: still not visible
    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(screen.queryByText(/وفاء عادل/)).toBeNull();

    // Advance remaining 1ms to reach 1000ms: becomes visible
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByText(/وفاء عادل/)).toBeDefined();

    // Automatically saves seen status in localStorage upon becoming visible
    expect(localStorage.getItem(WAFAA_SURPRISE_STORAGE_KEY)).toBe("true");
  });

  it("does not appear if localStorage already indicates it was seen", () => {
    localStorage.setItem(WAFAA_SURPRISE_STORAGE_KEY, "true");

    render(<WafaaSurpriseModal />);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.queryByText(/وفاء عادل/)).toBeNull();
  });

  it("renders all required romantic text, real photo, and buttons", () => {
    render(<WafaaSurpriseModal />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Title
    expect(screen.getByText(/وفاء عادل/)).toBeDefined();

    // Paragraphs
    expect(
      screen.getByText(/عارفة إن الموقع ده مليان ألعاب وتحديات/),
    ).toBeDefined();
    expect(
      screen.getByText(/كل تفصيلة فيه وراها وقت ومجهود/),
    ).toBeDefined();
    expect(
      screen.getByText(/يمكن دي مجرد هدية بسيطة، بس أتمنى تفضل تفكرك دايمًا/),
    ).toBeDefined();

    // Sign-off
    expect(screen.getByText(/من إسلام.. بكل حب/)).toBeDefined();

    // Entrance button
    expect(screen.getByText(/يلا نبدأ المفاجأة/)).toBeDefined();

    // Photo
    const imgs = screen.getAllByRole("img", { name: "إسلام ووفاء" }) as HTMLImageElement[];
    expect(imgs.length).toBeGreaterThan(0);
    expect(imgs[0]?.getAttribute("src")).toBe("/icons/wafaa-surprise.webp");

    // Close button
    expect(screen.getByRole("button", { name: "إغلاق" })).toBeDefined();
  });

  it("opens image in gallery view when photo is clicked and closes via gallery X button", () => {
    render(<WafaaSurpriseModal />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Gallery is not open initially
    expect(screen.queryByRole("dialog", { name: /معرض الصور/ })).toBeNull();

    // Click the photo to open gallery
    const photoButton = screen.getByRole("button", { name: "فتح الصورة في المعرض" });
    fireEvent.click(photoButton);

    // Gallery is now open
    expect(screen.getByRole("dialog", { name: /معرض الصور/ })).toBeDefined();
    expect(screen.getByText(/أجمل اللحظات معاً.. وفاء وإسلام/)).toBeDefined();

    // Click gallery close button (X)
    const galleryCloseBtn = screen.getByRole("button", { name: "إغلاق المعرض" });
    fireEvent.click(galleryCloseBtn);

    // Main surprise modal is still visible
    expect(screen.getByText(/وفاء عادل/)).toBeDefined();
  });

  it("closes smoothly and keeps seen status when close (X) button is clicked", () => {
    render(<WafaaSurpriseModal />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const closeBtn = screen.getByRole("button", { name: "إغلاق" });
    fireEvent.click(closeBtn);

    expect(localStorage.getItem(WAFAA_SURPRISE_STORAGE_KEY)).toBe("true");
  });

  it("closes smoothly and keeps seen status when entrance button is clicked", () => {
    render(<WafaaSurpriseModal />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const enterBtn = screen.getByText(/يلا نبدأ المفاجأة/).closest("button")!;
    fireEvent.click(enterBtn);

    expect(localStorage.getItem(WAFAA_SURPRISE_STORAGE_KEY)).toBe("true");
  });

  it("cleans up timeout on unmount to prevent memory leaks and late execution", () => {
    const { unmount } = render(<WafaaSurpriseModal />);

    unmount();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.queryByText(/وفاء عادل/)).toBeNull();
    expect(localStorage.getItem(WAFAA_SURPRISE_STORAGE_KEY)).toBeNull();
  });
});
