/**
 * Renders a JSON-LD structured data block. Uses a raw `<script>` tag (not
 * `next/script`) per Next.js's own JSON-LD guide, since this is inert data,
 * not executable code — and escapes `<` to guard against XSS via
 * `dangerouslySetInnerHTML`, also per that guide.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
