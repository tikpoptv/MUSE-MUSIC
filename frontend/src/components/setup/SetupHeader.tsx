'use client';

interface SetupHeaderProps {
  title: string;
  description: string;
}

export default function SetupHeader({ title, description }: SetupHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        {title}
      </h1>
      <p className="text-sm text-gray-600">
        {description}
      </p>
    </div>
  );
}
