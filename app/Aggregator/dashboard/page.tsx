import AggregatorSidebar from "../components/AggregatorSidebar";

export default function AggregatorDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      
      <AggregatorSidebar />

      
      <main className="flex-1 p-8">
        <h1 className="text-4xl font-bold text-[#226049]">
          Aggregator Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Overview of the aggregation activities and batch flow.
        </p>
      </main>
    </div>
  );
}
