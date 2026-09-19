import { redirect } from "next/navigation";

/**
 * The aggregator login has been moved to the hidden partner portal.
 * This redirect ensures the old URL still works.
 */
export default function AggregatorLoginRedirect() {
  redirect("/partner-access/login");
}
