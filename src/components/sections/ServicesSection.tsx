import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";

type ServiceItem = {
  _id: string;
  title?: string;
  description?: string;
  features?: string[];
  price?: number;
  priceType?: string;
  featured?: boolean;
  icon?: string;
  order?: number;
};

const SERVICES_SECTION_QUERY = defineQuery(`
  *[_type == "service"] | order(order asc){
    _id, title, description, features, price, priceType, featured, icon, order
  }
`);

export async function ServicesSection() {
  const { data: services } = await sanityFetch({
    query: SERVICES_SECTION_QUERY,
  });
  if (!services?.length) return null;

  const list = services as ServiceItem[];
  const featured = list.filter((s) => s.featured);
  const rest = list.filter((s) => !s.featured);

  return (
    <section id="services" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-16">
        <h2 className="text-4xl md:text-5xl font-bold">Services</h2>
        <p className="text-lg text-muted-foreground mt-3">
          What I offer and how I can help you.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...featured, ...rest].map((service: ServiceItem) => (
          <div
            key={service._id}
            className={`rounded-2xl border p-6 flex flex-col ${
              service.featured ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <div className="text-3xl mb-3">{service.icon ?? "⚡"}</div>
            <h3 className="text-xl font-semibold">{service.title}</h3>
            {service.description && (
              <p className="text-muted-foreground text-sm mt-2 flex-1">
                {service.description}
              </p>
            )}
            {service.features && service.features.length > 0 && (
              <ul className="mt-4 space-y-1">
                {service.features.map((f: string, i: number) => (
                  <li key={i} className="text-sm flex items-center gap-2">
                    <span className="text-primary">✓</span> {f}
                  </li>
                ))}
              </ul>
            )}
            {service.price != null && (
              <div className="mt-4 pt-4 border-t border-border">
                <span className="text-2xl font-bold">${service.price}</span>
                <span className="text-sm text-muted-foreground ml-1">
                  /{service.priceType ?? "project"}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
