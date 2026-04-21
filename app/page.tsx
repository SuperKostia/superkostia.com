import { DisplayTitle } from "@/components/home/DisplayTitle";
import { Intro } from "@/components/home/Intro";
import { Portes } from "@/components/home/Portes";

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="grid grid-cols-1 gap-0 border-b-2 border-[color:var(--color-border)] lg:grid-cols-12">
        <div className="flex min-h-[60vh] items-center px-6 py-10 sm:px-10 lg:col-span-8 lg:min-h-[75vh] lg:py-16">
          <DisplayTitle />
        </div>
        <div className="border-t-2 border-[color:var(--color-border)] lg:col-span-4 lg:border-l-2 lg:border-t-0">
          <Intro />
        </div>
      </section>

      <Portes />
    </div>
  );
}
