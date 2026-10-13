/* @vitest-environment happy-dom */

import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ImageLoadingWindow } from "../components/ResponsiveImage"
import { SocialVideoCard } from "../components/SocialMediaGallery/SocialVideoCard"

;(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

describe("YAMI social video image placeholders", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("plays visible videos concurrently and releases each offscreen video independently", async () => {
    const observers: IntersectionObserverCallback[] = []
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: IntersectionObserverCallback) { observers.push(callback) }
      observe() {}
      disconnect() {}
    })
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue()
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {})
    const load = vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {})
    await act(async () => {
      root.render(
        <>
          {["first", "second"].map((id) => (
            <SocialVideoCard
              key={id}
              id={id}
              posterSrc={`/${id}.jpg`}
              videoSrc={`/${id}.mp4`}
              posterAlt={id}
              username="@Yami"
              caption="Video post"
            />
          ))}
        </>,
      )
    })
    const videos = container.querySelectorAll("video")
    const setVisible = async (index: number, isIntersecting: boolean) => {
      await act(async () => observers[index]([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver))
    }

    expect(play).not.toHaveBeenCalled()
    for (const video of videos) {
      expect(video.hasAttribute("src")).toBe(false)
      expect(video.preload).toBe("none")
    }
    await setVisible(0, true)
    await setVisible(1, true)
    expect(play).toHaveBeenCalledTimes(2)
    expect(pause).not.toHaveBeenCalled()
    for (const video of videos) {
      expect(video.muted).toBe(true)
      expect(video.loop).toBe(true)
      expect(video.hasAttribute("src")).toBe(true)
    }
    await setVisible(0, false)
    expect(pause).toHaveBeenCalledTimes(1)
    expect(load).toHaveBeenCalledTimes(1)
    expect(videos[0].hasAttribute("src")).toBe(false)
    expect(videos[1].getAttribute("src")).toBe("/second.mp4")
    await setVisible(0, true)
    expect(play).toHaveBeenCalledTimes(3)
    expect(videos[0].getAttribute("src")).toBe("/first.mp4")
    await act(async () => root.render(null))
    expect(pause).toHaveBeenCalledTimes(3)
    expect(load).toHaveBeenCalledTimes(3)
    for (const video of videos) expect(video.hasAttribute("src")).toBe(false)
  })

  it("cycles visible image posts every five seconds, resets offscreen, and cleans up", async () => {
    vi.useFakeTimers()
    vi.stubGlobal("matchMedia", () => ({ matches: false }))
    let notify: IntersectionObserverCallback
    const disconnect = vi.fn()
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: IntersectionObserverCallback) { notify = callback }
      observe() {}
      disconnect = disconnect
    })
    await act(async () => {
      root.render(
        <SocialVideoCard
          id="multi-image-post"
          posterSrc="/fallback.jpg"
          images={["/first.jpg", "/second.jpg", "/third.jpg"]}
          posterAlt="Tableware photos"
          username="@Yami"
          caption="Tableware favorites"
        />,
      )
    })
    const image = container.querySelector<HTMLImageElement>("img")!
    const setVisible = async (isIntersecting: boolean) => {
      await act(async () => notify([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver))
    }
    const advance = async (milliseconds: number) => {
      await act(async () => vi.advanceTimersByTime(milliseconds))
    }

    expect(image.getAttribute("src")).toBe("/first.jpg")
    await advance(10000)
    expect(image.getAttribute("src")).toBe("/first.jpg")
    await setVisible(true)
    await advance(4999)
    expect(image.getAttribute("src")).toBe("/first.jpg")
    await advance(1)
    expect(image.getAttribute("src")).toBe("/second.jpg")
    await advance(5000)
    expect(image.getAttribute("src")).toBe("/third.jpg")
    await advance(5000)
    expect(image.getAttribute("src")).toBe("/first.jpg")
    await advance(5000)
    await setVisible(false)
    expect(image.getAttribute("src")).toBe("/first.jpg")
    await advance(10000)
    expect(image.getAttribute("src")).toBe("/first.jpg")
    await setVisible(true)
    await advance(5000)
    expect(image.getAttribute("src")).toBe("/second.jpg")
    await act(async () => root.render(null))
    expect(disconnect).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })

  it("keeps multi-image posts still when reduced motion is requested", async () => {
    vi.useFakeTimers()
    vi.stubGlobal("matchMedia", () => ({ matches: true }))
    await act(async () => {
      root.render(
        <SocialVideoCard
          id="reduced-motion-post"
          posterSrc="/fallback.jpg"
          images={["/first.jpg", "/second.jpg"]}
          posterAlt="Tableware photos"
          username="@Yami"
          caption="Tableware favorites"
        />,
      )
      vi.advanceTimersByTime(10000)
    })
    expect(container.querySelector("img")?.getAttribute("src")).toBe("/first.jpg")
    expect(vi.getTimerCount()).toBe(0)
  })

  it("renders an image post with its creator and no detail action or platform icon", async () => {
    await act(async () => {
      root.render(
        <SocialVideoCard
          id="image-post"
          posterSrc="/image-post.webp"
          posterAlt="Starman tableware"
          username="@Yami"
          caption="Tableware favorites"
        />,
      )
    })

    const media = container.querySelector('[data-slot="social-video-card-media"]')!
    expect(media.querySelectorAll("img")).toHaveLength(1)
    expect(media.querySelector("img")?.getAttribute("alt")).toBe("Starman tableware")
    expect(media.textContent).toBe("@Yami")
    expect(media.querySelector("a, button, video")).toBeNull()
    expect(container.querySelector('[role="dialog"]')).toBeNull()
  })

  it("keeps poster and product media pending until their images load", async () => {
    await act(async () => {
      root.render(
        <ImageLoadingWindow strategy="windowed">
          <SocialVideoCard
            id="social-card"
            posterSrc="/poster.webp"
            posterAlt="Social poster"
            username="@yami"
            platformIconSrc="/platform.svg"
            caption="Featured products"
            products={[
              {
                id: "product",
                imageSrc: "/product.webp",
                imageAlt: "Featured product",
              },
            ]}
          />
        </ImageLoadingWindow>,
      )
    })

    const poster = container.querySelector<HTMLImageElement>(
      '[data-slot="social-video-card-media"] > img',
    )!
    const product = container.querySelector<HTMLImageElement>(
      '[data-slot="social-video-card-products"] img',
    )!

    expect(poster.dataset.imageState).toBe("pending")
    expect(product.dataset.imageState).toBe("pending")
  })
})
