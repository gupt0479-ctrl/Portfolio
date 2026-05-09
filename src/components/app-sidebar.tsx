import { Suspense } from "react";
import { PortfolioLab } from "@/components/lab/PortfolioLab";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarContent className="h-full w-full bg-[#07070d] border-l border-white/[0.07] overflow-hidden">
        <Suspense
          fallback={
            <div className="h-full w-full flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-white/15 border-t-white/50 animate-spin" />
            </div>
          }
        >
          <PortfolioLab />
        </Suspense>
      </SidebarContent>
    </Sidebar>
  );
}
