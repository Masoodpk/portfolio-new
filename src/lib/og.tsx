import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** Shared 1200×630 social card in the site's visual language. */
export const ogSize = { width: 1200, height: 630 };

const asset = (path: string) => readFile(join(process.cwd(), "assets-src", path));

type Card = {
  eyebrow: string;
  title: string;
  subtitle: string;
  footer: string;
  /** Show the hand render on the right */
  withHand?: boolean;
};

export async function renderOgCard({ eyebrow, title, subtitle, footer, withHand = false }: Card) {
  const [display, body, mono, hand] = await Promise.all([
    asset("fonts/Archivo-Expanded-ExtraBold.ttf"),
    asset("fonts/Archivo-Medium.ttf"),
    asset("fonts/GeistMono-Medium.ttf"),
    withHand ? asset("images/hand-og.png") : Promise.resolve(null),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#0b0b0c",
          backgroundImage: "radial-gradient(circle at 82% 45%, rgba(255,95,31,0.22), rgba(11,11,12,0) 45%)",
          color: "#f2f1ee",
          padding: "64px 72px",
          fontFamily: "Archivo",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "Geist Mono", fontSize: 20, letterSpacing: 3, color: "#a3a19c" }}>
            <div style={{ width: 12, height: 12, borderRadius: 999, background: "#ff5f1f" }} />
            {eyebrow.toUpperCase()}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Archivo Expanded", fontSize: title.length > 12 ? 92 : withHand ? 108 : 124, lineHeight: 0.9, letterSpacing: -3, textTransform: "uppercase" }}>
              {title}
            </div>
            <div style={{ marginTop: 28, fontSize: 38, lineHeight: 1.15, color: "#a3a19c", maxWidth: withHand ? 700 : 900 }}>
              {subtitle}
            </div>
          </div>
          <div style={{ display: "flex", fontFamily: "Geist Mono", fontSize: 20, letterSpacing: 2, color: "#85837e", borderTop: "1px solid #26262a", paddingTop: 24, maxWidth: withHand ? 760 : 1056 }}>
            {footer.toUpperCase()}
          </div>
        </div>
        {hand ? (
          // eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img>
          <img
            src={`data:image/png;base64,${hand.toString("base64")}`}
            width={198}
            height={560}
            alt=""
            style={{ position: "absolute", right: 36, bottom: 0 }}
          />
        ) : null}
        <div style={{ position: "absolute", top: 0, left: 72, right: 72, height: 4, background: "#ff5f1f" }} />
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Archivo Expanded", data: display, weight: 800, style: "normal" },
        { name: "Archivo", data: body, weight: 500, style: "normal" },
        { name: "Geist Mono", data: mono, weight: 500, style: "normal" },
      ],
    },
  );
}
