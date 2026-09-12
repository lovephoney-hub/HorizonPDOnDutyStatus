'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

type ClockRecord = {
  user_name: string;
  clock_in_at: string;
  clock_out_at: string | null;
  duration_minutes: number | null;
};

export default function HistoryPage() {
  const [records, setRecords] = useState<ClockRecord[]>([]);

  const loadHistory = async () => {
    const { data } = await supabase
      .from('clock_records')
      .select('*')
      .order('clock_in_at', { ascending: false });

    setRecords(data || []);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div
      style={{
        padding: 20,
        minHeight: '100vh',
        backgroundImage: 'url("/horizonbg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
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
        Lịch Sử Chấm Công
      </div>

      {records.map((r, index) => {
        const duration = r.duration_minutes || 0;
        const hours = Math.floor(duration / 60);
        const mins = duration % 60;

        return (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              color: 'black',
              padding: 12,
              marginBottom: 10,
              borderRadius: 8,
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 500 }}>
              {r.user_name} — {r.clock_in_at} →{' '}
              {r.clock_out_at ? r.clock_out_at : 'Still working'} —{' '}
              {hours}H {mins}M
            </div>
          </div>
        );
      })}

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
          zIndex: 999
        }}
      >
        <a href="/" style={{ marginRight: 20 }}>Home</a>
        <a href="/summary">Summary</a>
      </div>
    </div>
  );
}
