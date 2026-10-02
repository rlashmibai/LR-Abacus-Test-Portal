import { redirect } from "next/navigation";

// Registration is one page with a Student / Centre choice now - forward
// old links straight to the Centre option.
export default function CenterRegisterPage() {
  redirect("/register?type=centre");
}
