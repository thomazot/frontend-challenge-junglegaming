import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-heading text-primary">Catálogo de NFTs</h1>
      <p className="text-muted-foreground">O catálogo será implementado aqui.</p>
    </div>
  );
}
