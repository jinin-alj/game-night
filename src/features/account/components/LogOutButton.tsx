import { secondaryButtonClassName } from "@/components/styles";
import { logOut } from "../actions";

/** The Log out button shown in the header of every logged-in page. */
export function LogOutButton() {
  return (
    <form action={logOut}>
      <button
        type="submit"
        data-testid="logout"
        className={secondaryButtonClassName}
      >
        Log out
      </button>
    </form>
  );
}
