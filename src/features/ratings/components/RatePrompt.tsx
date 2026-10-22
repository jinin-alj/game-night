import type { GameToRate } from "../games-to-rate";
import { RatingForm } from "./RatingForm";

type RatePromptProps = {
  gamesToRate: GameToRate[];
};

/** Asks the user to rate the games played on nights they attended; hidden when there are none. */
export function RatePrompt({ gamesToRate }: RatePromptProps) {
  if (gamesToRate.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="rate-prompt-heading"
      className="flex flex-col gap-4 rounded-2xl border-2 border-mustard bg-paper-light p-5"
    >
      <div>
        <h2 id="rate-prompt-heading" className="text-xl font-bold">
          Rate tonight’s games
        </h2>
        <p>Your ratings help plan the next night.</p>
      </div>
      <ul className="flex flex-col gap-4">
        {gamesToRate.map((game) => (
          <li key={game.gameId}>
            <RatingForm
              formId={`prompt-${game.gameId}`}
              gameId={game.gameId}
              label={`${game.gameTitle} (1–10)`}
              currentScore={null}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
