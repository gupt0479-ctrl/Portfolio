---
inclusion: fileMatch
fileMatchPattern: "src/components/**/*"
---

# Component Patterns

## Server Component (default)
```tsx
import { sanityFetch } from "@/sanity/lib/live";
import { defineQuery } from "next-sanity";

const MY_QUERY = defineQuery(`*[_type == "project"]{ _id, title }`);

export async function MySection() {
  const { data } = await sanityFetch({ query: MY_QUERY });
  return <section>{/* render data */}</section>;
}
```

## Client Component (only when needed)
```tsx
"use client";
import { useState } from "react";

export function InteractiveWidget({ data }: { data: SomeType }) {
  const [active, setActive] = useState(false);
  return <div onClick={() => setActive(!active)}>{/* ... */}</div>;
}
```

## Section Component Structure
All portfolio sections follow this pattern:
- Server component fetches data via `sanityFetch`
- Passes data to a client component if interactivity is needed
- Uses `react-intersection-observer` for scroll animations
- Wrapped in `<section>` with consistent padding and id for navigation

## Image Handling
```tsx
import { urlFor } from "@/sanity/lib/image";

// In JSX:
<Image
  src={urlFor(image).width(800).height(600).url()}
  alt={image.alt || ""}
  width={800}
  height={600}
/>
```

## Portable Text Rendering
```tsx
import { PortableText } from "@portabletext/react";

<PortableText value={content} />
```

## Animation Pattern
```tsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
>
```

## Conditional Classes
```tsx
import { cn } from "@/lib/utils";

<div className={cn("base-classes", condition && "conditional-classes")} />
```
