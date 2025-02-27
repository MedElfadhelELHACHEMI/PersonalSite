import {ThemeSwitcher} from "@/app/theme-switcher";
import Marquee from "@/components/ui/marquee";

export default function Home() {
  return <>
    <div>
      <p className="text-4xl">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Commodo sint, augue nam duo odio quis qui vero invidunt diam euismod facilisis commodi erat enim nobis. Culpa eum exercitation sunt. Hendrerit autem commodo elitr, wisi nibh duis kasd cum cum anim mollit possim et wisi incidunt eum gubergren feugiat nobis dolore aliquid. Aliquip nihil duis vero sanctus sed. Volutpat labore vero. </p>
      <ThemeSwitcher/>
      <div className={
        "absolute bottom-0 -rotate-45"
      }>
        <Marquee items={
          [
            "Lorem",
            "ipsum",
            "dolor",
            "sit",
            "amet",
            "consectetur",
            "adipiscing",
            "elit"
          ]
        } />
      </div>

    </div>
  </>
}
