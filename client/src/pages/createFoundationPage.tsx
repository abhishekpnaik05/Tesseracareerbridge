import { FoundationPage } from "../components/FoundationPage";

export function createFoundationPage(area: string, title: string, summary: string) {
  return function Page() {
    return <FoundationPage area={area} title={title} summary={summary} />;
  };
}
