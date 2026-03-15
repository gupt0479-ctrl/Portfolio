import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import type { Achievement } from "@/sanity/types";

const ACHIEVEMENTS_SECTION_QUERY = defineQuery(`
  *[_type == "achievement"] | order(date desc){
    _id, title, description, date, type, featured
  }
`);

export async function AchievementsSection() {
  const { data: items } = await sanityFetch({
    query: ACHIEVEMENTS_SECTION_QUERY,
  });
  if (!items?.length) return null;

  const list = items as Achievement[];
  const featured = list.filter((a) => a.featured);
  const rest = list.filter((a) => !a.featured);

  return (
    <section id="achievements" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-16">
        <h2 className="text-4xl md:text-5xl font-bold">
          Achievements & Awards
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...featured, ...rest].map((item: Achievement) => (
          <div
            key={item._id}
            className={`rounded-xl border p-6 ${
              item.featured ? "border-primary/40 bg-primary/5" : "border-border"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">🏆</div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  {item.type && (
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                      {item.type}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-muted-foreground text-sm mt-2">
                    {item.description}
                  </p>
                )}
                {item.date && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(item.date).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
