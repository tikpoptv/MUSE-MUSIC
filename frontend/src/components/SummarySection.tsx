import type { ProcessingDetail } from '@/services/songService';

interface SummarySectionProps {
  processingData: ProcessingDetail | null;
}

export default function SummarySection({ processingData }: SummarySectionProps) {
  const summaryText = (processingData?.interpretation || processingData?.summary || '')
    .replace(/^Interpretation:\s*/i, '');

  return (
    <div style={{ width: '100%' }}>
      <label className="block mb-2" style={{ color: '#000', fontFamily: 'Inter', fontSize: '16px', fontWeight: 600, lineHeight: 'normal' }}>
        Summary
      </label>
      {/* Divider Line */}
      <div style={{ width: '100%', height: '1px', backgroundColor: '#7B61FF', marginBottom: '16px' }}></div>
      <div style={{ color: '#000', fontFamily: 'Inter', fontSize: '16px', fontWeight: 400, lineHeight: 'normal', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
        {summaryText}
      </div>
    </div>
  );
}

