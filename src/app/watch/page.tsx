import { HeistSpectatorView } from "@/components/heist/HeistSpectatorView";

export const metadata = {
  title: "Watch Match | HashMatch",
  description: "Watch a Heist match unfold in real time.",
};

export default function WatchPage() {
  return <HeistSpectatorView />;
}
