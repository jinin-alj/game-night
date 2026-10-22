import { focusRingClassName } from "@/components/styles";
import { logOut } from "../actions";

/** The Log out button shown in the header of every logged-in page. */
export function LogOutButton() {
  return (
    <form action={logOut}>
      <button
        type="submit"
        data-testid="logout"
        className={`rounded-full border border-ink px-4 py-2 font-semibold hover:bg-paper ${focusRingClassName}`}
      >
        Log out
      </button>
    </form>
  );
}
