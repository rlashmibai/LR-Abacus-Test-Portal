import { redirect } from "next/navigation";

// Centres now sign in on the shared page - this address just forwards
// there so any old links or bookmarks keep working.
export default function CenterLoginPage() {
  redirect("/login");
}
