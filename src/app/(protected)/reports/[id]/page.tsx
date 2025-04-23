import { notFound } from 'next/navigation';
import ReportEditForm from '@/components/feature/report-details/ReportEditForm'; // Adjust path as needed
import { ReportDto } from '@/types'; // Assuming types are in src/types.ts

// --- Placeholder ---
// Replace with actual service import and implementation
const reportService = {
  async getReportDetails(id: number, userId: string): Promise<ReportDto | null> {
    console.log(`Fetching report ${id} for user ${userId}...`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    if (id === 999) return null; // Simulate Not Found
    if (id === 500) throw new Error("Simulated Server Error"); // Simulate Server Error

    return {
      id: id,
      userId: userId,
      title: `Sample Report ${id}`,
      originalText: "Original text for report " + id,
      summary: "<p>Summary for report " + id + "</p>",
      conclusions: "<p>Conclusions for report " + id + "</p>",
      keyData: "<p>Key data for report " + id + "</p>",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
};

// --- Placeholder ---
// Replace with actual function to get authenticated user ID
async function getUserId(): Promise<string> {
  // Simulate getting user ID (e.g., from session)
  return '1';
}
// --- End Placeholder ---


interface ReportDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function ReportDetailsPage({ params }: ReportDetailsPageProps) {
  const reportId = parseInt(params.id, 10);

  // Validate ID
  if (isNaN(reportId)) {
    notFound(); // Treat non-numeric ID as Not Found
  }

  const userId = await getUserId(); // Fetch user ID

  let reportData: ReportDto | null = null;
  try {
    reportData = await reportService.getReportDetails(reportId, userId);
  } catch (error) {
    console.error("Error fetching report details:", error);
    // Let Next.js handle the error via error.tsx
    // You might want more specific error handling here in a real app
    throw new Error('Failed to load report data.'); // Re-throw to trigger error boundary
  }


  // Handle Not Found specifically
  if (!reportData) {
    notFound();
  }

  // Render the form, passing the fetched data
  return (
    <div className="container mx-auto px-4 py-8">
      {/* We pass initialData, ReportEditForm will handle the form state */}
      <ReportEditForm initialData={reportData} />
    </div>
  );
} 