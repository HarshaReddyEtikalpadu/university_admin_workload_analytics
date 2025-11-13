import React, { useEffect } from 'react';

const Calendar = () => {
  // Simple placeholder month grid
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const cells = Array.from({ length: 42 }, (_, i) => i + 1);

  useEffect(() => {
    console.log('[dev hint] If KPI values look wrong, inspect Dashboard diagnostics or CSV parsing code (utils/calculations or CSV parser).');
  }, []);

  return (
    <main className="ml-64 mt-20 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Calendar</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-7 text-center text-gray-500 mb-2">
            {days.map((d) => (
              <div key={d} className="py-2 font-medium">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {cells.map((c) => (
              <div key={c} className="h-24 border border-gray-100 rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Calendar;

