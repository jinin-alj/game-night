import Link from "next/link";
import { DecorativeArt } from "@/components/DecorativeArt";
import { primaryButtonClassName, textLinkClassName } from "@/components/styles";

const steps = [
  { text: "Add the games your group owns", art: "/art/zone-1.svg" },
  { text: "Create a night and tick who’s coming", art: "/art/zone-2.svg" },
  { text: "Get a lineup that fills your evening", art: "/art/zone-3.svg" },
];

/** The public landing page: what the app does, who it is for, and one Sign up button. */
export default function LandingPage() {
  return (
    <main id="main" tabIndex={-1} className="flex flex-1 flex-col">
      <div className="h-[260px] w-full overflow-hidden sm:h-[420px]">
        <DecorativeArt
          src="/art/panorama.svg"
          width={2400}
          height={900}
          preload
          // On phones only part of the panorama fits, so show the mountains and lake on the left.
          className="h-full w-full object-cover object-[12%_50%] sm:object-center"
        />
      </div>

      <div className="mx-auto -mt-16 flex w-full max-w-3xl flex-col gap-12 px-4 pb-12 sm:-mt-24 sm:pb-20">
        <section className="flex flex-col gap-5 rounded-2xl bg-paper-light p-6 shadow-sm sm:p-10">
          <p className="font-semibold text-pine">Game Night Planner</p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Plan your weekly board game night in minutes
          </h1>
          <p className="text-lg">
            For students who host game nights: say who’s coming and how much
            time you have, and get a lineup of games that fits.
          </p>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link href="/signup" className={primaryButtonClassName}>
              Sign up free
            </Link>
            <p>
              Already have an account?{" "}
              <Link href="/login" className={textLinkClassName}>
                Log in
              </Link>
            </p>
          </div>
        </section>

        <section aria-labelledby="how-it-works">
          <h2 id="how-it-works" className="text-xl font-bold">
            How it works
          </h2>
          <ol className="mt-4 grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li
                key={step.text}
                className="flex items-center gap-3 rounded-2xl bg-paper-light p-3 sm:flex-col sm:items-start"
              >
                <DecorativeArt
                  src={step.art}
                  width={64}
                  height={64}
                  className="h-16 w-16 shrink-0 rounded-xl sm:h-auto sm:w-full"
                />
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mustard font-bold"
                  >
                    {index + 1}
                  </span>
                  <span>{step.text}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
