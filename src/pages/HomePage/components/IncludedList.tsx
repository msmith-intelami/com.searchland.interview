const includedItems = [
  "React + TypeScript + Vite",
  "React Router for multi-page UI",
  "JWT-based authentication",
  "RabbitMQ to MongoDB audit processing",
  "tRPC client/server wiring",
  "Drizzle schema and database access",
  "Feedback create, read, update, delete flow",
];

export function IncludedList() {
  return (
    <ul className="mt-4 space-y-3 text-slate-600">
      {includedItems.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
