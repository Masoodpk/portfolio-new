import { serializeJsonLd } from "@/lib/structured-data";

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Safe: serialised from our own static data with "<" escaped.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
