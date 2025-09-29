'use client';

export default function Footer() {
  return (
    <footer 
      className="w-full"
      style={{ 
        backgroundColor: '#3E1E68',
        height: '150px'
      }}
    >
      <div className="max-w-8xl mx-auto px-8 sm:px-12 lg:px-16 h-full flex items-center justify-end">
        <div className="text-right">
          <h2 className="text-white text-2xl font-bold mb-2">
            MUSE MUSIC
          </h2>
          <p className="text-white text-sm">
            &ldquo;Because music means more than sound.&rdquo;
          </p>
        </div>
      </div>
    </footer>
  );
}
