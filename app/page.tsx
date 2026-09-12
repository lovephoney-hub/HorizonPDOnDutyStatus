'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type User = {
  id: string;
  name: string;
  avatar_url: string | null;
  is_clocked_in: boolean;
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const loadUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('name');
    setUsers(data || []);
  };

	useEffect(() => {
	  loadUsers();

	  const interval = setInterval(() => {
		loadUsers();
	  }, 5000); // refresh every 5 seconds

	  return () => clearInterval(interval);
	}, []);


  const toggleClock = async (user: User) => {
    const now = new Date();
    const utc7 = new Date(now.getTime() + 7 * 60 * 60 * 1000);

    if (!user.is_clocked_in) {
      await supabase
        .from('users')
        .update({ is_clocked_in: true })
        .eq('id', user.id);

		await supabase
		  .from('clock_records')
		  .insert({
			user_id: user.id,
			user_name: user.name,        // ← store name here
			clock_in_at: utc7.toISOString()
		  });


    } else {
      await supabase
        .from('users')
        .update({ is_clocked_in: false })
        .eq('id', user.id);

      const { data: openRecord } = await supabase
        .from('clock_records')
        .select('*')
        .eq('user_id', user.id)
        .is('clock_out_at', null)
        .single();

      if (openRecord) {
        const clockIn = new Date(openRecord.clock_in_at);
        const durationMs = utc7.getTime() - clockIn.getTime();
        const durationMinutes = Math.floor(durationMs / 60000);

        await supabase
          .from('clock_records')
          .update({
            clock_out_at: utc7.toISOString(),
            duration_minutes: durationMinutes
          })
          .eq('id', openRecord.id);
      }
    }

    loadUsers();
  };

  const openConfirm = (user: User) => {
    setSelectedUser(user);
    setShowConfirm(true);
  };

  const confirmAction = async () => {
    if (selectedUser) {
      await toggleClock(selectedUser);
    }
    setShowConfirm(false);
    setSelectedUser(null);
  };

  const cancelAction = () => {
    setShowConfirm(false);
    setSelectedUser(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: 'url("/horizonbg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '40px 20px'
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
          margin: '0 auto',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
        }}
      >
        Horizon PD On Duty Status
      </div>

      <div style={{ height: '40px' }}></div>

      {/* User Grid */}
		<div
		  style={{
			display: 'grid',
			gridTemplateColumns: 'repeat(7, 1fr)',   // ← 7 per row
			gap: 20,
			justifyItems: 'center',                  // ← center each card
			width: '100%',
			maxWidth: '1400px',
			margin: '0 auto'
		  }}
		>

        {users.map(u => (
          <div
            key={u.id}
            onClick={() => openConfirm(u)}
            style={{
              border: '1px solid #ccc',
              padding: 16,
              cursor: 'pointer',
              width: 140,
              borderRadius: 12,
              backgroundColor: 'white',
              color: 'black',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            <img
              src={u.avatar_url || ''}
              alt={u.name}
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: 10
              }}
            />

            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>
              {u.name}
            </div>

            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: u.is_clocked_in ? 'green' : 'red'
              }}
            />
          </div>
        ))}
      </div>

	  {/*//<div
		//  style={{
		//	position: 'fixed',        // ← sticks to screen
		//	bottom: 0,                // ← bottom of viewport
		//	left: 0,
		//	right: 0,
		//	backgroundColor: 'white',
		//	color: 'black',
		//	padding: '20px',
		//	borderRadius: '12px',
		//	textAlign: 'center',
		//	fontSize: '24px',
		//	fontWeight: 'bold',
		//	maxWidth: '600px',
		//	margin: '0 auto 20px auto',   // ← centers footer + spacing from bottom
		//	boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
		//	zIndex: 999                 // ← stays above page content
		//  }}
		//>
		//  <a href="/history" style={{ marginRight: 20 }}>History</a>
		//  <a href="/summary">Summary</a>
	  //</div> */}


      {/* Confirmation Modal */}
      {showConfirm && selectedUser && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
			color: 'black',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: 30,
              borderRadius: 12,
              textAlign: 'center',
              width: 300,
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
              
            </div>

            <div style={{ marginBottom: 20 }}>
              {selectedUser.is_clocked_in ? 'Ngừng Chấm Công' : 'Bắt Đầu Chấm Công'} cho:
              <br />
              <strong>{selectedUser.name}</strong>
            </div>

            <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
              <button
                onClick={confirmAction}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'green',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                Confirm
              </button>

              <button
                onClick={cancelAction}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'red',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
