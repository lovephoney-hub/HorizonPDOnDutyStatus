'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type User = {
  id: string;
  name: string;
  EID: string;
  avatar_url: string | null;
  is_clocked_in: boolean;
  role: string;
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);


 const loadUsers = async () => {
  const { data } = await supabase
    .from('users')
    .select('*');

  const sortedUsers = (data || []).sort((a, b) => {
    // On duty first
    if (a.is_clocked_in !== b.is_clocked_in) {
      return a.is_clocked_in ? -1 : 1;
    }

    // Then sort by EID
    return Number(a.EID) - Number(b.EID);
  });

  setUsers(sortedUsers);
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
          user_name: user.name,
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

const getNameFontSize = (name: string) => {
  if (name.length <= 15) return 15;
  if (name.length <= 18) return 14;
  if (name.length <= 21) return 13;
  if (name.length <= 24) return 12;
  return 11;
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
{/* Banner */}
<div
  style={{
    width: '40%',
    height: '30%',
    overflow: 'hidden',
    borderRadius: '12px',
	margin: '0 auto',
  }}
>
  <img
    src="/avatars/Header.png"
    alt="Horizon EMS On Duty Status"
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      display: 'block',
      borderRadius: '12px',
    }}
  />
</div>

<div style={{ height: '40px' }}></div>

      {/* User Grid */}
		<div
		  style={{
			display: 'grid',
			gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
			gap: 24,
			width: '100%',
			maxWidth: '1400px',
			margin: '0 auto',
			boxSizing: 'border-box'
		  }}
		>

	{users.map(u => (
	  <div
		key={u.id}
		onClick={() => openConfirm(u)}
		style={{
		  width: 180,
		  height: 270,
		  borderRadius: 14,
		  overflow: 'hidden',
		  cursor: 'pointer',
		  position: 'relative',

		  backgroundImage: 'url("/avatars/id.png")',
		  backgroundSize: 'cover',
		  backgroundPosition: 'center',

		  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',

		  display: 'flex',
		  flexDirection: 'column',
		  alignItems: 'center',

		  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
		}}
	  >

		{/* Light overlay to make text easier to read */}
		<div
		  style={{
			position: 'absolute',
			inset: 0,
			backgroundColor: 'rgba(255,255,255,0.25)',
			pointerEvents: 'none'
		  }}
		/>

		{/* Content */}
		<div
		  style={{
			position: 'relative',
			zIndex: 1,
			width: '100%',
			height: '100%',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			paddingTop: 42,
			boxSizing: 'border-box'
		  }}
		>

		  {/* Avatar */}
		<img
		  src={u.avatar_url || ''}
		  alt={u.name}
		  style={{
			width: 82,
			height: 82,
			borderRadius: '50%',
			objectFit: 'cover',

			border: u.is_clocked_in
			  ? '4px solid #39ff14'
			  : '4px solid white',

			boxShadow: u.is_clocked_in
			  ? '0 0 10px #39ff14, 0 0 20px rgba(57,255,20,0.8)'
			  : '0 2px 6px rgba(0,0,0,0.3)',

			backgroundColor: u.is_clocked_in
			  ? '#39ff14'
			  : '#eee',

			marginBottom: 5
		  }}
		/>

		  {/* EID */}
		<div
		  style={{
			marginLeft: 5,
			//backgroundColor: 'red',
			//padding: '3px 12px',
			//borderRadius: 20,
			fontSize: 18,
			fontWeight: 800,
			marginBottom: 20,
			alignSelf: 'center',
			color: '#D64227',
			//boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
		  }}
		>
		  EID:{u.EID}
		</div>

		  {/* Name */}
		<div
		  style={{
			alignSelf: 'flex-start',
			marginLeft: 5,
			//backgroundColor: 'rgba(255,255,255,0.88)',
			//padding: '4px 10px',
			//borderRadius: 6,
			fontSize: getNameFontSize(u.name),
			fontWeight: 700,
			color: '#111',
			textAlign: 'left',
			whiteSpace: 'nowrap',
			lineHeight: 1.2,
			marginBottom: 10
		  }}
		>
		  Tên: {u.name}
		</div>

		  {/* Role */}
		<div
		  style={{
			alignSelf: 'flex-start',
			marginLeft: 5,
			//backgroundColor: 'rgba(255,255,255,0.80)',
			//padding: '3px 9px',
			borderRadius: 5,
			fontSize: 12,
			fontWeight: 600,
			color: '#333',
			textAlign: 'left'
		  }}
		>
		  {u.role}
		</div>

		  {/* Status */}
		  <div
			style={{
			  position: 'absolute',
			  bottom: 10,
			  display: 'flex',
			  alignItems: 'center',
			  gap: 7,
			  backgroundColor: 'rgba(255,255,255,0.9)',
			  padding: '5px 12px',
			  borderRadius: 20,
			  boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
			}}
		  >
			<div
			  style={{
				width: 14,
				height: 14,
				borderRadius: '50%',
				backgroundColor: u.is_clocked_in ? '#16a34a' : '#dc2626',
				boxShadow: `0 0 5px ${
				  u.is_clocked_in
					? 'rgba(22,163,74,0.6)'
					: 'rgba(220,38,38,0.6)'
				}`
			  }}
			/>

			<span
			  style={{
				fontSize: 11,
				fontWeight: 700,
				color: u.is_clocked_in ? '#166534' : '#991b1b'
			  }}
			>
			  {u.is_clocked_in ? 'ON DUTY' : 'OFF DUTY'}
			</span>
		  </div>

		</div>
	  </div>
	))}
      </div>

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
            <div
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 20
              }}
            >
            </div>

            <div style={{ marginBottom: 20 }}>
              {selectedUser.is_clocked_in
                ? 'Ngừng Chấm Công'
                : 'Bắt Đầu Chấm Công'} cho:
              <br />

              {/* EID + Name in Confirmation */}
              <strong>
                {selectedUser.EID} - {selectedUser.name}
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 20,
                justifyContent: 'center'
              }}
            >
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
