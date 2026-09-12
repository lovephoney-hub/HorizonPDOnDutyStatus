'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

// The shape of each row returned from Supabase
type ClockRecord = {
  user_name: string;
  duration_minutes: number | null;
  clock_in_at: string;
};

// The shape of each summary item we display
type SummaryItem = {
  user_name: string;
  total_hours_text: string;
};

export default function SummaryPage() {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [summary, setSummary] = useState<SummaryItem[]>([]);

  const loadSummary = async () => {
    if (!startDate || !endDate) {
      setSummary([]);
      return;
    }

    const start = `${startDate} 00:00:00`;
    const end = `${endDate} 23:59:59`;

    const { data, error } = await supabase
      .from('clock_records')
      .select('user_name, duration_minutes, clock_in_at')
      .gte('clock_in_at', start)
      .lte('clock_in_at', end);

    if (error) {
      console.error(error);
      return;
    }

    // Type the data from Supabase
    const typedData = (data || []) as ClockRecord[];

    // Group by user_name
    const grouped: Record<string, number> = {};

    typedData.forEach((r) => {
      const mins = r.duration_minutes ?? 0;
      grouped[r.user_name] = (grouped[r.user_name] || 0) + mins;
    });

    // Convert grouped totals into summary items
    const final: SummaryItem[] = Object.entries(grouped).map(([name, minutes]) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;

      return {
        user_name: name,
        total_hours_text: `${hours}H ${mins}M`,
      };
    });

    setSummary(final);
  };

  useEffect(() => {
    loadSummary();
  }, [startDate, endDate]);

  return (
    <div
      style={{
        padding: 20,
        minHeight: '100vh',
        backgroundImage: 'url("/horizonbg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
	
      {/* Header Box */}
      <div
        style={{
          backgroundColor: 'white',
          color: 'blue',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          maxWidth: '600px',
          margin: '20 auto',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
        }}
      >
        Bản Tính Lương
      </div>

      {/* Date Range Filter */}
      <div style={{ marginBottom: 20, color: 'white', fontSize: 18 }}>
        <div style={{ marginBottom: 10 }}>
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 8,
              marginLeft: 10,
              fontSize: 16,
            }}
          />
        </div>

        <div>
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 8,
              marginLeft: 22,
              fontSize: 16,
            }}
          />
        </div>
      </div>

      {/* Summary Results */}
      {summary.map((s, index) => (
        <div
          key={index}
          style={{
            backgroundColor: 'white',
            color: 'black',
            padding: 12,
            marginBottom: 10,
            borderRadius: 8,
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          }}
        >
          <div><strong>Name:</strong> {s.user_name}</div>
          <div><strong>Total Time:</strong> {s.total_hours_text}</div>
        </div>
      ))}

      {/* Footer */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          color: 'black',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          maxWidth: '600px',
          margin: '0 auto 20px auto',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          zIndex: 999,
        }}
      >
        <a href="/history" style={{ marginRight: 20 }}>History</a>
        <a href="/">Home</a>
      </div>
    </div>
  );
}
