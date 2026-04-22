import { DisplayTitle } from "@/components/home/DisplayTitle";
import { Intro } from "@/components/home/Intro";
import { Portes } from "@/components/home/Portes";
import { Marquee } from "@/components/home/Marquee";
import { Ticker } from "@/components/home/Ticker";
import { WaterField } from "@/components/ui/WaterField";

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="grid grid-cols-1 gap-0 border-b-2 border-[color:var(--color-border)] lg:grid-cols-12">
        <div className="hero-sand relative flex min-h-[60vh] items-center overflow-hidden px-6 py-10 sm:px-10 lg:col-span-8 lg:min-h-[75vh] lg:py-16">
          <WaterField />
          <DisplayTitle />
        </div>
        <div className="border-t-2 border-[color:var(--color-border)] lg:col-span-4 lg:border-l-2 lg:border-t-0">
          <Intro />
        </div>
      </section>

      <Marquee />

      <Portes />

      <Ticker />
    </div>
  );
}
