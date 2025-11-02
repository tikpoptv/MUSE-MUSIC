import type { ProcessingDetail } from '@/services/songService';

interface SummarySectionProps {
  processingData: ProcessingDetail | null;
}

export default function SummarySection({ processingData }: SummarySectionProps) {
  const interpretation = processingData?.interpretation || processingData?.summary || '';
  
  // Remove "**Interpretation:**" or "Interpretation:" prefix if exists
  const cleanedInterpretation = interpretation
    .replace(/^\*\*Interpretation:\*\*\s*/i, '')
    .replace(/^Interpretation:\s*/i, '')
    .trim();

  if (!cleanedInterpretation) return null;

  return (
    <div style={{ width: '100%' }}>
      <label className="block mb-2" style={{ color: '#000', fontFamily: 'Inter', fontSize: '16px', fontWeight: 600, lineHeight: 'normal' }}>
        Summary
      </label>
      {/* Divider Line */}
      <div style={{ width: '100%', height: '1px', backgroundColor: '#7B61FF', marginBottom: '16px' }}></div>
      <div 
        style={{ 
          color: '#000', 
          fontFamily: 'Inter', 
          fontSize: '16px', 
          fontWeight: 400, 
          lineHeight: '1.6', 
          overflowWrap: 'break-word', 
          whiteSpace: 'normal',
          textAlign: 'justify'
        }}
      >
        {cleanedInterpretation}
      </div>
    </div>
  );
}

