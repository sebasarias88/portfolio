import { setRequestLocale } from "next-intl/server";
import { About } from "@/components/sections/home/About";
import { Contact } from "@/components/sections/home/Contact";
import { Experience } from "@/components/sections/home/Experience";
import { FeaturedProjects } from "@/components/sections/home/FeaturedProjects";
import { Hero } from "@/components/sections/home/Hero";
import { Stats } from "@/components/sections/home/Stats";
import { TechStack } from "@/components/sections/home/TechStack";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Stats />
      <FeaturedProjects />
      <Experience />
      <TechStack />
      <About />
      <Contact />
    </>
  );
}
