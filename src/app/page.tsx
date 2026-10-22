import Link from "next/link";
import { primaryButtonClassName, textLinkClassName } from "@/components/styles";

const steps = [
  "Add the games your group owns",
  "Create a night and tick who’s coming",
  "Get a lineup that fills your evening",
];

/** The public landing page: what the app does, who it is for, and one Sign up button. */
export default function LandingPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-12 px-4 py-12 sm:py-20">
      <section className="flex flex-col gap-5">
        <p className="font-semibold text-pine">Game Night Planner</p>
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
          Plan your weekly board game night in minutes
        </h1>
        <p className="text-lg">
          For students who host game nights: say who’s coming and how much time
          you have, and get a lineup of games that fits.
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
              key={step}
              className="flex gap-3 rounded-2xl bg-paper-light p-4"
            >
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mustard font-bold"
              >
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
